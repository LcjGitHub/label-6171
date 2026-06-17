<script setup lang="ts">
import { computed } from 'vue'
import type { ImportMode } from '@/utils/bookImportExport'

const props = defineProps<{
  visible: boolean
  totalCount: number
  addedCount: number
  updatedCount: number
  unchangedCount: number
  importMode: ImportMode
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:importMode': [value: ImportMode]
  confirm: []
}>()

const modeOptions = [
  { value: 'overwrite', label: '覆盖现有数据', description: '用导入的数据完全替换当前所有记录' },
  { value: 'merge', label: '合并到现有数据', description: '按 ID 合并，相同 ID 的记录将被更新' },
]

function handleClose() {
  emit('update:visible', false)
}

function handleConfirm() {
  emit('confirm')
  handleClose()
}

const canConfirm = computed(() => {
  if (props.importMode === 'overwrite') {
    return props.totalCount > 0
  }
  return props.totalCount > 0
})
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="导入确认"
    width="480px"
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="import-confirm-content">
      <div class="stats-section">
        <h4>导入数据统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">总记录数</span>
            <span class="stat-value">{{ totalCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">新增</span>
            <span class="stat-value text-success">{{ addedCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">更新</span>
            <span class="stat-value text-warning">{{ updatedCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">无变化</span>
            <span class="stat-value text-info">{{ unchangedCount }}</span>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="mode-section">
        <h4>选择导入方式</h4>
        <el-radio-group :model-value="importMode" @update:model-value="emit('update:importMode', $event)">
          <el-radio
            v-for="option in modeOptions"
            :key="option.value"
            :value="option.value"
            class="mode-radio"
          >
            <div class="mode-option">
              <span class="mode-label">{{ option.label }}</span>
              <span class="mode-desc">{{ option.description }}</span>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <el-alert
        v-if="importMode === 'overwrite'"
        type="warning"
        :closable="false"
        show-icon
        title="警告：覆盖模式将删除所有现有记录"
        description="此操作不可撤销，请确保已备份当前数据。"
      />
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="!canConfirm" @click="handleConfirm">
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.import-confirm-content {
  padding: 8px 0;
}

.stats-section h4,
.mode-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.text-success {
  color: #67c23a;
}

.text-warning {
  color: #e6a23c;
}

.text-info {
  color: #909399;
}

.mode-section {
  margin-bottom: 8px;
}

.mode-radio {
  display: block;
  margin-bottom: 12px;
  height: auto;
  line-height: 1.4;
}

.mode-option {
  display: flex;
  flex-direction: column;
  padding-left: 4px;
}

.mode-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.mode-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}
</style>
