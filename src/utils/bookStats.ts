import type { BookRecord, BookCondition } from '@/types/book'
import { CONDITION_OPTIONS } from '@/types/book'

/** 品相统计数据 */
export interface ConditionStat {
  condition: BookCondition
  count: number
  percentage: number
}

/** 书籍统计汇总数据 */
export interface BookStatsSummary {
  totalCount: number
  totalPrice: number
  averagePrice: number
  conditionStats: ConditionStat[]
}

/**
 * 计算藏书总数
 * @param records - 淘书记录数组
 */
export function calculateTotalCount(records: BookRecord[]): number {
  return records.length
}

/**
 * 计算购入总价
 * @param records - 淘书记录数组
 */
export function calculateTotalPrice(records: BookRecord[]): number {
  return records.reduce((sum, r) => sum + r.price, 0)
}

/**
 * 计算平均单价
 * @param records - 淘书记录数组
 */
export function calculateAveragePrice(records: BookRecord[]): number {
  const count = records.length
  if (count === 0) return 0
  return calculateTotalPrice(records) / count
}

/**
 * 按品相统计数量和占比
 * @param records - 淘书记录数组
 */
export function calculateConditionStats(records: BookRecord[]): ConditionStat[] {
  const totalCount = records.length
  return CONDITION_OPTIONS.map((condition) => {
    const count = records.filter((r) => r.condition === condition).length
    const percentage = totalCount === 0 ? 0 : (count / totalCount) * 100
    return {
      condition,
      count,
      percentage: Number(percentage.toFixed(2)),
    }
  })
}

/**
 * 获取完整的书籍统计汇总
 * @param records - 淘书记录数组
 */
export function getBookStatsSummary(records: BookRecord[]): BookStatsSummary {
  const totalCount = calculateTotalCount(records)
  const totalPrice = calculateTotalPrice(records)
  const averagePrice = calculateAveragePrice(records)
  const conditionStats = calculateConditionStats(records)

  return {
    totalCount,
    totalPrice: Number(totalPrice.toFixed(2)),
    averagePrice: Number(averagePrice.toFixed(2)),
    conditionStats,
  }
}
