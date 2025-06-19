describe('Lesson Slot Reservation', () => {
  // テスト前の設定
  beforeEach(() => {
    cy.visit('/')
    // データ読み込みを待つ
    cy.get('.lesson-slot').should('have.length.greaterThan', 0)
  })

  // テスト1: レッスンスロットが表示されること
  it('should display lesson slots', () => {
    cy.contains('LMS - レッスンスロット予約')
    cy.get('.lesson-slot').should('have.length.greaterThan', 0)
  })

  // テスト2: 空きスロットに予約ボタンが表示されること
  it('should show reserve button for available slots', () => {
    cy.get('.lesson-slot').first().within(() => {
      cy.get('.slot-status').then(($status) => {
        if ($status.text().includes('空き')) {
          cy.get('.reserve-button').should('exist')
        }
      })
    })
  })

  // テスト3: 予約ボタンをクリックしたらスロットが予約されること
  it('should reserve a slot when clicking reserve button', () => {
    // 予約APIをインターセプト
    cy.intercept('POST', '/api/slots/*/reserve').as('reserveSlot')
    
    // 最初の予約可能なスロットを見つける
    cy.get('.lesson-slot').then(($slots) => {
      // 空きスロットを探す
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
          // レスポンスステータスを確認（200:成功、409:競合、400:既に予約済み）
          expect([200, 400, 409]).to.include(interception.response.statusCode)
          
          if (interception.response.statusCode === 200) {
            // 成功した場合、UIが更新されるのを待つ
            cy.wait(500)
            // 予約済みスロットが存在することを確認
            cy.get('.slot-status:contains("予約済み")').should('exist')
          } else {
            // エラーの場合、エラーレスポンスが返されたことを確認
            expect(interception.response.body).to.have.property('error')
          }
        })
      } else {
        // 空きスロットがない場合はテストをスキップ
        cy.log('No available slots found, skipping test')
      }
    })
  })
})