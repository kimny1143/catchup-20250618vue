describe('Lesson Slot Reservation', () => {
  // テスト前の設定
  beforeEach(() => {
    cy.visit('/')
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
    // 空きスロットを探す
    cy.get('.lesson-slot').each(($slot) => {
      const status = $slot.find('.slot-status').text()
      if (status.includes('空き')) {
        cy.wrap($slot).within(() => {
          cy.get('.reserve-button').click()
        })
        
        // 予約後の確認
        cy.wrap($slot).within(() => {
          cy.get('.slot-status').should('contain', '予約済み')
          cy.get('.reserve-button').should('not.exist')
        })
        
        return false // 最初の空きスロットで終了
      }
    })
  })
})