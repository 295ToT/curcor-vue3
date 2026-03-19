<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useResourcesStore, type ResourceCategory, type ResourceItem } from '../../stores/resources'

const { t } = useI18n()
const store = useResourcesStore()
watchEffect(() => {
  store.seedIfEmpty()
})

const categories: ResourceCategory[] = ['推荐', '语文', '数学', '英语', '物理', '化学', '历史', '地理', '生物', '编程']

const categorySegmentOptions = computed(() =>
  categories.map((c) => ({
    label: t(`learn.category.${c}`),
    value: c,
  })),
)

const category = ref<ResourceCategory>('推荐')
const keyword = ref('')

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return store.items
    .filter((x) => (category.value === '推荐' ? true : x.category === category.value))
    .filter((x) => {
      if (!q) return true
      const hay = `${x.title} ${x.tags.join(' ')} ${x.category}`.toLowerCase()
      return hay.includes(q)
    })
})

function open(item: ResourceItem) {
  window.open(item.url, '_blank', 'noopener,noreferrer')
}

function copyLink(item: ResourceItem) {
  void navigator.clipboard
    .writeText(item.url)
    .then(() => ElMessage.success(t('common.linkCopied')))
    .catch(() => ElMessage.error(t('common.copyFail')))
}
</script>

<template>
  <div class="learn">
    <div class="hero">
      <div class="hero__content">
        <div class="hero__title">{{ t('learn.heroTitle') }}</div>
        <div class="hero__sub">{{ t('learn.heroSub') }}</div>
        <el-input v-model="keyword" class="hero__search" :placeholder="t('learn.searchPlaceholder')" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
    </div>

    <el-card shadow="never" class="panel">
      <div class="cats">
        <el-segmented v-model="category" :options="categorySegmentOptions" />
      </div>

      <el-empty v-if="filtered.length === 0" :description="t('learn.empty')" />

      <div v-else class="grid">
        <el-card v-for="item in filtered" :key="item.id" shadow="hover" class="card" @click="open(item)">
          <div class="cover">
            <div class="cover__badge">{{ t(`learn.category.${item.category}`) }}</div>
            <div class="cover__title">{{ item.title }}</div>
          </div>
          <div class="meta">
            <div class="tags">
              <el-tag v-for="tag in item.tags.slice(0, 3)" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
            </div>
            <div class="actions" @click.stop>
              <el-button size="small" @click="open(item)">{{ t('common.open') }}</el-button>
              <el-button size="small" type="primary" plain @click="copyLink(item)">{{ t('common.copyLink') }}</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.learn {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hero {
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #0b1220 0%, #182b5a 55%, #0b1220 100%);
  color: #fff;
}
.hero__content {
  padding: 18px 18px 16px;
}
.hero__title {
  font-size: 18px;
  font-weight: 700;
}
.hero__sub {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.85;
}
.hero__search {
  margin-top: 12px;
  max-width: 520px;
}
.panel {
  border-radius: 10px;
}
.cats {
  margin-bottom: 12px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
.card {
  cursor: pointer;
}
.cover {
  height: 120px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.25), rgba(103, 194, 58, 0.18));
  padding: 12px;
  position: relative;
  display: flex;
  align-items: flex-end;
}
.cover__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
}
.cover__title {
  font-weight: 700;
  line-height: 1.25;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.actions {
  display: flex;
  gap: 6px;
}
</style>
