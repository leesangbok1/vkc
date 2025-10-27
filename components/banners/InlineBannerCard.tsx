'use client'

type InlineBannerProps = {
  banner: {
    id: string
    title: string
    description: string
    linkUrl: string
    backgroundColor?: string
  }
}

export default function InlineBannerCard({ banner }: InlineBannerProps) {
  return (
    <div
      className="inline-banner-card"
      style={{ background: banner.backgroundColor ?? 'var(--vk-primary)', color: '#ffffff' }}
    >
        <span className="inline-banner-kicker">Sponsored</span>
        <h3 className="inline-banner-title">{banner.title}</h3>
        <p className="inline-banner-description">{banner.description}</p>
      <a className="inline-banner-action" href={banner.linkUrl}>
        자세히 보기 →
      </a>
    </div>
  )
}
