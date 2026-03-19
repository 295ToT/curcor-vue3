<script setup lang="ts">
import { watchEffect } from 'vue'
import { useUiStore } from './stores/ui'

const ui = useUiStore()
watchEffect(() => {
  const root = document.documentElement
  root.dataset.theme = ui.theme
  root.classList.toggle('dark', ui.theme === 'dark')
})
</script>

<template>
  <router-view />
</template>
