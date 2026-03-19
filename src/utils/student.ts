import type { Student } from '../stores/students'

export function extractGrade(className: string): string {
  const s = className.trim()
  // common patterns: 高一(1)班 / 高二1班 / 高三 / 七年级(1)班
  const m1 = s.match(/^(高[一二三]|初[一二三]|[七八九]年级|[一二三四五六]年级)/)
  if (m1?.[1]) return m1[1]

  // fallback: take prefix before first '(' or '（' or '-' or space
  const m2 = s.match(/^(.+?)[(（\-\s]/)
  if (m2?.[1]) return m2[1]

  return '未分类'
}

export function getGrades(students: Student[]): string[] {
  const set = new Set<string>()
  for (const s of students) set.add(extractGrade(s.className))
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

export function getClasses(students: Student[]): string[] {
  const set = new Set<string>()
  for (const s of students) set.add(s.className)
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

