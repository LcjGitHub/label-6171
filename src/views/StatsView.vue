<script setup lang="ts">
import { computed } from 'vue'
import { useBookRecordStore } from '@/stores/bookRecord'
import { getBookStatsSummary } from '@/utils/bookStats'
import type { BookCondition } from '@/types/book'

const store = useBookRecordStore()

const stats = computed(() => getBookStatsSummary(store.records))

function conditionProgressColor(condition: BookCondition): string {
  if (condition === '全新') return '#67C23A'
  if (condition === '良好') return '#409EFF'
  return '#E6A23C'
}
</script>

<template>
  <div class="stats-view">
    <el-row :gutter="20" class="summary-cards">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="card-icon icon-count">📚</div>
          <div class="card-content">
            <div class="card-label">藏书总数</div>
            <div class="card-value">{{ stats.totalCount }}<span class="card-unit">本</span></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="card-icon icon-price">💰</div>
          <div class="card-content">
            <div class="card-label">购入总价</div>
            <div class="card-value">¥{{ stats.totalPrice.toFixed(2) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="card-icon icon-avg">📊</div>
          <div class="card-content">
            <div class="card-label">平均单价</div>
            <div class="card-value">¥{{ stats.averagePrice.toFixed(2) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="condition-card">
      <template #header>
        <div class="card-header">
          <span>📈 品相分布</span>
        </div>
      </template>
      <el-empty v-if="stats.totalCount === 0" description="暂无数据，快去添加淘书记录吧～" />
      <div v-else class="condition-list">
        <div
          v-for="item in stats.conditionStats"
          :key="item.condition"
          class="condition-item"
        >
          <div class="condition-header">
            <el-tag :type="item.condition === '全新' ? 'success' : item.condition === '良好' ? '' : 'warning'">
              {{ item.condition }}
            </el-tag>
            <span class="condition-count">{{ item.count }} 本</span>
          </div>
          <el-progress
            :percentage="item.percentage"
            :color="conditionProgressColor(item.condition)"
            :stroke-width="18"
            :show-text="true"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.stats-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-cards {
  margin-bottom: 0;
}

.stat-card {
  border-radius: 8px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.icon-count {
  background: linear-gradient(135deg, #ecf5ff, #d9ecff);
}

.icon-price {
  background: linear-gradient(135deg, #f0f9eb, #e1f3d8);
}

.icon-avg {
  background: linear-gradient(135deg, #fdf6ec, #faecd8);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.card-label {
  font-size: 14px;
  color: #909399;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.card-unit {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
  margin-left: 4px;
}

.condition-card {
  border-radius: 8px;
}

.card-header {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.condition-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.condition-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.condition-count {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}
</style>
