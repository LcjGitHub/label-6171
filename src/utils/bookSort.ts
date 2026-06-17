import type { BookRecord } from '@/types/book'
import dayjs from 'dayjs'

/** 日期排序方向：空字符串表示不排序，asc 为由远到近，desc 为由近到远 */
export type DateSortOrder = 'asc' | 'desc' | ''

/** 价格排序方向：空字符串表示不排序，asc 为由低到高，desc 为由高到低 */
export type PriceSortOrder = 'asc' | 'desc' | ''

/**
 * 比较两条记录的购入日期
 * @param a - 第一条淘书记录
 * @param b - 第二条淘书记录
 * @param order - 排序方向，asc 为由远到近，desc 为由近到远
 */
export function compareByDate(a: BookRecord, b: BookRecord, order: DateSortOrder): number {
  if (!order) return 0
  const dateA = dayjs(a.date).valueOf()
  const dateB = dayjs(b.date).valueOf()
  return order === 'asc' ? dateA - dateB : dateB - dateA
}

/**
 * 比较两条记录的购入价格
 * @param a - 第一条淘书记录
 * @param b - 第二条淘书记录
 * @param order - 排序方向，asc 为由低到高，desc 为由高到低
 */
export function compareByPrice(a: BookRecord, b: BookRecord, order: PriceSortOrder): number {
  if (!order) return 0
  return order === 'asc' ? a.price - b.price : b.price - a.price
}

/**
 * 对淘书记录进行组合排序，先按日期排序，日期相同时按价格排序
 * @param records - 淘书记录数组
 * @param dateOrder - 日期排序方向
 * @param priceOrder - 价格排序方向
 */
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

/**
 * 获取日期排序按钮的显示文本
 * @param order - 当前日期排序方向
 */
export function getDateSortButtonText(order: DateSortOrder): string {
  if (order === 'asc') return '日期 ↑'
  if (order === 'desc') return '日期 ↓'
  return '按日期排序'
}

/**
 * 切换日期排序方向，循环顺序：无排序 → 由近到远 → 由远到近 → 无排序
 * @param current - 当前日期排序方向
 */
export function toggleDateSort(current: DateSortOrder): DateSortOrder {
  if (current === '') return 'desc'
  if (current === 'desc') return 'asc'
  return ''
}

/**
 * 切换价格排序方向，循环顺序：无排序 → 由低到高 → 由高到低 → 无排序
 * @param current - 当前价格排序方向
 */
export function togglePriceSort(current: PriceSortOrder): PriceSortOrder {
  if (current === '') return 'asc'
  if (current === 'asc') return 'desc'
  return ''
}

/**
 * 获取价格排序按钮的显示文本
 * @param order - 当前价格排序方向
 */
export function getPriceSortButtonText(order: PriceSortOrder): string {
  if (order === 'asc') return '价格 ↑'
  if (order === 'desc') return '价格 ↓'
  return '按价格排序'
}
