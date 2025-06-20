import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

// Zodを拡張してOpenAPIサポートを追加
extendZodWithOpenApi(z)

// ISO-8601形式の時間文字列検証（カスタムYYYY-MM-DD HH:MM形式）
export const TimeISOSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, {
    message: 'Time must be in format YYYY-MM-DD HH:MM'
  })
  .openapi({ 
    example: '2025-06-19 10:00',
    description: 'Time in YYYY-MM-DD HH:MM format'
  })

// Slotスキーマ定義
export const SlotSchema = z.object({
  id: z.string().openapi({ example: 'slot-001' }),
  time: TimeISOSchema,
  reserved: z.boolean().openapi({ example: false })
}).openapi('Slot')

// 予約リクエストのスキーマ
export const ReserveSlotParamsSchema = z.object({
  id: z.string().openapi({ example: 'slot-001' })
})

// 競合チェックリクエストのスキーマ
export const CheckConflictBodySchema = z.object({
  time: TimeISOSchema
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