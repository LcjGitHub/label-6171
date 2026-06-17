<script setup lang="ts">
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBookRecordStore } from '@/stores/bookRecord'
import BookFormDialog from '@/components/BookFormDialog.vue'
import ImportConfirmDialog from '@/components/ImportConfirmDialog.vue'
import type { BookRecord, BookRecordForm } from '@/types/book'
import {
  exportRecords,
  readExportFile,
  validateImportData,
  mergeRecords,
  getImportStats,
  type ImportMode,
} from '@/utils/bookImportExport'

const store = useBookRecordStore()

const searchKeyword = ref('')
const priceSortOrder = ref<'asc' | 'desc' | ''>('')
const dialogVisible = ref(false)
const editingRecord = ref<BookRecord | null>(null)

const importDialogVisible = ref(false)
const importMode = ref<ImportMode>('merge')
const pendingImportRecords = ref<BookRecord[]>([])
const importStats = ref({ total: 0, added: 0, updated: 0, unchanged: 0 })
const fileInputRef = ref<HTMLInputElement | null>(null)

/** fuse.js 搜索实例 */
const fuse = computed(
  () =>
    new Fuse(store.records, {
      keys: ['title'],
      threshold: 0.4,
    })
)

/** 过滤并排序后的记录列表 */
const displayRecords = computed(() => {
  let list = [...store.records]

  if (searchKeyword.value.trim()) {
    list = fuse.value.search(searchKeyword.value.trim()).map((r) => r.item)
  }

  if (priceSortOrder.value) {
    list.sort((a, b) =>
      priceSortOrder.value === 'asc' ? a.price - b.price : b.price - a.price
    )
  }

  return list
})

/** 切换价格排序 */
function togglePriceSort() {
  if (priceSortOrder.value === '') {
    priceSortOrder.value = 'asc'
  } else if (priceSortOrder.value === 'asc') {
    priceSortOrder.value = 'desc'
  } else {
    priceSortOrder.value = ''
  }
}

/** 排序按钮文字 */
const sortButtonText = computed(() => {
  if (priceSortOrder.value === 'asc') return '价格 ↑'
  if (priceSortOrder.value === 'desc') return '价格 ↓'
  return '按价格排序'
})

/** 打开新增弹窗 */
function openAddDialog() {
  editingRecord.value = null
  dialogVisible.value = true
}

/** 打开编辑弹窗 */
function openEditDialog(record: BookRecord) {
  editingRecord.value = record
  dialogVisible.value = true
}

/** 提交表单（新增或编辑） */
function handleSubmit(form: BookRecordForm) {
  if (editingRecord.value) {
    store.updateRecord(editingRecord.value.id, form)
    ElMessage.success('记录已更新')
  } else {
    store.addRecord(form)
    ElMessage.success('记录已添加')
  }
}

/** 删除记录 */
async function handleDelete(record: BookRecord) {
  try {
    await ElMessageBox.confirm(`确定删除「${record.title}」吗？`, '提示', {
      type: 'warning',
    })
    store.removeRecord(record.id)
    ElMessage.success('记录已删除')
  } catch {
    /* 用户取消 */
  }
}

/** 品相标签类型 */
function conditionTagType(condition: string) {
  if (condition === '全新') return 'success'
  if (condition === '良好') return ''
  return 'warning'
}

/** 导出备份 */
function handleExport() {
  if (store.records.length === 0) {
    ElMessage.warning('暂无记录可导出')
    return
  }
  exportRecords(store.records)
  ElMessage.success('导出成功')
}

/** 触发文件选择 */
function handleImportClick() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

/** 处理文件选择 */
async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  try {
    const data = await readExportFile(file)
    const validation = validateImportData(data)

    if (!validation.valid && validation.records.length === 0) {
      ElMessage.error(`导入失败：${validation.errors[0]}`)
      return
    }

    if (validation.errors.length > 0) {
      const warningMsg = `检测到 ${validation.errors.length} 条问题，将仅导入有效记录`
      await ElMessageBox.confirm(warningMsg, '数据校验提示', {
        type: 'warning',
        confirmButtonText: '继续导入',
        cancelButtonText: '取消',
      })
    }

    pendingImportRecords.value = validation.records
    importStats.value = getImportStats(store.records, validation.records, importMode.value)
    importDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导入失败')
  } finally {
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

/** 切换导入模式时更新统计 */
function handleImportModeChange(mode: ImportMode) {
  importMode.value = mode
  importStats.value = getImportStats(store.records, pendingImportRecords.value, mode)
}

/** 确认导入 */
function handleImportConfirm() {
  if (importMode.value === 'overwrite') {
    store.setRecords(pendingImportRecords.value)
    ElMessage.success(`已覆盖导入 ${pendingImportRecords.value.length} 条记录`)
  } else {
    const merged = mergeRecords(store.records, pendingImportRecords.value)
    store.setRecords(merged)
    const added = importStats.value.added
    const updated = importStats.value.updated
    ElMessage.success(`导入成功：新增 ${added} 条，更新 ${updated} 条`)
  }

  pendingImportRecords.value = []
  importDialogVisible.value = false
}
</script>

<template>
  <div class="records-view">
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="按书名搜索..."
        clearable
        style="width: 240px"
      />
      <div class="toolbar-actions">
        <el-button :type="priceSortOrder ? 'primary' : 'default'" @click="togglePriceSort">
          {{ sortButtonText }}
        </el-button>
        <el-button @click="handleExport">导出备份</el-button>
        <el-button type="primary" @click="handleImportClick">导入恢复</el-button>
        <el-button type="primary" @click="openAddDialog">新增记录</el-button>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        accept=".json"
        style="display: none"
        @change="handleFileChange"
      />
    </div>

    <el-table :data="displayRecords" stripe border style="width: 100%">
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
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="note" label="备注" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="140" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="displayRecords.length === 0" description="暂无记录，点击「新增记录」开始吧" />

    <BookFormDialog
      v-model:visible="dialogVisible"
      :record="editingRecord"
      @submit="handleSubmit"
    />

    <ImportConfirmDialog
      v-model:visible="importDialogVisible"
      v-model:import-mode="importMode"
      :total-count="importStats.total"
      :added-count="importStats.added"
      :updated-count="importStats.updated"
      :unchanged-count="importStats.unchanged"
      @update:import-mode="handleImportModeChange"
      @confirm="handleImportConfirm"
    />
  </div>
</template>

<style scoped>
.records-view {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}
</style>
