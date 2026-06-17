/** 书籍品相 */
export type BookCondition = '全新' | '良好' | '一般'

/** 购入渠道 */
export type PurchaseChannel = '孔夫子旧书网' | '多抓鱼' | '线下书店' | '其他'

/** 用户淘书记录 */
export interface BookRecord {
  id: string
  title: string
  author: string
  price: number
  condition: BookCondition
  note: string
  date: string
  purchaseChannel?: PurchaseChannel
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

/** 购入渠道选项 */
export const PURCHASE_CHANNEL_OPTIONS: PurchaseChannel[] = ['孔夫子旧书网', '多抓鱼', '线下书店', '其他']

/** 购书心愿条目 */
export interface BookWish {
  id: string
  title: string
  author: string
  maxPrice: number
  note: string
}

/** 心愿单表单数据（不含 id） */
export type BookWishForm = Omit<BookWish, 'id'>
