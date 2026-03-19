<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import { useStudentsStore } from '../../stores/students'
import { extractGrade } from '../../utils/student'

const { t, locale } = useI18n()
const store = useStudentsStore()

const total = computed(() => store.students.length)
const male = computed(() => store.students.filter((s) => s.gender === '男').length)
const female = computed(() => store.students.filter((s) => s.gender === '女').length)

const genderEl = ref<HTMLDivElement | null>(null)
const gradeEl = ref<HTMLDivElement | null>(null)
const classEl = ref<HTMLDivElement | null>(null)

let genderChart: echarts.ECharts | null = null
let gradeChart: echarts.ECharts | null = null
let classChart: echarts.ECharts | null = null

function buildCounts(keyFn: (s: (typeof store.students)[number]) => string) {
  const map = new Map<string, number>()
  for (const s of store.students) map.set(keyFn(s), (map.get(keyFn(s)) ?? 0) + 1)
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

function translateGradeLabel(name: string) {
  return name === '未分类' ? t('common.uncategorized') : name
}

function render() {
  if (genderEl.value && !genderChart) genderChart = echarts.init(genderEl.value)
  if (gradeEl.value && !gradeChart) gradeChart = echarts.init(gradeEl.value)
  if (classEl.value && !classChart) classChart = echarts.init(classEl.value)

  const genderData = [
    { name: t('common.male'), value: male.value },
    { name: t('common.female'), value: female.value },
  ]
  genderChart?.setOption({
    title: { text: t('reports.chartGender'), left: 'center', top: 10 },
    tooltip: { trigger: 'item' },
    legend: { bottom: 10, left: 'center' },
    series: [{ type: 'pie', radius: ['35%', '65%'], data: genderData }],
  })

  const gradeData = buildCounts((s) => extractGrade(s.className))
  gradeChart?.setOption({
    title: { text: t('reports.chartGrade'), left: 'center', top: 10 },
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, bottom: 30, top: 60 },
    xAxis: {
      type: 'category',
      data: gradeData.map((x) => translateGradeLabel(x.name)),
      axisLabel: { interval: 0 },
    },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: gradeData.map((x) => x.value) }],
  })

  const classData = buildCounts((s) => s.className).slice(0, 12)
  classChart?.setOption({
    title: { text: t('reports.chartClass'), left: 'center', top: 10 },
    tooltip: { trigger: 'axis' },
    grid: { left: 120, right: 20, bottom: 30, top: 60 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: classData.map((x) => x.name).reverse() },
    series: [{ type: 'bar', data: classData.map((x) => x.value).reverse() }],
  })
}

function resize() {
  genderChart?.resize()
  gradeChart?.resize()
  classChart?.resize()
}

onMounted(() => {
  render()
  window.addEventListener('resize', resize)
})

watch(
  () => store.students,
  () => render(),
  { deep: true },
)

watch(locale, () => render())

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  genderChart?.dispose()
  gradeChart?.dispose()
  classChart?.dispose()
  genderChart = null
  gradeChart = null
  classChart = null
})
</script>

<template>
  <el-row :gutter="12">
    <el-col :span="8">
      <el-card shadow="never">
        <div class="stat__label">{{ t('common.totalStudents') }}</div>
        <div class="stat__value">{{ total }}</div>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="never">
        <div class="stat__label">{{ t('common.maleStudents') }}</div>
        <div class="stat__value">{{ male }}</div>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="never">
        <div class="stat__label">{{ t('common.femaleStudents') }}</div>
        <div class="stat__value">{{ female }}</div>
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="12" style="margin-top: 12px">
    <el-col :span="8">
      <el-card shadow="never">
        <div ref="genderEl" class="chart" />
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="never">
        <div ref="gradeEl" class="chart" />
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="never">
        <div ref="classEl" class="chart" />
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.stat__label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}
.stat__value {
  margin-top: 8px;
  font-size: 26px;
  font-weight: 700;
}
.chart {
  height: 340px;
}
</style>
