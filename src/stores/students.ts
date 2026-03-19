import { defineStore } from 'pinia'

export type Gender = '男' | '女'

export type Student = {
  id: string
  name: string
  age: number
  gender: Gender
  className: string
  createdAt: number
  updatedAt: number
}

type StudentDraft = Omit<Student, 'createdAt' | 'updatedAt'> & {
  createdAt?: number
  updatedAt?: number
}

const STORAGE_KEY = 'student-admin:students:v1'

function safeParse(json: string | null): unknown {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function uuid(): string {
  // good enough for local demo usage
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function normalize(input: unknown): Student[] {
  if (!Array.isArray(input)) return []
  const now = Date.now()
  const out: Student[] = []
  for (const item of input) {
    if (!item || typeof item !== 'object') continue
    const s = item as Record<string, unknown>
    const id = typeof s.id === 'string' ? s.id : uuid()
    const name = typeof s.name === 'string' ? s.name : ''
    const age = typeof s.age === 'number' ? s.age : Number(s.age)
    const gender = s.gender === '男' || s.gender === '女' ? (s.gender as Gender) : '男'
    const className = typeof s.className === 'string' ? s.className : ''
    if (!name || !Number.isFinite(age) || age <= 0 || !className) continue
    const createdAt = typeof s.createdAt === 'number' ? s.createdAt : now
    const updatedAt = typeof s.updatedAt === 'number' ? s.updatedAt : now
    out.push({ id, name, age, gender, className, createdAt, updatedAt })
  }
  return out
}

function loadStudents(): Student[] {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY))
  return normalize(parsed)
}

function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}

export const useStudentsStore = defineStore('students', {
  state: () => ({
    students: loadStudents() as Student[],
  }),
  getters: {
    byId: (state) => {
      const map = new Map<string, Student>()
      for (const s of state.students) map.set(s.id, s)
      return map
    },
  },
  actions: {
    addStudent(draft: Omit<StudentDraft, 'id'> & { id?: string }) {
      const now = Date.now()
      const student: Student = {
        id: draft.id ?? uuid(),
        name: draft.name.trim(),
        age: Number(draft.age),
        gender: draft.gender,
        className: draft.className.trim(),
        createdAt: now,
        updatedAt: now,
      }
      this.students = [student, ...this.students]
      saveStudents(this.students)
      return student
    },
    updateStudent(id: string, patch: Partial<Omit<Student, 'id' | 'createdAt'>> & { name?: string; className?: string }) {
      const idx = this.students.findIndex((s) => s.id === id)
      if (idx < 0) return null
      const prev = this.students[idx]
      const next: Student = {
        ...prev,
        ...patch,
        name: typeof patch.name === 'string' ? patch.name.trim() : prev.name,
        className: typeof patch.className === 'string' ? patch.className.trim() : prev.className,
        age: patch.age != null ? Number(patch.age) : prev.age,
        updatedAt: Date.now(),
      }
      const copy = this.students.slice()
      copy.splice(idx, 1, next)
      this.students = copy
      saveStudents(this.students)
      return next
    },
    removeStudent(id: string) {
      const before = this.students.length
      this.students = this.students.filter((s) => s.id !== id)
      if (this.students.length !== before) saveStudents(this.students)
    },
    seedIfEmpty() {
      if (this.students.length > 0) return
      const now = Date.now()
      const seeded: Student[] = [
        { id: uuid(), name: '张三', age: 18, gender: '男', className: '高一(1)班', createdAt: now, updatedAt: now },
        { id: uuid(), name: '李四', age: 17, gender: '女', className: '高一(2)班', createdAt: now, updatedAt: now },
      ]
      this.students = seeded
      saveStudents(this.students)
    },
  },
})

