import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BookRecord, BookRecordForm } from '@/types/book'

/**
 * 淘书记录 Store，数据持久化至 localStorage
 */
export const useBookRecordStore = defineStore(
  'bookRecord',
  () => {
    const records = ref<BookRecord[]>([])

    /**
     * 新增记录
     * @param form - 表单数据
     */
    function addRecord(form: BookRecordForm) {
      const record: BookRecord = {
        id: crypto.randomUUID(),
        ...form,
      }
      records.value.push(record)
    }

    /**
     * 更新记录
     * @param id - 记录 ID
     * @param form - 表单数据
     */
    function updateRecord(id: string, form: BookRecordForm) {
      const index = records.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        records.value[index] = { id, ...form }
      }
    }

    /**
     * 删除记录
     * @param id - 记录 ID
     */
    function removeRecord(id: string) {
      records.value = records.value.filter((r) => r.id !== id)
    }

    /**
     * 根据 ID 获取记录
     * @param id - 记录 ID
     */
    function getRecordById(id: string): BookRecord | undefined {
      return records.value.find((r) => r.id === id)
    }

    return {
      records,
      addRecord,
      updateRecord,
      removeRecord,
      getRecordById,
    }
  },
  {
    persist: {
      key: 'book-journal-records',
      storage: localStorage,
    },
  }
)
