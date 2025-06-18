import { Router } from 'express'
import type { Slot } from '../types/slot'

const router = Router()

// メモリ内データベース（リロードで初期化）
let slots: Slot[] = [
  { id: 'slot-001', time: '2025-06-19 10:00', reserved: false },
  { id: 'slot-002', time: '2025-06-19 11:00', reserved: false },
  { id: 'slot-003', time: '2025-06-19 13:00', reserved: true },
  { id: 'slot-004', time: '2025-06-19 14:00', reserved: false },
  { id: 'slot-005', time: '2025-06-19 15:00', reserved: false },
]

// GET /api/slots - 全スロット一覧を返す
router.get('/', (req, res) => {
  res.json(slots)
})

// POST /api/slots/:id/reserve - スロットを予約
router.post('/:id/reserve', (req, res) => {
  const { id } = req.params
  const slotIndex = slots.findIndex(slot => slot.id === id)
  
  if (slotIndex === -1) {
    return res.status(404).json({ error: 'Slot not found' })
  }
  
  if (slots[slotIndex].reserved) {
    return res.status(400).json({ error: 'Slot is already reserved' })
  }
  
  slots[slotIndex].reserved = true
  res.json(slots[slotIndex])
})

export default router