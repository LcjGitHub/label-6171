import type { BookRecord, BookCondition } from '@/types/book'
import { CONDITION_OPTIONS } from '@/types/book'
import dayjs from 'dayjs'

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

/** 月度购书分组数据 */
export interface MonthlyGroup {
  /** 月份标识，格式 YYYY-MM */
  monthKey: string
  /** 月份显示文本，格式 YYYY年MM月 */
  monthLabel: string
  /** 该月购书数量 */
  count: number
  /** 该月花费合计 */
  totalPrice: number
  /** 该月购书记录列表 */
  records: BookRecord[]
}

/**
 * 按月份分组淘书记录，按从近到远排序
 * @param records - 淘书记录数组
 */
export function groupRecordsByMonth(records: BookRecord[]): MonthlyGroup[] {
  const groupMap = new Map<string, BookRecord[]>()

  for (const record of records) {
    const monthKey = dayjs(record.date).format('YYYY-MM')
    if (!groupMap.has(monthKey)) {
      groupMap.set(monthKey, [])
    }
    groupMap.get(monthKey)!.push(record)
  }

  const groups: MonthlyGroup[] = []
  for (const [monthKey, monthRecords] of groupMap.entries()) {
    const sortedRecords = [...monthRecords].sort((a, b) =>
      dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    )
    groups.push({
      monthKey,
      monthLabel: dayjs(monthKey).format('YYYY年MM月'),
      count: sortedRecords.length,
      totalPrice: Number(calculateTotalPrice(sortedRecords).toFixed(2)),
      records: sortedRecords,
    })
  }

  groups.sort((a, b) => dayjs(b.monthKey).valueOf() - dayjs(a.monthKey).valueOf())

  return groups
}
