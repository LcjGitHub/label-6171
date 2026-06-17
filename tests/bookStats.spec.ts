import { describe, it, expect } from 'vitest'
import type { BookRecord } from '@/types/book'
import {
  calculateTotalCount,
  calculateTotalPrice,
  calculateAveragePrice,
  calculateConditionStats,
  getBookStatsSummary,
  groupRecordsByMonth,
} from '@/utils/bookStats'

function createMockRecord(partial: Partial<BookRecord> = {}): BookRecord {
  return {
    id: '1',
    title: '默认书名',
    author: '默认作者',
    price: 50,
    condition: '良好',
    note: '',
    date: '2025-01-15',
    purchaseChannel: '其他',
    ...partial,
  }
}

describe('统计汇总工具', () => {
  describe('calculateTotalCount - 计算藏书总数', () => {
    it('空列表返回 0', () => {
      expect(calculateTotalCount([])).toBe(0)
    })

    it('正常记录返回正确数量', () => {
      const records = [
        createMockRecord({ id: '1' }),
        createMockRecord({ id: '2' }),
        createMockRecord({ id: '3' }),
      ]
      expect(calculateTotalCount(records)).toBe(3)
    })
  })

  describe('calculateTotalPrice - 计算购入总价', () => {
    it('空列表返回 0', () => {
      expect(calculateTotalPrice([])).toBe(0)
    })

    it('正常记录返回正确总价', () => {
      const records = [
        createMockRecord({ price: 10.5 }),
        createMockRecord({ price: 20.3 }),
        createMockRecord({ price: 5 }),
      ]
      expect(calculateTotalPrice(records)).toBeCloseTo(35.8, 5)
    })

    it('单条记录返回其价格', () => {
      const records = [createMockRecord({ price: 99.99 })]
      expect(calculateTotalPrice(records)).toBe(99.99)
    })
  })

  describe('calculateAveragePrice - 计算平均单价', () => {
    it('空列表返回 0', () => {
      expect(calculateAveragePrice([])).toBe(0)
    })

    it('正常记录返回正确平均值', () => {
      const records = [
        createMockRecord({ price: 10 }),
        createMockRecord({ price: 20 }),
        createMockRecord({ price: 30 }),
      ]
      expect(calculateAveragePrice(records)).toBe(20)
    })

    it('单条记录返回其价格', () => {
      const records = [createMockRecord({ price: 15.5 })]
      expect(calculateAveragePrice(records)).toBe(15.5)
    })
  })

  describe('calculateConditionStats - 按品相统计', () => {
    it('空列表所有品相计数为 0', () => {
      const stats = calculateConditionStats([])
      expect(stats).toHaveLength(3)
      stats.forEach((s) => {
        expect(s.count).toBe(0)
        expect(s.percentage).toBe(0)
      })
    })

    it('正常记录统计正确', () => {
      const records = [
        createMockRecord({ condition: '全新' }),
        createMockRecord({ condition: '全新' }),
        createMockRecord({ condition: '良好' }),
        createMockRecord({ condition: '良好' }),
        createMockRecord({ condition: '良好' }),
        createMockRecord({ condition: '一般' }),
      ]
      const stats = calculateConditionStats(records)
      expect(stats.find((s) => s.condition === '全新')!.count).toBe(2)
      expect(stats.find((s) => s.condition === '全新')!.percentage).toBeCloseTo(33.33, 1)
      expect(stats.find((s) => s.condition === '良好')!.count).toBe(3)
      expect(stats.find((s) => s.condition === '良好')!.percentage).toBe(50)
      expect(stats.find((s) => s.condition === '一般')!.count).toBe(1)
      expect(stats.find((s) => s.condition === '一般')!.percentage).toBeCloseTo(16.67, 1)
    })

    it('包含非法品相的记录（类型系统已阻止）只统计合法品相', () => {
      const records: BookRecord[] = [
        createMockRecord({ condition: '全新' }),
        createMockRecord({ condition: '良好' }),
      ]
      const stats = calculateConditionStats(records)
      const total = stats.reduce((sum, s) => sum + s.count, 0)
      expect(total).toBe(2)
    })
  })

  describe('getBookStatsSummary - 完整统计汇总', () => {
    it('空列表汇总结果正确', () => {
      const summary = getBookStatsSummary([])
      expect(summary.totalCount).toBe(0)
      expect(summary.totalPrice).toBe(0)
      expect(summary.averagePrice).toBe(0)
      expect(summary.conditionStats).toHaveLength(3)
    })

    it('正常记录汇总结果正确', () => {
      const records = [
        createMockRecord({ id: '1', price: 10, condition: '全新', date: '2025-01-01' }),
        createMockRecord({ id: '2', price: 20, condition: '良好', date: '2025-02-15' }),
        createMockRecord({ id: '3', price: 30, condition: '一般', date: '2025-03-20' }),
      ]
      const summary = getBookStatsSummary(records)
      expect(summary.totalCount).toBe(3)
      expect(summary.totalPrice).toBe(60)
      expect(summary.averagePrice).toBe(20)
      expect(summary.conditionStats.find((s) => s.condition === '全新')!.count).toBe(1)
    })
  })

  describe('groupRecordsByMonth - 按月份分组', () => {
    it('空列表返回空数组', () => {
      expect(groupRecordsByMonth([])).toEqual([])
    })

    it('同月记录分到同一组', () => {
      const records = [
        createMockRecord({ id: '1', date: '2025-01-05', price: 10 }),
        createMockRecord({ id: '2', date: '2025-01-20', price: 20 }),
        createMockRecord({ id: '3', date: '2025-03-10', price: 30 }),
      ]
      const groups = groupRecordsByMonth(records)
      expect(groups).toHaveLength(2)
      expect(groups[0].monthKey).toBe('2025-03')
      expect(groups[0].count).toBe(1)
      expect(groups[1].monthKey).toBe('2025-01')
      expect(groups[1].count).toBe(2)
      expect(groups[1].totalPrice).toBe(30)
    })

    it('组内按日期由近到远排序', () => {
      const records = [
        createMockRecord({ id: '1', date: '2025-01-05' }),
        createMockRecord({ id: '2', date: '2025-01-20' }),
        createMockRecord({ id: '3', date: '2025-01-10' }),
      ]
      const groups = groupRecordsByMonth(records)
      expect(groups).toHaveLength(1)
      const groupRecords = groups[0].records
      expect(groupRecords[0].id).toBe('2')
      expect(groupRecords[1].id).toBe('3')
      expect(groupRecords[2].id).toBe('1')
    })
  })
})
