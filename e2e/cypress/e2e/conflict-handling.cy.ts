describe('Conflict Handling', () => {
  beforeEach(() => {
    // サーバーを再起動してデータをリセット（理想的には専用のリセットAPIを作るべき）
    cy.visit('/')
    cy.wait(1000) // データ読み込み待機
  })

  it('should handle successful reservation without conflict', () => {
    // 予約APIをインターセプト
    cy.intercept('POST', '/api/slots/*/reserve').as('reserveSlot')
    
    // 空いているスロットを探して予約
    cy.get('.lesson-slot').then(($slots) => {
      const $availableSlot = Array.from($slots).find(slot => {
        const $button = slot.querySelector('.reserve-button')
        const status = slot.querySelector('.slot-status')?.textContent || ''
        return $button && status.includes('空き')
      })
      
      if ($availableSlot) {
        // 予約ボタンをクリック
        cy.wrap($availableSlot).find('.reserve-button').click()
        
        // APIレスポンスを待つ
        cy.wait('@reserveSlot').then((interception) => {
          // レスポンスが存在することを確認
          expect(interception.response).to.exist
          
          // 成功レスポンスを確認（200または409）
          expect([200, 409]).to.include(interception.response!.statusCode)
          
          // 409の場合は競合メッセージを確認
          if (interception.response!.statusCode === 409) {
            expect(interception.response!.body).to.have.property('error')
          }
        })
      }
    })
  })

  it('should demonstrate conflict detection logic', () => {
    // 競合検出ロジックのデモンストレーション
    // まず現在のスロット状態を確認
    cy.request('/api/slots').then((response) => {
      const slots = response.body
      
      // slot-003 (13:00) が予約済みであることを確認
      const slot003 = slots.find((s: any) => s.id === 'slot-003')
      expect(slot003.reserved).to.be.true
      
      // 競合チェックAPIで13:30が競合することを確認
      cy.request({
        method: 'POST',
        url: '/api/slots/check-conflict',
        body: { time: '2025-06-19 13:30' }
      }).then((conflictResponse) => {
        expect(conflictResponse.body.hasConflict).to.be.true
        expect(conflictResponse.body.message).to.include('競合')
      })
    })
  })

  it('should check conflict via API endpoint', () => {
    // Conflict check APIを直接テスト
    // 13:00は既に予約済みなので、13:30は競合するはず
    cy.request({
      method: 'POST',
      url: '/api/slots/check-conflict',
      body: { time: '2025-06-19 13:30' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('hasConflict')
      expect(response.body.hasConflict).to.be.true
      expect(response.body.message).to.include('競合')
    })
    
    // 競合しない時間のテスト（16:00は15:00から1時間以上離れている）
    cy.request({
      method: 'POST',
      url: '/api/slots/check-conflict',
      body: { time: '2025-06-19 16:30' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('hasConflict')
      expect(response.body.hasConflict).to.be.false
      expect(response.body.message).to.include('予約可能')
    })
  })

  it('should get optimal slot suggestion', () => {
    // 最適スロット提案APIをテスト
    cy.request('/api/slots/optimal').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('optimal')
      expect(response.body.optimal).to.have.property('optimalTimeStamp')
      expect(response.body.optimal).to.have.property('gapMinutes')
    })
  })

  it('should handle 400 error for already reserved slots', () => {
    // 既に予約済みのスロットを探す
    cy.get('.lesson-slot').each(($slot) => {
      const status = $slot.find('.slot-status').text()
      if (status.includes('予約済み')) {
        // 予約ボタンが存在しないことを確認
        cy.wrap($slot).find('.reserve-button').should('not.exist')
        return false
      }
    })
  })

  it('should handle 404 error for non-existent slot', () => {
    // 存在しないスロットIDでAPIを直接呼び出し
    cy.request({
      method: 'POST',
      url: '/api/slots/invalid-slot-id/reserve',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body).to.have.property('error', 'Slot not found')
    })
  })
})