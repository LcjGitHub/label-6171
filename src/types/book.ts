/** 书籍品相 */
export type BookCondition = '全新' | '良好' | '一般'

/** 用户淘书记录 */
export interface BookRecord {
  id: string
  title: string
  author: string
  price: number
  condition: BookCondition
  note: string
  date: string
}

/** 灵感书单条目 */
export interface InspirationBook {
  id: number
  title: string
  author: string
  description: string
  tags: string[]
}

/** 表单数据（不含 id） */
export type BookRecordForm = Omit<BookRecord, 'id'>

/** 品相选项 */
export const CONDITION_OPTIONS: BookCondition[] = ['全新', '良好', '一般']
