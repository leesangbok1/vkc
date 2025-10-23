'use client'

interface TourStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'top-left'
  icon: string
  actionUrl?: string
}

interface QuickTourProps {
  steps: TourStep[]
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
}

export default function QuickTour({ steps, isOpen, onComplete, onSkip }: QuickTourProps) {
  if (!isOpen) return null

  const handleCardAction = (step: TourStep) => {
    if (step.actionUrl) {
      onComplete()
      window.location.href = step.actionUrl
      return
    }

    const targetElement = document.querySelector(step.targetSelector) as HTMLElement | null
    if (targetElement) {
      onComplete()
      targetElement.click()
    } else {
      onComplete()
    }
  }

  return (
    <div className="tour-overlay-centered" role="dialog" aria-modal="true">
      <div className="tour-modal">
        <header className="tour-modal-header">
          <h2 className="tour-modal-title">빠르게 둘러보기</h2>
          <p className="tour-modal-subtitle">첫 방문을 축하드립니다! 아래 기능으로 Viet K-Connect를 빠르게 알아보세요.</p>
        </header>

        <div className="tour-card-grid">
          {steps.map((step) => (
            <article key={step.id} className="tour-card">
              <div className="tour-card-icon" aria-hidden="true">{step.icon}</div>
              <h3 className="tour-card-title">{step.title}</h3>
              <p className="tour-card-description">{step.description}</p>
              <button
                type="button"
                className="tour-card-action"
                onClick={() => handleCardAction(step)}
              >
                바로가기
              </button>
            </article>
          ))}
        </div>

        <div className="tour-modal-actions">
          <button type="button" className="tour-action-secondary" onClick={onSkip}>
            다음에 보기
          </button>
          <button type="button" className="tour-action-primary" onClick={onComplete}>
            둘러보기 완료
          </button>
        </div>
      </div>

      <style jsx>{`
        .tour-overlay-centered {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1.5rem;
        }

        .tour-modal {
          max-width: 960px;
          width: 100%;
          background: #fff;
          border-radius: 20px;
          padding: 2.5rem 2rem;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .tour-modal-header {
          text-align: center;
        }

        .tour-modal-title {
          margin: 0 0 0.5rem;
          font-size: 1.8rem;
          font-weight: 700;
          color: #111827;
        }

        .tour-modal-subtitle {
          margin: 0;
          font-size: 1rem;
          color: #4b5563;
        }

        .tour-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .tour-card {
          background: #f9fafb;
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
        }

        .tour-card-icon {
          font-size: 2.5rem;
        }

        .tour-card-title {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #111827;
        }

        .tour-card-description {
          margin: 0;
          font-size: 0.96rem;
          color: #4b5563;
          line-height: 1.5;
        }

        .tour-card-action {
          margin-top: auto;
          align-self: center;
          padding: 0.6rem 1.2rem;
          border-radius: 999px;
          border: none;
          background: #2563eb;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .tour-card-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px rgba(37, 99, 235, 0.25);
        }

        .tour-modal-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .tour-action-secondary,
        .tour-action-primary {
          padding: 0.65rem 1.6rem;
          border-radius: 999px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .tour-action-secondary {
          background: #eef2ff;
          color: #4338ca;
        }

        .tour-action-secondary:hover {
          background: #e0e7ff;
        }

        .tour-action-primary {
          background: #111827;
          color: #fff;
        }

        .tour-action-primary:hover {
          background: #1f2937;
        }

        @media (max-width: 720px) {
          .tour-modal {
            padding: 2rem 1.25rem;
          }

          .tour-card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
