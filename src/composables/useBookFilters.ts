import { ref, computed, type Ref, type ComputedRef } from 'vue'
import dayjs from 'dayjs'
import type { BookRecord, BookCondition } from '@/types/book'
import {
  sortRecords,
  toggleDateSort as toggleDateSortUtil,
  getDateSortButtonText,
  type DateSortOrder,
} from '@/utils/bookSort'
import { useBookSearchSort, type PriceSortOrder } from '@/composables/useBookSearchSort'

export interface DateRange {
  start: string | null
  end: string | null
}

export interface FilterState {
  searchKeyword: Ref<string>
  selectedCondition: Ref<BookCondition | ''>
  dateRange: Ref<DateRange>
  dateSortOrder: Ref<DateSortOrder>
  priceSortOrder: Ref<PriceSortOrder>
}

export interface FilterActions {
  resetFilters: () => void
  togglePriceSort: () => void
  toggleDateSort: () => void
}

export interface FilterComputed {
  filteredRecords: ComputedRef<BookRecord[]>
  priceSortButtonText: ComputedRef<string>
  dateSortButtonText: ComputedRef<string>
  dateRangeValue: ComputedRef<[string, string] | null>
}

export type UseBookFiltersReturn = FilterState & FilterActions & FilterComputed

export function useBookFilters(sourceRecords: Ref<BookRecord[]>): UseBookFiltersReturn {
  const {
    searchKeyword,
    priceSortOrder,
    searchedItems,
    priceSortButtonText,
    togglePriceSort,
    resetSearchSort,
  } = useBookSearchSort(sourceRecords, {
    priceField: 'price',
    priceSortLabel: '价格',
  })

  const selectedCondition = ref<BookCondition | ''>('')
  const dateRange = ref<DateRange>({ start: null, end: null })
  const dateSortOrder = ref<DateSortOrder>('')

  const filteredRecords = computed(() => {
    let list = [...searchedItems.value]

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

    list = sortRecords(list, dateSortOrder.value, priceSortOrder.value)

    return list
  })

  function toggleDateSort() {
    dateSortOrder.value = toggleDateSortUtil(dateSortOrder.value)
  }

  const dateSortButtonText = computed(() => getDateSortButtonText(dateSortOrder.value))

  const dateRangeValue = computed({
    get: (): [string, string] | null => {
      if (dateRange.value.start && dateRange.value.end) {
        return [dateRange.value.start, dateRange.value.end]
      }
      return null
    },
    set: (val: [string, string] | null) => {
      if (val && val.length === 2) {
        dateRange.value = { start: val[0], end: val[1] }
      } else {
        dateRange.value = { start: null, end: null }
      }
    },
  })

  function resetFilters() {
    resetSearchSort()
    selectedCondition.value = ''
    dateRange.value = { start: null, end: null }
    dateSortOrder.value = ''
  }

  return {
    searchKeyword,
    selectedCondition,
    dateRange,
    dateSortOrder,
    priceSortOrder,
    filteredRecords,
    priceSortButtonText,
    dateSortButtonText,
    dateRangeValue,
    togglePriceSort,
    toggleDateSort,
    resetFilters,
  }
}
