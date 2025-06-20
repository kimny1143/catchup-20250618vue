import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import slotsRouter from './routes/slots'
import { openApiDocument } from './openapi'

// アプリケーションを作成
const app = express()
// ポートを設定
const PORT = process.env.PORT || 4000

// CORSを有効化
app.use(cors())
app.use(express.json())

// Swagger UIをセットアップ
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

// OpenAPI JSONエンドポイント
app.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument)
})

// スロットルートを使用
app.use('/api/slots', slotsRouter)

// サーバーを起動
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

// シグナルを受け取ったらサーバーを停止
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})

// シグナルを受け取ったらサーバーを停止
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})