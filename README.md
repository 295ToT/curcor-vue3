# 学生管理系统（student-admin）

基于 **Vue 3 + TypeScript + Vite** 的前端示例项目，提供学生信息管理、学习资源入口、统计报表、登录与亮/暗主题切换等功能。数据默认保存在浏览器 **localStorage**（无后端时可本地演示）。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3（`<script setup>` + Composition API） |
| 语言 | TypeScript |
| 构建 | Vite 8 |
| 路由 | Vue Router 5（路由懒加载） |
| 状态 | Pinia 3 |
| UI | Element Plus 2 + @element-plus/icons-vue |
| 图表 | ECharts 6 |
| 表格 | xlsx（Excel 导入/导出） |

## 功能概览

- **登录**：路由守卫，未登录跳转登录页；演示账号见下文。
- **学生管理**：列表、新增/编辑/删除、按年级/班级筛选、关键词搜索、分页。
- **Excel**：导入 `.xlsx/.xls`（表头支持「姓名、年龄、性别、班级」或英文列名）；导出当前筛选结果。
- **统计报表**：人数汇总 + ECharts（性别、年级、班级 Top 等）。
- **学习资源**：分类与搜索，卡片跳转外部链接；资源列表可持久化。
- **主题**：右上角按钮切换 **亮色 / 暗色**（`data-theme` + `html.dark` + Element Plus 暗色变量）；侧栏、主内容区、表格等与主题联动。

## 快速开始

### 环境要求

- Node.js 18+（推荐 LTS）
- npm 或 pnpm / yarn

### 安装依赖

```bash
cd student-admin
npm install
```

### 本地开发

```bash
npm run dev
```

浏览器访问终端提示的地址（一般为 `http://127.0.0.1:5173`）。

### 生产构建

```bash
npm run build
```

产物在 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

## 演示账号

| 用户名 | 密码 |
|--------|------|
| `admin` | `123456` |

> 登录逻辑为前端演示用，生产环境请对接真实鉴权与接口。

## 目录结构（简要）

```
student-admin/
├── index.html
├── package.json
├── vite.config.ts
├── src/
│   ├── main.ts              # 入口：Pinia、Router、Element Plus、暗色 CSS 变量
│   ├── App.vue              # 全局主题同步（data-theme / html.dark）
│   ├── style.css            # 全局 CSS 变量（亮/暗、侧栏、卡片等）
│   ├── router/index.ts      # 路由与懒加载、登录守卫
│   ├── stores/              # Pinia：auth、students、resources、ui
│   ├── utils/student.ts     # 年级解析等工具
│   └── views/
│       ├── layout/AppLayout.vue   # 侧栏 + 顶栏 + 主题按钮
│       ├── auth/LoginPage.vue
│       ├── students/StudentsPage.vue
│       ├── reports/ReportsPage.vue
│       └── learn/LearnPage.vue
└── README.md
```

## 本地存储说明

以下 key 用于演示数据持久化（可在浏览器开发者工具 → Application → Local Storage 中查看）：

| Key 前缀 / 说明 | 用途 |
|-----------------|------|
| `student-admin:students:v1` | 学生列表 |
| `student-admin:auth:v1` | 登录状态 |
| `student-admin:resources:v1` | 学习资源列表 |
| `student-admin:ui:v2` | 亮/暗主题偏好 |

清除站点数据可恢复为「空数据 + 默认主题」（学生页会在无数据时写入少量种子数据，便于体验）。

## 路由一览

| 路径 | 说明 | 需登录 |
|------|------|--------|
| `/login` | 登录 | 否 |
| `/students` | 学生管理 | 是 |
| `/learn` | 学习资源 | 是 |
| `/reports` | 统计报表 | 是 |

## 常见问题

1. **Excel 导入没反应**  
   检查首行表头是否为「姓名、年龄、性别、班级」，且年龄为数字、班级非空。

2. **暗色下某块区域颜色不对**  
   本项目在 `style.css` 与部分页面中自定义了 `--card-bg`、`--sidebar-*` 等变量；若与 Element Plus 默认暗色不一致，可在对应页面用 `:deep()` 微调 `--el-*` 变量。

3. **打包体积提示 chunk 较大**  
   报表页引入 ECharts、学生页引入 xlsx，属正常现象；可按需做动态 `import()` 进一步拆分（当前路由已为页面级懒加载）。

## 许可证

示例项目，可按需修改与商用（注意第三方库各自许可证）。
