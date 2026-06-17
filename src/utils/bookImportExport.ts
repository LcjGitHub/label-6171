import type { BookRecord } from '@/types/book'

/** 导出数据格式版本 */
export const EXPORT_FORMAT_VERSION = 1

/** 导出数据结构 */
export interface ExportData {
  version: number
  exportedAt: string
  records: BookRecord[]
}

/** 导入校验结果 */
export interface ImportValidationResult {
  valid: boolean
  errors: string[]
  records: BookRecord[]
}

/** 导入模式 */
export type ImportMode = 'overwrite' | 'merge'

/**
 * 将书籍记录导出为 JSON 文件并触发下载
 * @param records - 书籍记录数组
 * @param filename - 文件名（可选，默认自动生成）
 */
export function exportRecords(records: BookRecord[], filename?: string): void {
  const exportData: ExportData = {
    version: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    records: [...records],
  }

  const jsonString = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || generateExportFilename()
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 生成导出文件名
 */
function generateExportFilename(): string {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
  return `book-records-${dateStr}-${timeStr}.json`
}

/**
 * 从文件读取并解析导出数据
 * @param file - 上传的文件
 * @returns Promise<ExportData>
 */
export function readExportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content) as ExportData
        resolve(data)
      } catch (error) {
        reject(new Error('文件解析失败，请确保是有效的 JSON 文件'))
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsText(file)
  })
}

/**
 * 校验导入的记录数据
 * @param data - 导出数据
 * @returns 校验结果
 */
export function validateImportData(data: ExportData): ImportValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['数据格式无效'], records: [] }
  }

  if (data.version !== EXPORT_FORMAT_VERSION) {
    errors.push(`数据版本不兼容：当前版本 ${EXPORT_FORMAT_VERSION}，文件版本 ${data.version}`)
  }

  if (!Array.isArray(data.records)) {
    errors.push('记录数据格式错误：records 不是数组')
    return { valid: false, errors, records: [] }
  }

  const validRecords: BookRecord[] = []

  data.records.forEach((record, index) => {
    const recordErrors = validateSingleRecord(record, index)
    if (recordErrors.length === 0) {
      validRecords.push(record)
    } else {
      errors.push(...recordErrors)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    records: validRecords,
  }
}

/**
 * 校验单条记录
 */
function validateSingleRecord(record: unknown, index: number): string[] {
  const errors: string[] = []

  if (!record || typeof record !== 'object') {
    errors.push(`第 ${index + 1} 条记录格式无效`)
    return errors
  }

  const r = record as Record<string, unknown>

  if (!r.title || typeof r.title !== 'string' || r.title.trim() === '') {
    errors.push(`第 ${index + 1} 条记录缺少书名字段`)
  }

  if (r.price === undefined || r.price === null || isNaN(Number(r.price)) || Number(r.price) < 0) {
    errors.push(`第 ${index + 1} 条记录的购入价无效`)
  }

  return errors
}

/**
 * 合并记录（按 id 去重，新记录优先）
 * @param existingRecords - 现有记录
 * @param importedRecords - 导入的记录
 * @returns 合并后的记录
 */
export function mergeRecords(
  existingRecords: BookRecord[],
  importedRecords: BookRecord[]
): BookRecord[] {
  const recordMap = new Map<string, BookRecord>()

  existingRecords.forEach((record) => {
    recordMap.set(record.id, record)
  })

  importedRecords.forEach((record) => {
    recordMap.set(record.id, record)
  })

  return Array.from(recordMap.values())
}

/**
 * 获取导入统计信息
 */
export function getImportStats(
  existingRecords: BookRecord[],
  importedRecords: BookRecord[],
  mode: ImportMode
): { total: number; added: number; updated: number; unchanged: number } {
  if (mode === 'overwrite') {
    return {
      total: importedRecords.length,
      added: importedRecords.length,
      updated: 0,
      unchanged: 0,
    }
  }

  const existingIds = new Set(existingRecords.map((r) => r.id))
  let added = 0
  let updated = 0
  let unchanged = 0

  importedRecords.forEach((record) => {
    if (!existingIds.has(record.id)) {
      added++
    } else {
      const existing = existingRecords.find((r) => r.id === record.id)
      if (existing && JSON.stringify(existing) !== JSON.stringify(record)) {
        updated++
      } else {
        unchanged++
      }
    }
  })

  return {
    total: importedRecords.length,
    added,
    updated,
    unchanged,
  }
}
