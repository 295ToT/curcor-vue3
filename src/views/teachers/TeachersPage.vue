<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useTeachersStore, type Gender, type Teacher } from '../../stores/teachers'
import * as XLSX from 'xlsx'

const FILTER_ALL = '__all__'

const { t } = useI18n()
const store = useTeachersStore()
watchEffect(() => {
  store.seedIfEmpty()
})

const keyword = ref('')
const subjectFilter = ref(FILTER_ALL)
const page = ref(1)
const pageSize = ref(10)

const subjectOptions = computed(() => {
  const set = new Set<string>()
  for (const x of store.teachers) {
    if (x.subject) set.add(x.subject)
  }
  return [FILTER_ALL, ...Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'))]
})

function subjectLabel(value: string) {
  return value === FILTER_ALL ? t('common.all') : value
}

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return store.teachers.filter((x) => {
    const subOk = subjectFilter.value === FILTER_ALL ? true : x.subject === subjectFilter.value
    const kwOk =
      !q ||
      x.name.toLowerCase().includes(q) ||
      x.subject.toLowerCase().includes(q) ||
      x.title.toLowerCase().includes(q) ||
      x.phone.includes(q)
    return subOk && kwOk
  })
})

watchEffect(() => {
  void keyword.value
  void subjectFilter.value
  page.value = 1
})

const dialogOpen = ref(false)
const mode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const editingId = ref<string | null>(null)

type TeacherForm = {
  name: string
  gender: Gender
  subject: string
  title: string
  phone: string
}

const form = reactive<TeacherForm>({
  name: '',
  gender: '男',
  subject: '',
  title: '',
  phone: '',
})

const rules = computed<FormRules<TeacherForm>>(() => ({
  name: [{ required: true, message: t('teachers.nameRequired'), trigger: 'blur' }],
  gender: [{ required: true, message: t('teachers.genderRequired'), trigger: 'change' }],
  subject: [{ required: true, message: t('teachers.subjectRequired'), trigger: 'blur' }],
  phone: [
    {
      validator: (_r, v, cb) => {
        const s = String(v ?? '').trim()
        if (!s) {
          cb()
          return
        }
        if (!/^1\d{10}$/.test(s)) cb(new Error(t('teachers.phoneInvalid')))
        else cb()
      },
      trigger: 'blur',
    },
  ],
}))

function resetForm() {
  form.name = ''
  form.gender = '男'
  form.subject = ''
  form.title = ''
  form.phone = ''
}

function openCreate() {
  mode.value = 'create'
  editingId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEdit(x: Teacher) {
  mode.value = 'edit'
  editingId.value = x.id
  form.name = x.name
  form.gender = x.gender
  form.subject = x.subject
  form.title = x.title
  form.phone = x.phone
  dialogOpen.value = true
}

async function submit() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return

  if (mode.value === 'create') {
    store.addTeacher({
      name: form.name,
      gender: form.gender,
      subject: form.subject,
      title: form.title,
      phone: form.phone,
    })
    ElMessage.success(t('teachers.added'))
    dialogOpen.value = false
    return
  }

  const id = editingId.value
  if (!id) return
  store.updateTeacher(id, {
    name: form.name,
    gender: form.gender,
    subject: form.subject,
    title: form.title,
    phone: form.phone,
  })
  ElMessage.success(t('teachers.saved'))
  dialogOpen.value = false
}

