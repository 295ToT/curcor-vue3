<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  DataLine,
  Histogram,
  PictureFilled,
  Postcard,
  Reading,
  School,
  User,
  UserFilled,
} from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useUiStore } from '../../stores/ui'
import type { AppLocale } from '../../i18n'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const { t, locale } = useI18n()

/** 顶栏头像与主题按钮统一尺寸（px） */
const headerControlPx = 32

const activeMenu = computed(() => {
  if (route.path.startsWith('/students')) return '/students'
  if (route.path.startsWith('/teachers')) return '/teachers'
  if (route.path.startsWith('/reports')) return '/reports'
  if (route.path.startsWith('/learn')) return '/learn'
  return route.path
})

const headerTitle = computed(() => {
  const key = route.meta?.titleKey as string | undefined
  return key ? String(t(key)) : String(t('app.title'))
})

function onLocaleCommand(cmd: string) {
  if (cmd === 'zh-CN' || cmd === 'en-US') locale.value = cmd as AppLocale
}

/** 头像展示：用户名首字（大写），无用户时用 ? */
const avatarChar = computed(() => {
  const name = auth.user?.username?.trim()
  if (!name) return '?'
  return name.slice(0, 1).toUpperCase()
})

function go(path: string) {
  void router.push(path)
}

function logout() {
  auth.logout()
  void router.replace('/login')
}

</script>

<template>
  <el-container class="layout">
    <el-aside class="aside" width="220px">
      <div class="brand" @click="go('/students')">
        <div class="brand__title">{{ t('app.title') }}</div>
        <div class="brand__sub">{{ t('app.stack') }}</div>
      </div>

      <el-menu :default-active="activeMenu" class="menu" router>
        <el-menu-item index="/students">
          <el-icon>
            <component :is="activeMenu === '/students' ? UserFilled : User" />
          </el-icon>
          <span>{{ t('route.students') }}</span>
        </el-menu-item>
        <el-menu-item index="/teachers">
          <el-icon>
            <component :is="activeMenu === '/teachers' ? School : Postcard" />
          </el-icon>
          <span>{{ t('route.teachers') }}</span>
        </el-menu-item>
        <el-menu-item index="/learn">
          <el-icon>
            <component :is="activeMenu === '/learn' ? PictureFilled : Reading" />
          </el-icon>
          <span>{{ t('route.learn') }}</span>
        </el-menu-item>
        <el-menu-item index="/reports">
          <el-icon>
            <component :is="activeMenu === '/reports' ? Histogram : DataLine" />
          </el-icon>
          <span>{{ t('route.reports') }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header__left">
          <div class="header__title">{{ headerTitle }}</div>
        </div>
        <div class="header__right">
          <el-dropdown trigger="click" @command="onLocaleCommand">
            <el-button class="lang-btn" size="small">
              {{ locale === 'zh-CN' ? t('layout.langZh') : t('layout.langEn') }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN">{{ t('layout.langZh') }}</el-dropdown-item>
                <el-dropdown-item command="en-US">{{ t('layout.langEn') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-tooltip :content="ui.theme === 'light' ? t('layout.themeToDark') : t('layout.themeToLight')">
            <el-button
              circle
              class="theme-btn"
              :style="{
                width: `${headerControlPx}px`,
                height: `${headerControlPx}px`,
                minWidth: `${headerControlPx}px`,
                minHeight: `${headerControlPx}px`,
              }"
              @click="ui.toggleTheme"
            >
              <el-icon v-if="ui.theme === 'light'"><Moon /></el-icon>
              <el-icon v-else><Sunny /></el-icon>
            </el-button>
          </el-tooltip>
          <el-dropdown trigger="click">
            <span class="user">
              <el-avatar :size="headerControlPx" class="user__avatar">{{ avatarChar }}</el-avatar>
              <span class="user__name">{{ auth.user?.username ?? t('layout.notLoggedIn') }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">{{ t('layout.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--bg-main);
}
.aside {
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  border-right: 1px solid var(--sidebar-border);
}
.brand {
  padding: 16px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--sidebar-border);
}
.brand__title {
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--sidebar-text);
}
.brand__sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--sidebar-muted);
}
.menu {
  border-right: none;
  background: transparent;
  --el-menu-bg-color: transparent;
  --el-menu-text-color: var(--sidebar-text);
  --el-menu-hover-bg-color: var(--sidebar-active-bg);
  --el-menu-active-color: var(--sidebar-active-text);
}
.menu :deep(.el-menu-item) {
  color: var(--sidebar-text);
}
.menu :deep(.el-menu-item:hover) {
  background-color: var(--sidebar-active-bg);
}
.menu :deep(.el-menu-item.is-active) {
  color: var(--sidebar-active-text);
  background-color: var(--sidebar-active-bg);
}
.menu :deep(.el-icon) {
  color: inherit;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border);
}
.header__left {
  display: flex;
  align-items: center;
  min-height: 100%;
}
.header__right {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 100%;
}
/* 与主题按钮同一基线：tooltip / 下拉触发器垂直居中 */
.header__right :deep(.el-tooltip__trigger) {
  display: inline-flex;
  align-items: center;
}
.header__right :deep(.el-dropdown) {
  display: inline-flex;
  align-items: center;
}
.header__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-h);
}
.user {
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  color: var(--text);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px;
  border-radius: 8px;
  outline: none;
}
.user:hover {
  background: var(--sidebar-active-bg);
}
.user__avatar {
  flex-shrink: 0;
  --el-avatar-bg-color: var(--el-color-primary);
  --el-avatar-text-color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.user__name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lang-btn {
  margin-right: 8px;
}
.theme-btn {
  margin: 0;
  padding: 0 !important;
  box-sizing: border-box;
}
.theme-btn :deep(.el-icon) {
  font-size: 18px;
}
.main {
  padding: 18px;
}
</style>
