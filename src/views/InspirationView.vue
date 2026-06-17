<script setup lang="ts">
import { useRouter } from 'vue-router'
import inspirationData from '@/mock/book-inspiration.json'
import type { InspirationBook } from '@/types/book'

const books = inspirationData as InspirationBook[]
const router = useRouter()

function addToRecord(book: InspirationBook) {
  router.push({
    name: 'records',
    query: {
      title: book.title,
      author: book.author,
    },
  })
}
</script>

<template>
  <div class="inspiration-view">
    <p class="intro">浏览以下灵感书单，发现值得淘的二手好书。</p>

    <el-row :gutter="20">
      <el-col
        v-for="book in books"
        :key="book.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        class="book-col"
      >
        <el-card shadow="hover" class="book-card">
          <template #header>
            <div class="card-header">
              <span class="book-title">{{ book.title }}</span>
            </div>
          </template>
          <div class="card-content">
            <p class="book-author">{{ book.author }}</p>
            <p class="book-desc">{{ book.description }}</p>
            <div class="book-tags">
              <el-tag
                v-for="tag in book.tags"
                :key="tag"
                size="small"
                type="info"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="card-footer">
            <el-button type="primary" size="small" @click="addToRecord(book)">加入记录</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.inspiration-view {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.intro {
  color: #909399;
  margin-bottom: 20px;
  font-size: 14px;
}

.book-col {
  margin-bottom: 20px;
}

.book-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.book-card :deep(.el-card__header) {
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
  min-height: 0;
}

.card-footer {
  flex-shrink: 0;
  text-align: right;
}

.card-header {
  display: flex;
  align-items: center;
}

.book-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.book-author {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.book-desc {
  color: #909399;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  margin: 0;
}
</style>
