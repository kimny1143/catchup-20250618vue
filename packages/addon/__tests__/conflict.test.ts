const addon = require('../build/Release/slot_analyzer')

describe('Conflict Detection Tests', () => {
  const baseSlots = [
    { id: 'slot-001', time: '2025-06-19 10:00', reserved: false },
    { id: 'slot-002', time: '2025-06-19 11:00', reserved: false },
    { id: 'slot-003', time: '2025-06-19 13:00', reserved: true },
    { id: 'slot-004', time: '2025-06-19 14:00', reserved: false },
    { id: 'slot-005', time: '2025-06-19 15:00', reserved: false }
  ]

  describe('checkConflict', () => {
    it('should detect conflict within 1 hour of reserved slot', () => {
      // 13:00が予約済みなので、13:30は競合するはず
      const hasConflict = addon.checkConflict(baseSlots, '2025-06-19 13:30')
      expect(hasConflict).toBe(true)
    })

    it('should not detect conflict for slots more than 1 hour apart', () => {
      // 13:00が予約済みだが、16:00は1時間以上離れているので競合しない
      const hasConflict = addon.checkConflict(baseSlots, '2025-06-19 16:00')
      expect(hasConflict).toBe(false)
    })

    it('should handle edge case of exactly 1 hour gap', () => {
      // 13:00が予約済みで、14:00は丁度1時間後なので競合しない
      const hasConflict = addon.checkConflict(baseSlots, '2025-06-19 14:00')
      expect(hasConflict).toBe(false)
    })

    it('should handle invalid time format gracefully', () => {
      // 無効な時間フォーマットの場合、エラーがスローされることを確認
      expect(() => {
        addon.checkConflict(baseSlots, 'invalid-time')
      }).toThrow()
    })
  })

  describe('calculateOptimalSlot', () => {
    it('should find optimal slot with maximum gap', () => {
      const result = addon.calculateOptimalSlot(baseSlots)
      expect(result).toHaveProperty('optimalTimeStamp')
      expect(result).toHaveProperty('gapMinutes')
      expect(result.gapMinutes).toBeGreaterThan(0)
    })
  })

  describe('analyzeSlot', () => {
    it('should return string length of slot ID', () => {
      const length = addon.analyzeSlot('slot-001')
      expect(length).toBe(8)
    })

    it('should handle empty string', () => {
      const length = addon.analyzeSlot('')
      expect(length).toBe(0)
    })
  })
})