async function remove(x: Teacher) {
  const confirmed = await ElMessageBox.confirm(t('teachers.deleteTeacher', { name: x.name }), t('common.deleteConfirmTitle'), {
    confirmButtonText: t('common.delete'),
    cancelButtonText: t('common.cancel'),
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false)
  if (!confirmed) return
  store.removeTeacher(x.id)
  ElMessage.success(t('teachers.deleted'))
}

const total = computed(() => filtered.value.length)
const pageData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function exportExcel() {
  const rows = filtered.value.map((x) => ({
    [t('teachers.colName')]: x.name,
    [t('teachers.colGender')]: x.gender,
    [t('teachers.colSubject')]: x.subject,
    [t('teachers.colTitle')]: x.title,
    [t('teachers.colPhone')]: x.phone,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, t('teachers.sheetName'))
  XLSX.writeFile(wb, `${t('teachers.filePrefix')}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

async function importExcel(file: File) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) {
    ElMessage.error(t('common.noSheet'))
    return
  }
  const ws = wb.Sheets[sheetName]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
  let added = 0
  for (const r of json) {
    const name = String(r['姓名'] ?? r['name'] ?? r[t('teachers.colName')] ?? '').trim()
    const genderRaw = String(r['性别'] ?? r['gender'] ?? r[t('teachers.colGender')] ?? '').trim()
    const gender: Gender = genderRaw === '女' || genderRaw === 'Female' || genderRaw === 'F' ? '女' : '男'
    const subject = String(r['科目'] ?? r['任教科目'] ?? r['subject'] ?? r[t('teachers.colSubject')] ?? '').trim()
    const title = String(r['职称'] ?? r['title'] ?? r[t('teachers.colTitle')] ?? '').trim()
    const phone = String(r['手机'] ?? r['phone'] ?? r[t('teachers.colPhone')] ?? '').trim()
    if (!name || !subject) continue
    store.addTeacher({ name, gender, subject, title, phone })
    added += 1
  }
  ElMessage.success(t('teachers.importDone', { n: added }))
}
</script>

<template>
  <div class="page-teachers">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="header__title">{{ t('teachers.listTitle') }}</div>
          <div class="header__actions">
            <el-select v-model="subjectFilter" style="width: 140px" :placeholder="t('teachers.subject')">
              <el-option v-for="s in subjectOptions" :key="s" :label="subjectLabel(s)" :value="s" />
            </el-select>
            <el-input v-model="keyword" :placeholder="t('teachers.searchPlaceholder')" style="width: 240px" clearable />
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
              <el-button>{{ t('common.importExcel') }}</el-button>
            </el-upload>
            <el-button @click="exportExcel">{{ t('common.exportExcel') }}</el-button>
            <el-button type="primary" @click="openCreate">{{ t('teachers.addTeacher') }}</el-button>
          </div>
        </div>
      </template>

      <el-table v-if="total > 0" :data="pageData" style="width: 100%">
        <el-table-column :label="t('teachers.colName')" prop="name" min-width="100" />
        <el-table-column :label="t('teachers.colGender')" prop="gender" width="80" />
        <el-table-column :label="t('teachers.teachSubject')" prop="subject" min-width="100" />
        <el-table-column :label="t('teachers.titleLabel')" prop="title" min-width="100" />
        <el-table-column :label="t('teachers.phone')" prop="phone" min-width="120" />
        <el-table-column :label="t('common.actions')" width="180" align="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">{{ t('common.edit') }}</el-button>
            <el-button size="small" type="danger" plain @click="remove(row)">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-else :description="t('teachers.empty')" />

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

    <el-dialog v-model="dialogOpen" :title="mode === 'create' ? t('teachers.addTitle') : t('teachers.editTitle')" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item :label="t('teachers.name')" prop="name">
          <el-input v-model="form.name" :placeholder="t('teachers.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('teachers.gender')" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="男">{{ t('common.male') }}</el-radio>
            <el-radio label="女">{{ t('common.female') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('teachers.teachSubject')" prop="subject">
          <el-input v-model="form.subject" :placeholder="t('teachers.subjectPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('teachers.titleLabel')" prop="title">
          <el-input v-model="form.title" :placeholder="t('teachers.titlePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('teachers.phone')" prop="phone">
          <el-input v-model="form.phone" :placeholder="t('teachers.phonePlaceholder')" maxlength="11" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogOpen = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submit">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-teachers :deep(.el-card) {
  background: var(--card-bg);
  border-color: var(--border);
  color: var(--text);
}
.page-teachers :deep(.el-card__header) {
  border-bottom-color: var(--border);
  color: var(--text-h);
}
.page-teachers :deep(.el-table) {
  --el-table-bg-color: var(--card-bg);
  --el-table-tr-bg-color: var(--card-bg);
  --el-table-header-bg-color: var(--table-header-bg);
  --el-table-row-hover-bg-color: var(--table-row-hover);
  --el-table-border-color: var(--border);
  --el-table-text-color: var(--text);
  --el-table-header-text-color: var(--text-h);
}
.page-teachers :deep(.el-table th.el-table__cell) {
  background-color: var(--table-header-bg);
  color: var(--text-h);
}
.page-teachers :deep(.el-table td.el-table__cell) {
  border-color: var(--border);
}
.page-teachers :deep(.el-pagination) {
  --el-pagination-text-color: var(--text);
  --el-pagination-button-color: var(--text);
  --el-disabled-bg-color: var(--card-bg);
}
.page-teachers :deep(.el-dialog) {
  --el-dialog-bg-color: var(--card-bg);
}
.page-teachers :deep(.el-dialog__title) {
  color: var(--text-h);
}
.page-teachers :deep(.el-form-item__label) {
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
