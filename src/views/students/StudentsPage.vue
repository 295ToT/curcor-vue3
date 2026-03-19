<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useStudentsStore, type Gender, type Student } from '../../stores/students'
import { extractGrade, getClasses, getGrades } from '../../utils/student'
import * as XLSX from 'xlsx'

const store = useStudentsStore()
watchEffect(() => {
  store.seedIfEmpty()
})

const keyword = ref('')
const grade = ref<string>('全部')
const className = ref<string>('全部')
const page = ref(1)
const pageSize = ref(10)

const gradeOptions = computed(() => ['全部', ...getGrades(store.students)])
const classOptions = computed(() => ['全部', ...getClasses(store.students)])

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return store.students.filter((s) => {
    const gradeOk = grade.value === '全部' ? true : extractGrade(s.className) === grade.value
    const classOk = className.value === '全部' ? true : s.className === className.value
    const keywordOk = !q ? true : s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q)
    return gradeOk && classOk && keywordOk
  })
})

watchEffect(() => {
  // reset page when filters change
  void keyword.value
  void grade.value
  void className.value
  page.value = 1
})

const dialogOpen = ref(false)
const mode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const editingId = ref<string | null>(null)

type StudentForm = {
  name: string
  age: number | null
  gender: Gender
  className: string
}

const form = reactive<StudentForm>({
  name: '',
  age: null,
  gender: '男',
  className: '',
})

const rules: FormRules<StudentForm> = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  age: [
    { required: true, message: '请输入年龄', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        const n = Number(value)
        if (!Number.isFinite(n) || n < 1 || n > 100) callback(new Error('年龄范围 1-100'))
        else callback()
      },
      trigger: 'change',
    },
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
}

function resetForm() {
  form.name = ''
  form.age = null
  form.gender = '男'
  form.className = ''
}

function openCreate() {
  mode.value = 'create'
  editingId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEdit(s: Student) {
  mode.value = 'edit'
  editingId.value = s.id
  form.name = s.name
  form.age = s.age
  form.gender = s.gender
  form.className = s.className
  dialogOpen.value = true
}

async function submit() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return

  if (mode.value === 'create') {
    store.addStudent({
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      className: form.className,
    })
    ElMessage.success('已新增')
    dialogOpen.value = false
    return
  }

  const id = editingId.value
  if (!id) return
  store.updateStudent(id, {
    name: form.name,
    age: Number(form.age),
    gender: form.gender,
    className: form.className,
  })
  ElMessage.success('已保存')
  dialogOpen.value = false
}

async function remove(s: Student) {
  const confirmed = await ElMessageBox.confirm(`确定删除学生「${s.name}」吗？`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false)
  if (!confirmed) return
  store.removeStudent(s.id)
  ElMessage.success('已删除')
}

const total = computed(() => filtered.value.length)
const pageData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function exportExcel() {
  const rows = filtered.value.map((s) => ({
    姓名: s.name,
    年龄: s.age,
    性别: s.gender,
    班级: s.className,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '学生')
  XLSX.writeFile(wb, `学生数据_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function importExcel(file: File) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) {
    ElMessage.error('Excel 中没有工作表')
    return
  }
  const ws = wb.Sheets[sheetName]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
  let added = 0
  for (const r of json) {
    const name = String(r['姓名'] ?? r['name'] ?? '').trim()
    const age = Number(r['年龄'] ?? r['age'])
    const genderRaw = String(r['性别'] ?? r['gender'] ?? '').trim()
    const gender: Gender = genderRaw === '女' ? '女' : '男'
    const c = String(r['班级'] ?? r['className'] ?? '').trim()
    if (!name || !Number.isFinite(age) || age <= 0 || !c) continue
    store.addStudent({ name, age, gender, className: c })
    added += 1
  }
  ElMessage.success(`导入完成，新增 ${added} 条`)
}
</script>

<template>
  <div class="page-students">
  <el-card shadow="never">
    <template #header>
      <div class="header">
        <div class="header__title">学生列表</div>
        <div class="header__actions">
          <el-select v-model="grade" style="width: 140px" placeholder="年级">
            <el-option v-for="g in gradeOptions" :key="g" :label="g" :value="g" />
          </el-select>
          <el-select v-model="className" style="width: 170px" placeholder="班级">
            <el-option v-for="c in classOptions" :key="c" :label="c" :value="c" />
          </el-select>
          <el-input v-model="keyword" placeholder="搜索姓名/班级" style="width: 240px" clearable />
          <el-upload
            :show-file-list="false"
            accept=".xlsx,.xls"
            :before-upload="
              (f: File) => {
                void importExcel(f)
                return false
              }
            "
          >
            <el-button>导入 Excel</el-button>
          </el-upload>
          <el-button @click="exportExcel">导出 Excel</el-button>
          <el-button type="primary" @click="openCreate">新增学生</el-button>
        </div>
      </div>
    </template>

    <el-table v-if="total > 0" :data="pageData" style="width: 100%">
      <el-table-column label="姓名" prop="name" min-width="120" />
      <el-table-column label="年龄" prop="age" width="90" />
      <el-table-column label="性别" prop="gender" width="90" />
      <el-table-column label="班级" prop="className" min-width="140" />
      <el-table-column label="操作" width="180" align="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="暂无数据，先新增一个学生吧" />

    <div v-if="total > 0" class="pager">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      />
    </div>
  </el-card>

  <el-dialog v-model="dialogOpen" :title="mode === 'create' ? '新增学生' : '编辑学生'" width="520px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="form.age" :min="1" :max="100" style="width: 100%" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="form.gender">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="班级" prop="className">
        <el-input v-model="form.className" placeholder="例如：高一(1)班" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogOpen = false">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
  </div>
</template>

<style scoped>
.page-students :deep(.el-card) {
  background: var(--card-bg);
  border-color: var(--border);
  color: var(--text);
}
.page-students :deep(.el-card__header) {
  border-bottom-color: var(--border);
  color: var(--text-h);
}
.page-students :deep(.el-table) {
  --el-table-bg-color: var(--card-bg);
  --el-table-tr-bg-color: var(--card-bg);
  --el-table-header-bg-color: var(--table-header-bg);
  --el-table-row-hover-bg-color: var(--table-row-hover);
  --el-table-border-color: var(--border);
  --el-table-text-color: var(--text);
  --el-table-header-text-color: var(--text-h);
}
.page-students :deep(.el-table th.el-table__cell) {
  background-color: var(--table-header-bg);
  color: var(--text-h);
}
.page-students :deep(.el-table td.el-table__cell) {
  border-color: var(--border);
}
.page-students :deep(.el-pagination) {
  --el-pagination-text-color: var(--text);
  --el-pagination-button-color: var(--text);
  --el-disabled-bg-color: var(--card-bg);
}
.page-students :deep(.el-dialog) {
  --el-dialog-bg-color: var(--card-bg);
}
.page-students :deep(.el-dialog__title) {
  color: var(--text-h);
}
.page-students :deep(.el-form-item__label) {
  color: var(--text);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.header__title {
  font-size: 16px;
  font-weight: 600;
}
.header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
