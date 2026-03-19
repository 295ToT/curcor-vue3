<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

type LoginForm = {
  username: string
  password: string
}

const form = reactive<LoginForm>({
  username: 'admin',
  password: '',
})

const rules: FormRules<LoginForm> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function submit() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  loading.value = true
  try {
    const authed = auth.login(form.username, form.password)
    if (!authed) {
      ElMessage.error('账号或密码错误（demo: admin / 123456）')
      return
    }
    ElMessage.success('登录成功')
    await router.replace('/students')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <el-card class="card" shadow="never">
      <div class="title">学生管理系统</div>
      <div class="sub">登录后进入管理后台</div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password autocomplete="current-password" />
        </el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%" @click="submit">登录</el-button>
      </el-form>

      <div class="hint">Demo 账号：admin，密码：123456</div>
    </el-card>
  </div>
</template>

<style scoped>
.wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(1200px 600px at 20% 10%, #e6f0ff 0%, transparent 60%),
    radial-gradient(1200px 600px at 80% 20%, #e7fff6 0%, transparent 60%), #f5f7fa;
  padding: 20px;
}
.card {
  width: 420px;
  max-width: 100%;
}
.title {
  font-size: 18px;
  font-weight: 700;
}
.sub {
  margin-top: 6px;
  margin-bottom: 14px;
  color: rgba(0, 0, 0, 0.55);
  font-size: 13px;
}
.hint {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
</style>

