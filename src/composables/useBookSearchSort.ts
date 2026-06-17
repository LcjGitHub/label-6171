import { ref, computed, type Ref, type ComputedRef } from 'vue'
import Fuse from 'fuse.js'

export type PriceSortOrder = 'asc' | 'desc' | ''

export interface UseBookSearchSortOptions<T> {
  priceField: keyof T
  priceSortLabel?: string
  searchKeys?: (keyof T)[]
  fuseThreshold?: number
}

export interface UseBookSearchSortReturn<T> {
  searchKeyword: Ref<string>
  priceSortOrder: Ref<PriceSortOrder>
  searchedItems: ComputedRef<T[]>
  sortedItems: ComputedRef<T[]>
  priceSortButtonText: ComputedRef<string>
  togglePriceSort: () => void
  resetSearchSort: () => void
}

export function useBookSearchSort<T extends object>(
  sourceItems: Ref<T[]>,
  options: UseBookSearchSortOptions<T>
): UseBookSearchSortReturn<T> {
  const {
    priceField,
    priceSortLabel = '价格',
    searchKeys = ['title' as keyof T],
    fuseThreshold = 0.4,
  } = options

  const searchKeyword = ref('')
  const priceSortOrder = ref<PriceSortOrder>('')

  const fuse = computed(
    () =>
      new Fuse(sourceItems.value, {
        keys: searchKeys as string[],
        threshold: fuseThreshold,
      })
  )

  const searchedItems = computed(() => {
    if (!searchKeyword.value.trim()) {
      return [...sourceItems.value]
    }
    return fuse.value.search(searchKeyword.value.trim()).map((r) => r.item)
  })

  const sortedItems = computed(() => {
    let list = [...searchedItems.value]

    if (priceSortOrder.value) {
      list.sort((a, b) => {
        const priceA = a[priceField] as unknown as number
        const priceB = b[priceField] as unknown as number
        return priceSortOrder.value === 'asc' ? priceA - priceB : priceB - priceA
      })
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

  const priceSortButtonText = computed(() => {
    if (priceSortOrder.value === 'asc') return `${priceSortLabel} ↑`
    if (priceSortOrder.value === 'desc') return `${priceSortLabel} ↓`
    return `按${priceSortLabel}排序`
  })

  function resetSearchSort() {
    searchKeyword.value = ''
    priceSortOrder.value = ''
  }

  return {
    searchKeyword,
    priceSortOrder,
    searchedItems,
    sortedItems,
    priceSortButtonText,
    togglePriceSort,
    resetSearchSort,
  }
}
