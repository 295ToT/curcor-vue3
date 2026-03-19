<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import type { AppLocale } from '../../i18n'

const router = useRouter()
const auth = useAuthStore()
const { t, locale } = useI18n()

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

const rules = computed<FormRules<LoginForm>>(() => ({
  username: [{ required: true, message: t('login.usernameRequired'), trigger: 'blur' }],
  password: [{ required: true, message: t('login.passwordRequired'), trigger: 'blur' }],
}))

function onLocaleCommand(cmd: string) {
  if (cmd === 'zh-CN' || cmd === 'en-US') locale.value = cmd as AppLocale
}

async function submit() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  loading.value = true
  try {
    const authed = auth.login(form.username, form.password)
    if (!authed) {
      ElMessage.error(t('login.fail'))
      return
    }
    ElMessage.success(t('login.success'))
    await router.replace('/students')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <div class="toolbar">
      <el-dropdown trigger="click" @command="onLocaleCommand">
        <el-button size="small">{{ locale === 'zh-CN' ? t('layout.langZh') : t('layout.langEn') }}</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN">{{ t('layout.langZh') }}</el-dropdown-item>
            <el-dropdown-item command="en-US">{{ t('layout.langEn') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-card class="card" shadow="never">
      <div class="title">{{ t('login.title') }}</div>
      <div class="sub">{{ t('login.sub') }}</div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item :label="t('login.username')" prop="username">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item :label="t('login.password')" prop="password">
          <el-input v-model="form.password" type="password" show-password autocomplete="current-password" />
        </el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%" @click="submit">{{ t('login.submit') }}</el-button>
      </el-form>

      <div class="hint">{{ t('login.hint') }}</div>
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
  position: relative;
}
.toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
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
