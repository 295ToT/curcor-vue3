import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { createPinia } from 'pinia'
import router from './router'
import { i18n } from './i18n'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
/* 暗色主题：在 <html class="dark"> 时生效，按钮/输入框等会跟随变色 */
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
