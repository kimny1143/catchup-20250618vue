// SlotRepositoryインターフェース定義
export interface Slot {
  id: string
  time: string
  reserved: boolean
}

export interface ISlotRepository {
  // 全スロットを取得
  getAllSlots(): Promise<Slot[]>
  
  // IDでスロットを取得
  getSlotById(id: string): Promise<Slot | null>
  
  // スロットを予約
  reserveSlot(id: string): Promise<Slot>
  
  // 時間でスロットを検索
  findSlotByTime(time: string): Promise<Slot | null>
  
  // スロットの更新
  updateSlot(id: string, updates: Partial<Slot>): Promise<Slot>
}