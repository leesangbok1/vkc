type BrandLogoProps = {
  className?: string
}

const LOGO_TEXT = 'Viet K-Connect'

export default function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span className={`vk-logo ${className ?? ''}`.trim()}>
      <span className="vk-logo-name" translate="no">
        {LOGO_TEXT}
      </span>
    </span>
  )
}
