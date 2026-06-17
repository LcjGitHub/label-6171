import { describe, it, expect } from 'vitest'
import type { BookRecord } from '@/types/book'
import {
  compareByDate,
  compareByPrice,
  sortRecords,
  getDateSortButtonText,
  toggleDateSort,
  getPriceSortButtonText,
  togglePriceSort,
} from '@/utils/bookSort'

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

describe('排序比较工具', () => {
  describe('compareByDate - 日期比较', () => {
    const a = createMockRecord({ date: '2025-01-01' })
    const b = createMockRecord({ date: '2025-06-01' })

    it('空排序方向返回 0', () => {
      expect(compareByDate(a, b, '')).toBe(0)
    })

    it('asc 由远到近：a 早于 b 返回负数', () => {
      expect(compareByDate(a, b, 'asc')).toBeLessThan(0)
    })

    it('asc 由远到近：b 晚于 a 返回正数', () => {
      expect(compareByDate(b, a, 'asc')).toBeGreaterThan(0)
    })

    it('desc 由近到远：a 早于 b 返回正数', () => {
      expect(compareByDate(a, b, 'desc')).toBeGreaterThan(0)
    })

    it('desc 由近到远：b 晚于 a 返回负数', () => {
      expect(compareByDate(b, a, 'desc')).toBeLessThan(0)
    })

    it('相同日期返回 0', () => {
      const c = createMockRecord({ date: '2025-01-01' })
      expect(compareByDate(a, c, 'asc')).toBe(0)
      expect(compareByDate(a, c, 'desc')).toBe(0)
    })
  })

  describe('compareByPrice - 价格比较', () => {
    const a = createMockRecord({ price: 10 })
    const b = createMockRecord({ price: 50 })

    it('空排序方向返回 0', () => {
      expect(compareByPrice(a, b, '')).toBe(0)
    })

    it('asc 由低到高：a 低于 b 返回负数', () => {
      expect(compareByPrice(a, b, 'asc')).toBeLessThan(0)
    })

    it('asc 由低到高：b 高于 a 返回正数', () => {
      expect(compareByPrice(b, a, 'asc')).toBeGreaterThan(0)
    })

    it('desc 由高到低：a 低于 b 返回正数', () => {
      expect(compareByPrice(a, b, 'desc')).toBeGreaterThan(0)
    })

    it('desc 由高到低：b 高于 a 返回负数', () => {
      expect(compareByPrice(b, a, 'desc')).toBeLessThan(0)
    })

    it('相同价格返回 0', () => {
      const c = createMockRecord({ price: 10 })
      expect(compareByPrice(a, c, 'asc')).toBe(0)
      expect(compareByPrice(a, c, 'desc')).toBe(0)
    })
  })

  describe('sortRecords - 组合排序', () => {
    const records = [
      createMockRecord({ id: '1', date: '2025-01-01', price: 30 }),
      createMockRecord({ id: '2', date: '2025-06-01', price: 10 }),
      createMockRecord({ id: '3', date: '2025-03-01', price: 50 }),
      createMockRecord({ id: '4', date: '2025-06-01', price: 20 }),
    ]

    it('空列表返回空数组', () => {
      expect(sortRecords([], '', '')).toEqual([])
    })

    it('无排序时保持原始顺序', () => {
      const result = sortRecords(records, '', '')
      expect(result.map((r) => r.id)).toEqual(['1', '2', '3', '4'])
    })

    it('仅按日期 asc 排序', () => {
      const result = sortRecords(records, 'asc', '')
      expect(result.map((r) => r.id)).toEqual(['1', '3', '2', '4'])
    })

    it('仅按日期 desc 排序', () => {
      const result = sortRecords(records, 'desc', '')
      expect(result.map((r) => r.id)).toEqual(['2', '4', '3', '1'])
    })

    it('仅按价格 asc 排序', () => {
      const result = sortRecords(records, '', 'asc')
      expect(result.map((r) => r.id)).toEqual(['2', '4', '1', '3'])
    })

    it('仅按价格 desc 排序', () => {
      const result = sortRecords(records, '', 'desc')
      expect(result.map((r) => r.id)).toEqual(['3', '1', '4', '2'])
    })

    it('日期 desc + 价格 asc 排序', () => {
      const result = sortRecords(records, 'desc', 'asc')
      expect(result.map((r) => r.id)).toEqual(['2', '4', '3', '1'])
    })

    it('日期 asc + 价格 desc 排序', () => {
      const result = sortRecords(records, 'asc', 'desc')
      expect(result.map((r) => r.id)).toEqual(['1', '3', '4', '2'])
    })

    it('不修改原始数组', () => {
      const originalIds = records.map((r) => r.id)
      sortRecords(records, 'desc', 'desc')
      expect(records.map((r) => r.id)).toEqual(originalIds)
    })
  })

  describe('getDateSortButtonText - 日期按钮文本', () => {
    it('无排序返回默认文本', () => {
      expect(getDateSortButtonText('')).toBe('按日期排序')
    })

    it('asc 显示日期 ↑', () => {
      expect(getDateSortButtonText('asc')).toBe('日期 ↑')
    })

    it('desc 显示日期 ↓', () => {
      expect(getDateSortButtonText('desc')).toBe('日期 ↓')
    })
  })

  describe('toggleDateSort - 切换日期排序', () => {
    it('循环顺序：无 → desc → asc → 无', () => {
      expect(toggleDateSort('')).toBe('desc')
      expect(toggleDateSort('desc')).toBe('asc')
      expect(toggleDateSort('asc')).toBe('')
    })
  })

  describe('getPriceSortButtonText - 价格按钮文本', () => {
    it('无排序返回默认文本', () => {
      expect(getPriceSortButtonText('')).toBe('按价格排序')
    })

    it('asc 显示价格 ↑', () => {
      expect(getPriceSortButtonText('asc')).toBe('价格 ↑')
    })

    it('desc 显示价格 ↓', () => {
      expect(getPriceSortButtonText('desc')).toBe('价格 ↓')
    })
  })

  describe('togglePriceSort - 切换价格排序', () => {
    it('循环顺序：无 → asc → desc → 无', () => {
      expect(togglePriceSort('')).toBe('asc')
      expect(togglePriceSort('asc')).toBe('desc')
      expect(togglePriceSort('desc')).toBe('')
    })
  })
})
