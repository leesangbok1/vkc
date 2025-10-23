'use client'

import React from 'react'

interface StatusBadgeProps {
  resolved: boolean
  compact?: boolean
  className?: string
}

export default function StatusBadge({ resolved, compact = false, className }: StatusBadgeProps) {
  const label = resolved ? '해결됨' : '미해결'
  const tooltip = resolved
    ? '답변이 채택되어 해결된 상태입니다. 채택된 답변이 유지되는 동안 해결 상태로 표시됩니다.'
    : '아직 채택된 답변이 없어 미해결 상태입니다. 답변을 채택하면 해결됨으로 전환됩니다.'

  return (
    <span
      className={`vk-status-badge-wrapper ${compact ? 'compact' : ''}${className ? ` ${className}` : ''}`}
      tabIndex={0}
      role="status"
      aria-label={label}
    >
      <span className={`vk-status-pill ${resolved ? 'resolved' : 'pending'}`}>
        {resolved ? '✓ 해결됨' : '미해결'}
      </span>
      <span className="vk-status-tooltip" role="tooltip">
        <strong>{label}</strong>
        <span>{tooltip}</span>
        <span className="vk-status-tooltip-caption">“채택됨” = “해결됨” 상태로 표시돼요.</span>
      </span>
      <style jsx>{`
        .vk-status-badge-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          outline: none;
          cursor: default;
        }

        .vk-status-badge-wrapper:focus-visible .vk-status-pill {
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35);
        }

        .vk-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 999px;
          padding: 0.3rem 0.65rem;
          font-size: 0.8rem;
          font-weight: 600;
          line-height: 1.1;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .vk-status-pill.resolved {
          background: rgba(34, 197, 94, 0.16);
          color: #15803d;
        }

        .vk-status-pill.pending {
          background: rgba(248, 113, 113, 0.18);
          color: #b91c1c;
        }

        .vk-status-badge-wrapper.compact .vk-status-pill {
          padding: 0.2rem 0.5rem;
          font-size: 0.72rem;
        }

        .vk-status-tooltip {
          position: absolute;
          inset-inline-start: 50%;
          inset-block-end: calc(100% + 10px);
          transform: translate(-50%, 6px);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 220px;
          max-width: 260px;
          padding: 0.75rem;
          border-radius: 0.75rem;
          background: rgba(17, 24, 39, 0.92);
          color: rgba(255, 255, 255, 0.95);
          font-size: 0.75rem;
          line-height: 1.4;
          box-shadow: 0 12px 25px -12px rgba(15, 23, 42, 0.45);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          z-index: 40;
          text-align: start;
        }

        .vk-status-tooltip strong {
          font-size: 0.78rem;
          font-weight: 700;
        }

        .vk-status-tooltip-caption {
          color: rgba(226, 232, 240, 0.78);
          font-size: 0.7rem;
        }

        .vk-status-tooltip::after {
          content: '';
          position: absolute;
          inset-inline-start: 50%;
          inset-block-start: 100%;
          transform: translateX(-50%);
          border-width: 6px;
          border-style: solid;
          border-color: rgba(17, 24, 39, 0.92) transparent transparent transparent;
        }

        .vk-status-badge-wrapper:hover .vk-status-tooltip,
        .vk-status-badge-wrapper:focus-visible .vk-status-tooltip {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        @media (max-width: 768px) {
          .vk-status-tooltip {
            display: none;
          }
        }
      `}</style>
    </span>
  )
}
