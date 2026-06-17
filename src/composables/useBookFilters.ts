import { ref, computed, type Ref, type ComputedRef } from 'vue'
import Fuse from 'fuse.js'
import dayjs from 'dayjs'
import type { BookRecord, BookCondition } from '@/types/book'

export interface DateRange {
  start: string | null
  end: string | null
}

export interface FilterState {
  searchKeyword: Ref<string>
  selectedCondition: Ref<BookCondition | ''>
  dateRange: Ref<DateRange>
  priceSortOrder: Ref<'asc' | 'desc' | ''>
}

export interface FilterActions {
  resetFilters: () => void
  togglePriceSort: () => void
}

export interface FilterComputed {
  filteredRecords: ComputedRef<BookRecord[]>
  sortButtonText: ComputedRef<string>
}

export type UseBookFiltersReturn = FilterState & FilterActions & FilterComputed

export function useBookFilters(sourceRecords: Ref<BookRecord[]>): UseBookFiltersReturn {
  const searchKeyword = ref('')
  const selectedCondition = ref<BookCondition | ''>('')
  const dateRange = ref<DateRange>({ start: null, end: null })
  const priceSortOrder = ref<'asc' | 'desc' | ''>('')

  const fuse = computed(
    () =>
      new Fuse(sourceRecords.value, {
        keys: ['title'],
        threshold: 0.4,
      })
  )

  const filteredRecords = computed(() => {
    let list = [...sourceRecords.value]

    if (searchKeyword.value.trim()) {
      list = fuse.value.search(searchKeyword.value.trim()).map((r) => r.item)
    }

    if (selectedCondition.value) {
      list = list.filter((r) => r.condition === selectedCondition.value)
    }

    if (dateRange.value.start || dateRange.value.end) {
      list = list.filter((r) => {
        const recordDate = dayjs(r.date)
        if (dateRange.value.start && recordDate.isBefore(dayjs(dateRange.value.start), 'day')) {
          return false
        }
        if (dateRange.value.end && recordDate.isAfter(dayjs(dateRange.value.end), 'day')) {
          return false
        }
        return true
      })
    }

    if (priceSortOrder.value) {
      list.sort((a, b) =>
        priceSortOrder.value === 'asc' ? a.price - b.price : b.price - a.price
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
    if (priceSortOrder.value === 'asc') return '价格 ↑'
    if (priceSortOrder.value === 'desc') return '价格 ↓'
    return '按价格排序'
  })

  function resetFilters() {
    searchKeyword.value = ''
    selectedCondition.value = ''
    dateRange.value = { start: null, end: null }
    priceSortOrder.value = ''
  }

  return {
    searchKeyword,
    selectedCondition,
    dateRange,
    priceSortOrder,
    filteredRecords,
    sortButtonText,
    togglePriceSort,
    resetFilters,
  }
}
