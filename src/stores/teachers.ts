import { defineStore } from 'pinia'

export type Gender = '男' | '女'

export type Teacher = {
  id: string
  name: string
  gender: Gender
  subject: string
  title: string
  phone: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'student-admin:teachers:v1'

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

function normalize(input: unknown): Teacher[] {
  if (!Array.isArray(input)) return []
  const now = Date.now()
  const out: Teacher[] = []
  for (const item of input) {
    if (!item || typeof item !== 'object') continue
    const t = item as Record<string, unknown>
    const id = typeof t.id === 'string' ? t.id : uuid()
    const name = typeof t.name === 'string' ? t.name.trim() : ''
    const gender = t.gender === '男' || t.gender === '女' ? (t.gender as Gender) : '男'
    const subject = typeof t.subject === 'string' ? t.subject.trim() : ''
    const title = typeof t.title === 'string' ? t.title.trim() : ''
    const phone = typeof t.phone === 'string' ? t.phone.trim() : ''
    if (!name || !subject) continue
    const createdAt = typeof t.createdAt === 'number' ? t.createdAt : now
    const updatedAt = typeof t.updatedAt === 'number' ? t.updatedAt : now
    out.push({ id, name, gender, subject, title, phone, createdAt, updatedAt })
  }
  return out
}

function loadTeachers(): Teacher[] {
  return normalize(safeParse(localStorage.getItem(STORAGE_KEY)))
}

function saveTeachers(list: Teacher[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export const useTeachersStore = defineStore('teachers', {
  state: () => ({
    teachers: loadTeachers() as Teacher[],
  }),
  actions: {
    addTeacher(draft: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
      const now = Date.now()
      const teacher: Teacher = {
        id: draft.id ?? uuid(),
        name: draft.name.trim(),
        gender: draft.gender,
        subject: draft.subject.trim(),
        title: draft.title.trim(),
        phone: draft.phone.trim(),
        createdAt: now,
        updatedAt: now,
      }
      this.teachers = [teacher, ...this.teachers]
      saveTeachers(this.teachers)
      return teacher
    },
    updateTeacher(
      id: string,
      patch: Partial<Pick<Teacher, 'name' | 'gender' | 'subject' | 'title' | 'phone'>>,
    ) {
      const idx = this.teachers.findIndex((t) => t.id === id)
      if (idx < 0) return null
      const prev = this.teachers[idx]
      const next: Teacher = {
        ...prev,
        ...patch,
        name: patch.name != null ? patch.name.trim() : prev.name,
        subject: patch.subject != null ? patch.subject.trim() : prev.subject,
        title: patch.title != null ? patch.title.trim() : prev.title,
        phone: patch.phone != null ? patch.phone.trim() : prev.phone,
        updatedAt: Date.now(),
      }
      const copy = this.teachers.slice()
      copy.splice(idx, 1, next)
      this.teachers = copy
      saveTeachers(this.teachers)
      return next
    },
    removeTeacher(id: string) {
      const before = this.teachers.length
      this.teachers = this.teachers.filter((t) => t.id !== id)
      if (this.teachers.length !== before) saveTeachers(this.teachers)
    },
    seedIfEmpty() {
      if (this.teachers.length > 0) return
      const now = Date.now()
      this.teachers = [
        {
          id: uuid(),
          name: '王老师',
          gender: '女',
          subject: '语文',
          title: '一级教师',
          phone: '13800000001',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuid(),
          name: '陈老师',
          gender: '男',
          subject: '数学',
          title: '高级教师',
          phone: '13800000002',
          createdAt: now,
          updatedAt: now,
        },
      ]
      saveTeachers(this.teachers)
    },
  },
})
