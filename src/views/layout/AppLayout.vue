<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DataLine,
  Histogram,
  PictureFilled,
  Reading,
  User,
  UserFilled,
} from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useUiStore } from '../../stores/ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const activeMenu = computed(() => {
  if (route.path.startsWith('/students')) return '/students'
  if (route.path.startsWith('/reports')) return '/reports'
  if (route.path.startsWith('/learn')) return '/learn'
  return route.path
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
        <div class="brand__title">学生管理系统</div>
        <div class="brand__sub">Vue 3 + Element Plus</div>
      </div>

      <el-menu :default-active="activeMenu" class="menu" router>
        <el-menu-item index="/students">
          <el-icon>
            <component :is="activeMenu === '/students' ? UserFilled : User" />
          </el-icon>
          <span>学生管理</span>
        </el-menu-item>
        <el-menu-item index="/learn">
          <el-icon>
            <component :is="activeMenu === '/learn' ? PictureFilled : Reading" />
          </el-icon>
          <span>学习资源</span>
        </el-menu-item>
        <el-menu-item index="/reports">
          <el-icon>
            <component :is="activeMenu === '/reports' ? Histogram : DataLine" />
          </el-icon>
          <span>统计报表</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header__left">
          <div class="header__title">学生管理</div>
        </div>
        <div class="header__right">
          <el-tooltip :content="ui.theme === 'light' ? '切换为暗色' : '切换为亮色'">
            <el-button circle size="small" class="theme-btn" @click="ui.toggleTheme">
              <el-icon v-if="ui.theme === 'light'"><Moon /></el-icon>
              <el-icon v-else><Sunny /></el-icon>
            </el-button>
          </el-tooltip>
          <el-dropdown trigger="click">
            <span class="user">
              {{ auth.user?.username ?? '未登录' }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
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
.header__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-h);
}
.user {
  cursor: pointer;
  font-size: 13px;
  color: var(--text);
}
.theme-btn {
  margin-right: 12px;
}
.main {
  padding: 18px;
}
</style>
