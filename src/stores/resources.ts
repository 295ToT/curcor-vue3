import { defineStore } from 'pinia'

export type ResourceCategory = '推荐' | '语文' | '数学' | '英语' | '物理' | '化学' | '历史' | '地理' | '生物' | '编程'

export type ResourceItem = {
  id: string
  title: string
  category: ResourceCategory
  tags: string[]
  cover?: string
  url: string
  source?: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'student-admin:resources:v1'

function safeParse(json: string | null): unknown {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function uuid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function normalize(input: unknown): ResourceItem[] {
  if (!Array.isArray(input)) return []
  const now = Date.now()
  const out: ResourceItem[] = []
  for (const item of input) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    const title = typeof r.title === 'string' ? r.title.trim() : ''
    const url = typeof r.url === 'string' ? r.url.trim() : ''
    if (!title || !url) continue
    const id = typeof r.id === 'string' ? r.id : uuid()
    const category = (typeof r.category === 'string' ? r.category : '推荐') as ResourceCategory
    const tags = Array.isArray(r.tags) ? (r.tags.filter((t) => typeof t === 'string') as string[]) : []
    const cover = typeof r.cover === 'string' ? r.cover : undefined
    const source = typeof r.source === 'string' ? r.source : undefined
    const createdAt = typeof r.createdAt === 'number' ? r.createdAt : now
    const updatedAt = typeof r.updatedAt === 'number' ? r.updatedAt : now
    out.push({ id, title, url, category, tags, cover, source, createdAt, updatedAt })
  }
  return out
}

function loadResources(): ResourceItem[] {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY))
  return normalize(parsed)
}

function saveResources(items: ResourceItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const seed: Omit<ResourceItem, 'id'>[] = [
  {
    title: '高一数学：函数基础与图像（示例）',
    category: '数学',
    tags: ['函数', '高一', '基础'],
    url: 'https://www.bilibili.com/',
    source: '外部链接',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    title: '英语：阅读理解技巧（示例）',
    category: '英语',
    tags: ['阅读', '技巧'],
    url: 'https://www.bilibili.com/',
    source: '外部链接',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    title: '编程：JavaScript 入门（示例）',
    category: '编程',
    tags: ['JS', '入门'],
    url: 'https://www.bilibili.com/',
    source: '外部链接',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

export const useResourcesStore = defineStore('resources', {
  state: () => ({
    items: loadResources() as ResourceItem[],
  }),
  actions: {
    seedIfEmpty() {
      if (this.items.length > 0) return
      const now = Date.now()
      this.items = seed.map((x) => ({ ...x, id: uuid(), createdAt: now, updatedAt: now }))
      saveResources(this.items)
    },
    add(item: Omit<ResourceItem, 'id' | 'createdAt' | 'updatedAt'>) {
      const now = Date.now()
      const next: ResourceItem = { ...item, id: uuid(), createdAt: now, updatedAt: now }
      this.items = [next, ...this.items]
      saveResources(this.items)
      return next
    },
    remove(id: string) {
      const before = this.items.length
      this.items = this.items.filter((x) => x.id !== id)
      if (this.items.length !== before) saveResources(this.items)
    },
  },
})

