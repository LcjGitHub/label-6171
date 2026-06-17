<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookRecordStore } from '@/stores/bookRecord'
import { groupRecordsByMonth } from '@/utils/bookStats'
import type { BookCondition } from '@/types/book'

const store = useBookRecordStore()

const activeMonths = ref<string[]>([])

const monthlyGroups = computed(() => groupRecordsByMonth(store.records))

const totalBooksCount = computed(() =>
  monthlyGroups.value.reduce((sum, g) => sum + g.count, 0)
)

const totalSpent = computed(() =>
  Number(monthlyGroups.value.reduce((sum, g) => sum + g.totalPrice, 0).toFixed(2))
)

function conditionTagType(condition: BookCondition) {
  if (condition === '全新') return 'success'
  if (condition === '良好') return ''
  return 'warning'
}

function handleMonthChange(activeNames: string | string[]) {
  activeMonths.value = Array.isArray(activeNames) ? activeNames : [activeNames]
}
</script>

<template>
  <div class="monthly-review-view">
    <el-row :gutter="20" class="summary-cards">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="card-icon icon-months">📅</div>
          <div class="card-content">
            <div class="card-label">活跃月份</div>
            <div class="card-value">{{ monthlyGroups.length }}<span class="card-unit">个月</span></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="card-icon icon-count">📚</div>
          <div class="card-content">
            <div class="card-label">累计购书</div>
            <div class="card-value">{{ totalBooksCount }}<span class="card-unit">本</span></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stat-card">
          <div class="card-icon icon-price">💰</div>
          <div class="card-content">
            <div class="card-label">累计花费</div>
            <div class="card-value">¥{{ totalSpent.toFixed(2) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="review-card">
      <template #header>
        <div class="card-header">
          <span>🗓️ 月度购书回顾</span>
        </div>
      </template>
      <el-empty v-if="monthlyGroups.length === 0" description="暂无购书记录，快去添加你的第一条淘书记录吧～" />
      <el-collapse v-else v-model="activeMonths" @change="handleMonthChange">
        <el-collapse-item
          v-for="group in monthlyGroups"
          :key="group.monthKey"
          :name="group.monthKey"
        >
          <template #title>
            <div class="month-header">
              <span class="month-label">{{ group.monthLabel }}</span>
              <div class="month-stats">
                <el-tag type="info" effect="plain">{{ group.count }} 本</el-tag>
                <el-tag type="warning" effect="plain">¥{{ group.totalPrice.toFixed(2) }}</el-tag>
              </div>
            </div>
          </template>
          <el-table :data="group.records" stripe size="small" style="width: 100%">
            <el-table-column prop="date" label="日期" width="110" />
            <el-table-column prop="title" label="书名" min-width="140" />
            <el-table-column prop="author" label="作者" min-width="100" />
            <el-table-column prop="price" label="购入价（元）" width="120" align="right">
              <template #default="{ row }">
                ¥{{ row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="condition" label="品相" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="conditionTagType(row.condition)" size="small">
                  {{ row.condition }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="purchaseChannel" label="购入渠道" width="120" align="center">
              <template #default="{ row }">
                {{ row.purchaseChannel || '未填写' }}
              </template>
            </el-table-column>
            <el-table-column prop="note" label="备注" min-width="120" show-overflow-tooltip />
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<style scoped>
.monthly-review-view {
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

.icon-months {
  background: linear-gradient(135deg, #fef0f0, #fde2e2);
}

.icon-count {
  background: linear-gradient(135deg, #ecf5ff, #d9ecff);
}

.icon-price {
  background: linear-gradient(135deg, #f0f9eb, #e1f3d8);
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

.review-card {
  border-radius: 8px;
}

.card-header {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 16px;
}

.month-label {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.month-stats {
  display: flex;
  gap: 8px;
}

.month-stats :deep(.el-tag) {
  font-weight: 500;
}
</style>
