import { Router } from 'express'
import { z } from 'zod'
import { MemorySlotRepository } from '../repositories/MemorySlotRepository'
import { CheckConflictBodySchema, ReserveSlotParamsSchema } from '../schemas/slot.schema'
const addon = require('slot-analyzer')

// ルーターを作成
const router = Router()

// リポジトリのインスタンス
const slotRepository = new MemorySlotRepository()

// GET /api/slots - 全スロット一覧を返す
router.get('/', async (_req, res) => {
  try {
    const slots = await slotRepository.getAllSlots()
    res.json(slots)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' })
  }
})

// POST /api/slots/:id/reserve - スロットを予約
router.post('/:id/reserve', async (req, res) => {
  try {
    // パラメータ検証
    const params = ReserveSlotParamsSchema.parse(req.params)
    const { id } = params
    
    // スロットを取得
    const slot = await slotRepository.getSlotById(id)
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' })
    }
    
    // スロットが既に予約されている場合
    if (slot.reserved) {
      return res.status(400).json({ error: 'Slot is already reserved' })
    }
    
    // 全スロットを取得して競合チェック
    const allSlots = await slotRepository.getAllSlots()
    const hasConflict = addon.checkConflict(allSlots, slot.time)
    if (hasConflict) {
      return res.status(409).json({ 
        error: 'Time conflict detected',
        message: '選択した時間帯は他の予約と近すぎます（1時間以内）'
      })
    }
    
    // スロットを予約
    const reservedSlot = await slotRepository.reserveSlot(id)
    res.json(reservedSlot)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request parameters', details: error.errors })
    }
    res.status(500).json({ error: 'Failed to reserve slot' })
  }
})

// POST /api/slots/check-conflict - 時間競合チェック
router.post('/check-conflict', async (req, res) => {
  try {
    // リクエストボディ検証
    const body = CheckConflictBodySchema.parse(req.body)
    const { time } = body
    
    // 全スロットを取得して競合チェック
    const allSlots = await slotRepository.getAllSlots()
    const hasConflict = addon.checkConflict(allSlots, time)
    
    res.json({ 
      hasConflict,
      message: hasConflict 
        ? '選択した時間帯は他の予約と競合しています' 
        : '予約可能な時間帯です'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid time format', 
        message: error.errors[0]?.message || 'Time must be in format YYYY-MM-DD HH:MM'
      })
    }
    res.status(500).json({ error: 'Failed to check conflict' })
  }
})

// GET /api/slots/optimal - 最適な予約時間を提案
router.get('/optimal', async (_req, res) => {
  try {
    // 全スロットを取得
    const allSlots = await slotRepository.getAllSlots()
    
    // C++アドオンで最適スロットを計算
    const optimal = addon.calculateOptimalSlot(allSlots)
    
    res.json({
      optimal,
      message: '最適な予約時間を計算しました'
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate optimal slot' })
  }
})

export default router