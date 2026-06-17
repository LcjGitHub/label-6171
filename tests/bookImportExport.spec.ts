import { describe, it, expect } from 'vitest'
import type { BookRecord } from '@/types/book'
import {
  EXPORT_FORMAT_VERSION,
  validateImportData,
  mergeRecords,
  getImportStats,
} from '@/utils/bookImportExport'
import type { ExportData } from '@/utils/bookImportExport'

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

function createValidExportData(records: BookRecord[] = []): ExportData {
  return {
    version: EXPORT_FORMAT_VERSION,
    exportedAt: '2025-06-17T00:00:00.000Z',
    records,
  }
}

describe('导入校验工具', () => {
  describe('validateImportData - 导入数据校验', () => {
    it('null 或 undefined 数据返回格式无效', () => {
      const result1 = validateImportData(null as unknown as ExportData)
      expect(result1.valid).toBe(false)
      expect(result1.errors).toContain('数据格式无效')
      expect(result1.records).toEqual([])

      const result2 = validateImportData(undefined as unknown as ExportData)
      expect(result2.valid).toBe(false)
      expect(result2.errors).toContain('数据格式无效')
    })

    it('非对象数据返回格式无效', () => {
      const result = validateImportData('invalid' as unknown as ExportData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('数据格式无效')
    })

    it('版本不兼容返回错误', () => {
      const data = createValidExportData([])
      data.version = 999
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('版本不兼容'))).toBe(true)
    })

    it('records 不是数组返回错误', () => {
      const data = createValidExportData()
      ;(data as any).records = 'not-an-array'
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('记录数据格式错误：records 不是数组')
      expect(result.records).toEqual([])
    })

    it('空 records 数组通过校验', () => {
      const data = createValidExportData([])
      const result = validateImportData(data)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.records).toEqual([])
    })

    it('正常记录全部通过校验', () => {
      const records = [
        createMockRecord({ id: '1', title: '活着', price: 35.5 }),
        createMockRecord({ id: '2', title: '三体', price: 68, purchaseChannel: '孔夫子旧书网' }),
      ]
      const data = createValidExportData(records)
      const result = validateImportData(data)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.records).toHaveLength(2)
    })

    it('缺少书名字段的记录被标记错误', () => {
      const invalidRecord: any = {
        id: '1',
        author: '余华',
        price: 35,
        condition: '良好',
        note: '',
        date: '2025-01-01',
      }
      invalidRecord.title = ''
      const data = createValidExportData([invalidRecord as BookRecord])
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('缺少书名字段'))).toBe(true)
      expect(result.records).toEqual([])
    })

    it('书名为空字符串的记录被标记错误', () => {
      const record = createMockRecord({ title: '   ' })
      const data = createValidExportData([record])
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('缺少书名字段'))).toBe(true)
    })

    it('价格为负数被标记错误', () => {
      const record = createMockRecord({ price: -10 })
      const data = createValidExportData([record])
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('购入价无效'))).toBe(true)
    })

    it('价格为 NaN 被标记错误', () => {
      const invalidRecord: any = createMockRecord()
      invalidRecord.price = NaN
      const data = createValidExportData([invalidRecord as BookRecord])
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('购入价无效'))).toBe(true)
    })

    it('非法购入渠道被标记错误', () => {
      const invalidRecord: any = createMockRecord()
      invalidRecord.purchaseChannel = '亚马逊'
      const data = createValidExportData([invalidRecord as BookRecord])
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('购入渠道无效'))).toBe(true)
      expect(result.errors.some((e) => e.includes('亚马逊'))).toBe(true)
    })

    it('非法购入渠道（非字符串）被标记错误', () => {
      const invalidRecord: any = createMockRecord()
      invalidRecord.purchaseChannel = 123
      const data = createValidExportData([invalidRecord as BookRecord])
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('购入渠道无效'))).toBe(true)
    })

    it('部分有效部分无效时，只保留有效记录并返回所有错误', () => {
      const validRecord = createMockRecord({ id: '1', title: '有效书籍' })
      const invalidRecord: any = createMockRecord({ id: '2' })
      invalidRecord.title = ''
      invalidRecord.price = -5
      const data = createValidExportData([validRecord, invalidRecord as BookRecord])
      const result = validateImportData(data)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
      expect(result.records).toHaveLength(1)
      expect(result.records[0].id).toBe('1')
    })

    it('非法品相（运行时数据）不被拦截但仍计入有效记录', () => {
      const invalidRecord: any = createMockRecord()
      invalidRecord.condition = '破损严重'
      const data = createValidExportData([invalidRecord as BookRecord])
      const result = validateImportData(data)
      expect(result.records).toHaveLength(1)
    })
  })

  describe('mergeRecords - 重复合并', () => {
    it('双方均为空列表返回空数组', () => {
      expect(mergeRecords([], [])).toEqual([])
    })

    it('仅现有记录返回现有记录', () => {
      const existing = [createMockRecord({ id: '1' })]
      const result = mergeRecords(existing, [])
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('仅导入记录返回导入记录', () => {
      const imported = [createMockRecord({ id: '1' })]
      const result = mergeRecords([], imported)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('无重复 id 时合并所有记录', () => {
      const existing = [createMockRecord({ id: '1', title: '旧书1' })]
      const imported = [createMockRecord({ id: '2', title: '新书2' })]
      const result = mergeRecords(existing, imported)
      expect(result).toHaveLength(2)
      expect(result.find((r) => r.id === '1')!.title).toBe('旧书1')
      expect(result.find((r) => r.id === '2')!.title).toBe('新书2')
    })

    it('重复 id 时导入记录覆盖现有记录（新记录优先）', () => {
      const existing = [createMockRecord({ id: '1', title: '旧标题', price: 30 })]
      const imported = [createMockRecord({ id: '1', title: '新标题', price: 50 })]
      const result = mergeRecords(existing, imported)
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('新标题')
      expect(result[0].price).toBe(50)
    })

    it('多条记录部分重复时正确合并', () => {
      const existing = [
        createMockRecord({ id: '1', title: '保持不变' }),
        createMockRecord({ id: '2', title: '将被覆盖' }),
      ]
      const imported = [
        createMockRecord({ id: '2', title: '已覆盖' }),
        createMockRecord({ id: '3', title: '新增记录' }),
      ]
      const result = mergeRecords(existing, imported)
      expect(result).toHaveLength(3)
      expect(result.find((r) => r.id === '1')!.title).toBe('保持不变')
      expect(result.find((r) => r.id === '2')!.title).toBe('已覆盖')
      expect(result.find((r) => r.id === '3')!.title).toBe('新增记录')
    })
  })

  describe('getImportStats - 导入统计信息', () => {
    describe('overwrite 覆盖模式', () => {
      it('空导入列表统计全为 0', () => {
        const stats = getImportStats([], [], 'overwrite')
        expect(stats).toEqual({ total: 0, added: 0, updated: 0, unchanged: 0 })
      })

      it('有导入记录时 total 和 added 等于导入数量', () => {
        const imported = [
          createMockRecord({ id: '1' }),
          createMockRecord({ id: '2' }),
        ]
        const stats = getImportStats([], imported, 'overwrite')
        expect(stats.total).toBe(2)
        expect(stats.added).toBe(2)
        expect(stats.updated).toBe(0)
        expect(stats.unchanged).toBe(0)
      })
    })

    describe('merge 合并模式', () => {
      it('全部为新增记录', () => {
        const existing = [createMockRecord({ id: '1' })]
        const imported = [
          createMockRecord({ id: '2' }),
          createMockRecord({ id: '3' }),
        ]
        const stats = getImportStats(existing, imported, 'merge')
        expect(stats.total).toBe(2)
        expect(stats.added).toBe(2)
        expect(stats.updated).toBe(0)
        expect(stats.unchanged).toBe(0)
      })

      it('全部为更新记录（id 相同但内容不同）', () => {
        const existing = [
          createMockRecord({ id: '1', title: '旧标题A', price: 10 }),
          createMockRecord({ id: '2', title: '旧标题B', price: 20 }),
        ]
        const imported = [
          createMockRecord({ id: '1', title: '新标题A', price: 15 }),
          createMockRecord({ id: '2', title: '新标题B', price: 25 }),
        ]
        const stats = getImportStats(existing, imported, 'merge')
        expect(stats.total).toBe(2)
        expect(stats.added).toBe(0)
        expect(stats.updated).toBe(2)
        expect(stats.unchanged).toBe(0)
      })

      it('全部为未变记录（id 和内容都相同）', () => {
        const existing = [
          createMockRecord({ id: '1' }),
          createMockRecord({ id: '2' }),
        ]
        const imported = [
          createMockRecord({ id: '1' }),
          createMockRecord({ id: '2' }),
        ]
        const stats = getImportStats(existing, imported, 'merge')
        expect(stats.total).toBe(2)
        expect(stats.added).toBe(0)
        expect(stats.updated).toBe(0)
        expect(stats.unchanged).toBe(2)
      })

      it('混合场景：新增 + 更新 + 未变', () => {
        const existing = [
          createMockRecord({ id: '1', title: '保持相同' }),
          createMockRecord({ id: '2', title: '将被修改', price: 10 }),
        ]
        const imported = [
          createMockRecord({ id: '1', title: '保持相同' }),
          createMockRecord({ id: '2', title: '已经修改', price: 99 }),
          createMockRecord({ id: '3', title: '全新记录' }),
        ]
        const stats = getImportStats(existing, imported, 'merge')
        expect(stats.total).toBe(3)
        expect(stats.added).toBe(1)
        expect(stats.updated).toBe(1)
        expect(stats.unchanged).toBe(1)
      })
    })
  })
})
