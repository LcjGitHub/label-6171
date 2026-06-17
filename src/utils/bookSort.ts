import type { BookRecord } from '@/types/book'
import dayjs from 'dayjs'

export type DateSortOrder = 'asc' | 'desc' | ''
export type PriceSortOrder = 'asc' | 'desc' | ''

export function compareByDate(a: BookRecord, b: BookRecord, order: DateSortOrder): number {
  if (!order) return 0
  const dateA = dayjs(a.date).valueOf()
  const dateB = dayjs(b.date).valueOf()
  return order === 'asc' ? dateA - dateB : dateB - dateA
}

export function compareByPrice(a: BookRecord, b: BookRecord, order: PriceSortOrder): number {
  if (!order) return 0
  return order === 'asc' ? a.price - b.price : b.price - a.price
}

export function sortRecords(
  records: BookRecord[],
  dateOrder: DateSortOrder,
  priceOrder: PriceSortOrder
): BookRecord[] {
  return [...records].sort((a, b) => {
    const dateCompare = compareByDate(a, b, dateOrder)
    if (dateCompare !== 0) return dateCompare
    return compareByPrice(a, b, priceOrder)
  })
}

export function getDateSortButtonText(order: DateSortOrder): string {
  if (order === 'asc') return '日期 ↑'
  if (order === 'desc') return '日期 ↓'
  return '按日期排序'
}

export function toggleDateSort(current: DateSortOrder): DateSortOrder {
  if (current === '') return 'desc'
  if (current === 'desc') return 'asc'
  return ''
}

export function togglePriceSort(current: PriceSortOrder): PriceSortOrder {
  if (current === '') return 'asc'
  if (current === 'asc') return 'desc'
  return ''
}

export function getPriceSortButtonText(order: PriceSortOrder): string {
  if (order === 'asc') return '价格 ↑'
  if (order === 'desc') return '价格 ↓'
  return '按价格排序'
}
