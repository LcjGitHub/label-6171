<script setup lang="ts">
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBookWishlistStore } from '@/stores/bookWishlist'
import BookWishDialog from '@/components/BookWishDialog.vue'
import type { BookWish, BookWishForm } from '@/types/book'

const store = useBookWishlistStore()

const searchKeyword = ref('')
const priceSortOrder = ref<'asc' | 'desc' | ''>('')
const dialogVisible = ref(false)
const editingWish = ref<BookWish | null>(null)

const fuse = computed(
  () =>
    new Fuse(store.wishes, {
      keys: ['title'],
      threshold: 0.4,
    })
)

const displayWishes = computed(() => {
  let list = [...store.wishes]

  if (searchKeyword.value.trim()) {
    list = fuse.value.search(searchKeyword.value.trim()).map((r) => r.item)
  }

  if (priceSortOrder.value) {
    list.sort((a, b) =>
      priceSortOrder.value === 'asc' ? a.maxPrice - b.maxPrice : b.maxPrice - a.maxPrice
    )
  }

  return list
})

function togglePriceSort() {
  if (priceSortOrder.value === '') {
    priceSortOrder.value = 'asc'
  } else if (priceSortOrder.value === 'asc') {
    priceSortOrder.value = 'desc'
  } else {
    priceSortOrder.value = ''
  }
}

const sortButtonText = computed(() => {
  if (priceSortOrder.value === 'asc') return '期望价格 ↑'
  if (priceSortOrder.value === 'desc') return '期望价格 ↓'
  return '按期望价格排序'
})

function openAddDialog() {
  editingWish.value = null
  dialogVisible.value = true
}

function openEditDialog(wish: BookWish) {
  editingWish.value = wish
  dialogVisible.value = true
}

function handleSubmit(form: BookWishForm) {
  if (editingWish.value) {
    store.updateWish(editingWish.value.id, form)
    ElMessage.success('心愿已更新')
  } else {
    store.addWish(form)
    ElMessage.success('心愿已添加')
  }
}

async function handleDelete(wish: BookWish) {
  try {
    await ElMessageBox.confirm(`确定删除「${wish.title}」吗？`, '提示', {
      type: 'warning',
    })
    store.removeWish(wish.id)
    ElMessage.success('心愿已删除')
  } catch {
    /* 用户取消 */
  }
}
</script>

<template>
  <div class="wishlist-view">
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
        <el-button type="primary" @click="openAddDialog">新增心愿</el-button>
      </div>
    </div>

    <el-table :data="displayWishes" stripe border style="width: 100%">
      <el-table-column prop="title" label="书名" min-width="140" />
      <el-table-column prop="author" label="作者" min-width="100" />
      <el-table-column prop="maxPrice" label="期望最高价（元）" width="150" align="right">
        <template #default="{ row }">
          ¥{{ row.maxPrice.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="note" label="备注" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="140" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="displayWishes.length === 0" description="暂无心愿，点击「新增心愿」开始吧" />

    <BookWishDialog
      v-model:visible="dialogVisible"
      :wish="editingWish"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.wishlist-view {
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
