import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

// Zodを拡張してOpenAPIサポートを追加
extendZodWithOpenApi(z)

// Slotスキーマ定義
export const SlotSchema = z.object({
  id: z.string().openapi({ example: 'slot-001' }),
  time: z.string().openapi({ example: '2025-06-19 10:00' }),
  reserved: z.boolean().openapi({ example: false })
}).openapi('Slot')

// 予約リクエストのスキーマ
export const ReserveSlotParamsSchema = z.object({
  id: z.string().openapi({ example: 'slot-001' })
})

// 競合チェックリクエストのスキーマ
export const CheckConflictBodySchema = z.object({
  time: z.string().openapi({ example: '2025-06-19 13:30' })
})

// 競合チェックレスポンスのスキーマ
export const CheckConflictResponseSchema = z.object({
  hasConflict: z.boolean(),
  message: z.string()
}).openapi('ConflictCheckResponse')

// 最適スロットレスポンスのスキーマ
export const OptimalSlotResponseSchema = z.object({
  optimal: z.object({
    optimalTimeStamp: z.number(),
    gapMinutes: z.number()
  }),
  message: z.string()
}).openapi('OptimalSlotResponse')

// エラーレスポンスのスキーマ
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional()
}).openapi('ErrorResponse')

// 型エクスポート
export type Slot = z.infer<typeof SlotSchema>
export type CheckConflictBody = z.infer<typeof CheckConflictBodySchema>
export type CheckConflictResponse = z.infer<typeof CheckConflictResponseSchema>
export type OptimalSlotResponse = z.infer<typeof OptimalSlotResponseSchema>