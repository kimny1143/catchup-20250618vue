import request from 'supertest'
import express from 'express'
import slotsRouter from '../src/routes/slots'

const app = express()
app.use(express.json())
app.use('/api/slots', slotsRouter)

describe('Slots API', () => {
  describe('GET /api/slots', () => {
    it('should return all slots', async () => {
      const response = await request(app)
        .get('/api/slots')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty('id')
      expect(response.body[0]).toHaveProperty('time')
      expect(response.body[0]).toHaveProperty('reserved')
    })
  })

  describe('POST /api/slots/:id/reserve', () => {
    it('should reserve an available slot', async () => {
      // まず空きスロットを探す
      const slotsResponse = await request(app).get('/api/slots')
      const availableSlot = slotsResponse.body.find((s: any) => !s.reserved)
      
      if (availableSlot) {
        const response = await request(app)
          .post(`/api/slots/${availableSlot.id}/reserve`)
          .expect(200)
        
        expect(response.body.reserved).toBe(true)
        expect(response.body.id).toBe(availableSlot.id)
      }
    })

    it('should return 404 for non-existent slot', async () => {
      const response = await request(app)
        .post('/api/slots/non-existent-id/reserve')
        .expect(404)
      
      expect(response.body).toHaveProperty('error', 'Slot not found')
    })
  })

  describe('POST /api/slots/check-conflict', () => {
    it('should check for time conflicts', async () => {
      const response = await request(app)
        .post('/api/slots/check-conflict')
        .send({ time: '2025-06-19 13:30' })
        .expect(200)
      
      expect(response.body).toHaveProperty('hasConflict')
      expect(response.body).toHaveProperty('message')
    })

    it('should return 400 for invalid time format', async () => {
      const response = await request(app)
        .post('/api/slots/check-conflict')
        .send({ time: 'invalid-time' })
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 when time is missing', async () => {
      const response = await request(app)
        .post('/api/slots/check-conflict')
        .send({})
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/slots/optimal', () => {
    it('should return optimal slot information', async () => {
      const response = await request(app)
        .get('/api/slots/optimal')
        .expect(200)
      
      expect(response.body).toHaveProperty('optimal')
      expect(response.body.optimal).toHaveProperty('optimalTimeStamp')
      expect(response.body.optimal).toHaveProperty('gapMinutes')
      expect(response.body).toHaveProperty('message')
    })
  })
})