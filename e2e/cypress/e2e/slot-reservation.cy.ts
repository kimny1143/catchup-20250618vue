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
    // 最初の空きスロットを見つけて予約
    let foundAvailable = false
    
    cy.get('.lesson-slot').each(($slot) => {
      if (!foundAvailable) {
        cy.wrap($slot).within(() => {
          cy.get('.slot-status').then(($status) => {
            if ($status.text().includes('空き')) {
              foundAvailable = true
              
              // 予約ボタンをクリック
              cy.get('.reserve-button').click()
              
              // 予約後、ステータスが更新されるまで待つ
              // Toastではなく、DOM要素の変化を直接確認
              cy.get('.slot-status', { timeout: 10000 }).should('contain', '予約済み')
              cy.get('.reserve-button').should('not.exist')
            }
          })
        })
      }
    })
  })
})