<script setup lang="ts">
import { computed, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useUiStore } from './stores/ui'
import { persistLocale, type AppLocale } from './i18n'

const ui = useUiStore()
const { locale } = useI18n()

watchEffect(() => {
  const root = document.documentElement
  root.dataset.theme = ui.theme
  root.classList.toggle('dark', ui.theme === 'dark')
})

watch(
  locale,
  (l) => {
    persistLocale(l as AppLocale)
  },
  { flush: 'post' },
)

const elementLocale = computed(() => (locale.value === 'zh-CN' ? zhCn : en))
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
  </el-config-provider>
</template>
