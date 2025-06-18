import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import {
  SlotSchema,
  ReserveSlotParamsSchema,
  CheckConflictBodySchema,
  CheckConflictResponseSchema,
  OptimalSlotResponseSchema,
  ErrorResponseSchema,
} from './schemas/slot.schema'
import { z } from 'zod'

// OpenAPIレジストリを作成
export const registry = new OpenAPIRegistry()

// スキーマを登録
registry.register('Slot', SlotSchema)
registry.register('ConflictCheckResponse', CheckConflictResponseSchema)
registry.register('OptimalSlotResponse', OptimalSlotResponseSchema)
registry.register('ErrorResponse', ErrorResponseSchema)

// GET /api/slots
registry.registerPath({
  method: 'get',
  path: '/api/slots',
  description: '全てのレッスンスロットを取得します',
  summary: 'スロット一覧取得',
  tags: ['Slots'],
  responses: {
    200: {
      description: 'スロット一覧',
      content: {
        'application/json': {
          schema: z.array(SlotSchema)
        }
      }
    }
  }
})

// POST /api/slots/:id/reserve
registry.registerPath({
  method: 'post',
  path: '/api/slots/{id}/reserve',
  description: '指定されたスロットを予約します',
  summary: 'スロット予約',
  tags: ['Slots'],
  request: {
    params: ReserveSlotParamsSchema
  },
  responses: {
    200: {
      description: '予約成功',
      content: {
        'application/json': {
          schema: SlotSchema
        }
      }
    },
    400: {
      description: 'スロットが既に予約済み',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    404: {
      description: 'スロットが見つからない',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    409: {
      description: '時間の競合が検出された',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
})

// POST /api/slots/check-conflict
registry.registerPath({
  method: 'post',
  path: '/api/slots/check-conflict',
  description: '指定時刻に競合があるかチェックします',
  summary: '競合チェック',
  tags: ['Slots'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CheckConflictBodySchema
        }
      }
    }
  },
  responses: {
    200: {
      description: '競合チェック結果',
      content: {
        'application/json': {
          schema: CheckConflictResponseSchema
        }
      }
    },
    400: {
      description: '不正なリクエスト',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
})

// GET /api/slots/optimal
registry.registerPath({
  method: 'get',
  path: '/api/slots/optimal',
  description: '最適な予約時間を提案します（C++アドオンによる高速計算）',
  summary: '最適スロット提案',
  tags: ['Slots'],
  responses: {
    200: {
      description: '最適スロット情報',
      content: {
        'application/json': {
          schema: OptimalSlotResponseSchema
        }
      }
    }
  }
})

// OpenAPI仕様を生成
const generator = new OpenApiGeneratorV3(registry.definitions)

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Catchup LMS API',
    description: 'Vue3 + Express + C++で実装されたレッスン予約システムのAPI'
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development server'
    }
  ]
})