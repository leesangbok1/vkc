'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'

type Transaction = {
  id: string
  type: 'earn' | 'withdraw'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'processing'
  createdAt: string
}

export default function WalletPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [balance, setBalance] = useState(0)
  const [activeTab, setActiveTab] = useState<'asset' | 'withdraw'>('asset')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([])
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [accountBank, setAccountBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const mockSession = localStorage.getItem('mock_session')
      const mockUser = localStorage.getItem('mock_user')

      if (mockSession === 'true' && mockUser) {
        setIsLoggedIn(true)
        loadWalletData()
      } else {
        router.push('/auth/login?redirectTo=/wallet')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login?redirectTo=/wallet')
    } finally {
      setIsCheckingAuth(false)
    }
  }

  function loadWalletData() {
    // Mock: localStorage에서 자산 정보 로드
    const progress = localStorage.getItem('mission_progress')
    if (progress) {
      const data = JSON.parse(progress)
      // Mock: Certified User 답변 1개당 1,000원, 일반 답변 1개당 100원
      const earnings = (data.certifiedAnswers || 0) * 1000 + (data.normalAnswers || 0) * 100
      setBalance(earnings)
    }

    // Mock: 거래 내역 로드
    const storedTransactions = localStorage.getItem('wallet_transactions')
    if (storedTransactions) {
      const txs: Transaction[] = JSON.parse(storedTransactions)
      setTransactions(txs.filter(tx => tx.type === 'earn'))
      setWithdrawals(txs.filter(tx => tx.type === 'withdraw'))
    }

    // Mock: 계좌 정보 로드
    const storedAccount = localStorage.getItem('bank_account')
    if (storedAccount) {
      const account = JSON.parse(storedAccount)
      setAccountBank(account.bank || '')
      setAccountNumber(account.number || '')
      setAccountHolder(account.holder || '')
    }
  }

  function handleSaveAccount() {
    if (!accountBank || !accountNumber || !accountHolder) {
      alert('모든 항목을 입력해주세요')
      return
    }

    localStorage.setItem('bank_account', JSON.stringify({
      bank: accountBank,
      number: accountNumber,
      holder: accountHolder
    }))

    alert('계좌 정보가 저장되었습니다')
    setShowAccountModal(false)
  }

  function handleWithdrawRequest() {
    const amount = parseInt(withdrawAmount)

    if (!amount || amount < 50000) {
      alert('출금 금액은 50,000원 이상이어야 합니다')
      return
    }

    if (amount > balance) {
      alert('보유 자산이 부족합니다')
      return
    }

    if (!accountBank || !accountNumber || !accountHolder) {
      alert('먼저 계좌 정보를 등록해주세요')
      setShowWithdrawModal(false)
      setShowAccountModal(true)
      return
    }

    // Mock: 출금 요청 생성
    const newWithdrawal: Transaction = {
      id: `w${Date.now()}`,
      type: 'withdraw',
      amount: amount,
      description: `${accountBank} ${accountNumber.slice(-4)}로 출금`,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    const allTransactions = [...transactions, ...withdrawals, newWithdrawal]
    localStorage.setItem('wallet_transactions', JSON.stringify(allTransactions))

    setBalance(balance - amount)
    setWithdrawals([newWithdrawal, ...withdrawals])

    alert('출금 요청이 완료되었습니다. 2일 내에 입금됩니다.')
    setShowWithdrawModal(false)
    setWithdrawAmount('')
  }

  if (isCheckingAuth) {
    return (
      <PageLayout variant="centered">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
            <p>로딩 중...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  const krwValue = balance

  return (
    <PageLayout variant="centered">
      <div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 0'
        }}>
          {/* Main Content */}
          <div>
            {/* Header */}
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '2rem',
              color: '#333'
            }}>
              보유 자산
            </h1>

            {/* Balance Card */}
            <div style={{
              background: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                fontSize: '1rem',
                color: '#667eea',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                💰 VKC
              </div>
              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '0.5rem'
              }}>
                {balance.toLocaleString()} 원
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#999'
              }}>
                ≈ {krwValue.toLocaleString()} KRW
              </div>
              <div style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  style={{
                    background: '#667eea',
                    color: 'white',
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => {
                    if (balance < 50000) {
                      alert('출금은 50,000원 이상부터 가능합니다')
                      return
                    }
                    setShowWithdrawModal(true)
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#5568d3'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
                >
                  출금하기
                </button>
                <button
                  style={{
                    background: '#f8f9fa',
                    color: '#333',
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => setShowAccountModal(true)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
                >
                  계좌 관리
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid #e9ecef',
              marginBottom: '1.5rem'
            }}>
              <button
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: activeTab === 'asset' ? '#667eea' : '#999',
                  borderBottom: activeTab === 'asset' ? '2px solid #667eea' : 'none',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onClick={() => setActiveTab('asset')}
              >
                자산 내역
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: activeTab === 'withdraw' ? '#667eea' : '#999',
                  borderBottom: activeTab === 'withdraw' ? '2px solid #667eea' : 'none',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onClick={() => setActiveTab('withdraw')}
              >
                출금 내역
              </button>
            </div>

            {/* Transaction List */}
            <div>
              {activeTab === 'asset' && (
                transactions.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: '#f8f9fa',
                    borderRadius: '12px'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤝</div>
                    <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
                      보상 내역이 없어요
                    </p>
                    <button
                      style={{
                        background: '#667eea',
                        color: 'white',
                        padding: '0.75rem 2rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={() => router.push('/missions')}
                    >
                      미션 달성하러 가기
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        style={{
                          background: 'white',
                          border: '1px solid #e9ecef',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                            {tx.description}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#999' }}>
                            {new Date(tx.createdAt).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#28a745' }}>
                          +{tx.amount.toLocaleString()}원
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'withdraw' && (
                withdrawals.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: '#f8f9fa',
                    borderRadius: '12px'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤝</div>
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>
                      출금 내역이 없어요
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {withdrawals.map((tx) => (
                      <div
                        key={tx.id}
                        style={{
                          background: 'white',
                          border: '1px solid #e9ecef',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                            {tx.description}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#999' }}>
                            {new Date(tx.createdAt).toLocaleDateString('ko-KR')} • {
                              tx.status === 'pending' ? '처리 대기' :
                              tx.status === 'processing' ? '처리 중' :
                              '완료'
                            }
                          </div>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#dc3545' }}>
                          -{tx.amount.toLocaleString()}원
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Earn More Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '2rem',
              color: 'white',
              marginBottom: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                filter: 'blur(30px)'
              }} />
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                position: 'relative'
              }}>
                열심히 모은<br />VKC 코인
              </h3>
              <p style={{
                fontSize: '0.95rem',
                opacity: 0.9,
                marginBottom: '1.5rem',
                position: 'relative'
              }}>
                현금으로 바꿔 수익을 만들어보세요
              </p>
              <button
                style={{
                  background: 'white',
                  color: '#667eea',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => router.push('/missions')}
              >
                더 벌러가기
              </button>
            </div>

            {/* Withdrawal Info */}
            <div style={{
              background: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '16px',
              padding: '1.5rem'
            }}>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#333'
              }}>
                출금 안내
              </h4>
              <ul style={{
                fontSize: '0.9rem',
                color: '#666',
                lineHeight: '1.8',
                paddingLeft: '1.2rem',
                margin: 0
              }}>
                <li>최소 출금 금액: 50,000원</li>
                <li>출금 수수료: 무료</li>
                <li>처리 시간: 영업일 기준 2일 이내</li>
                <li>출금 요청 후 취소 불가</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAccountModal(false)
          }}
        >
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              계좌 정보 관리
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                은행
              </label>
              <select
                value={accountBank}
                onChange={(e) => setAccountBank(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  fontSize: '1rem'
                }}
              >
                <option value="">선택하세요</option>
                <option value="KB국민은행">KB국민은행</option>
                <option value="신한은행">신한은행</option>
                <option value="우리은행">우리은행</option>
                <option value="하나은행">하나은행</option>
                <option value="NH농협은행">NH농협은행</option>
                <option value="기업은행">기업은행</option>
                <option value="카카오뱅크">카카오뱅크</option>
                <option value="토스뱅크">토스뱅크</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                계좌번호
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="숫자만 입력"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                예금주
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="예금주 이름"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowAccountModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  background: '#f8f9fa',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleSaveAccount}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#667eea',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWithdrawModal(false)
          }}
        >
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              출금 요청
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '1.5rem' }}>
              보유 자산: <strong>{balance.toLocaleString()}원</strong>
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                출금 금액 (최소 50,000원)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="50000"
                min="50000"
                step="1000"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  fontSize: '1rem'
                }}
              />
            </div>
            {accountBank && accountNumber && (
              <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                  출금 계좌: {accountBank} {accountNumber.slice(-4).padStart(accountNumber.length, '*')}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowWithdrawModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  background: '#f8f9fa',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleWithdrawRequest}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#667eea',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                출금 요청
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
