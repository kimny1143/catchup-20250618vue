import { ISlotRepository, Slot } from 'shared/repositories/ISlotRepository'

// メモリ上でスロットを管理する実装
export class MemorySlotRepository implements ISlotRepository {
  private slots: Map<string, Slot>

  constructor() {
    // 初期データ
    this.slots = new Map([
      ['slot-001', { id: 'slot-001', time: '2025-06-19 10:00', reserved: false }],
      ['slot-002', { id: 'slot-002', time: '2025-06-19 11:00', reserved: false }],
      ['slot-003', { id: 'slot-003', time: '2025-06-19 13:00', reserved: true }],
      ['slot-004', { id: 'slot-004', time: '2025-06-19 14:00', reserved: false }],
      ['slot-005', { id: 'slot-005', time: '2025-06-19 15:00', reserved: false }]
    ])
  }

  async getAllSlots(): Promise<Slot[]> {
    return Array.from(this.slots.values())
  }

  async getSlotById(id: string): Promise<Slot | null> {
    return this.slots.get(id) || null
  }

  async reserveSlot(id: string): Promise<Slot> {
    const slot = this.slots.get(id)
    if (!slot) {
      throw new Error('Slot not found')
    }
    if (slot.reserved) {
      throw new Error('Slot already reserved')
    }
    
    slot.reserved = true
    return slot
  }

  async findSlotByTime(time: string): Promise<Slot | null> {
    for (const slot of this.slots.values()) {
      if (slot.time === time) {
        return slot
      }
    }
    return null
  }

  async updateSlot(id: string, updates: Partial<Slot>): Promise<Slot> {
    const slot = this.slots.get(id)
    if (!slot) {
      throw new Error('Slot not found')
    }
    
    Object.assign(slot, updates)
    return slot
  }
}