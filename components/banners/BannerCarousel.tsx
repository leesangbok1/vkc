'use client'

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Banner {
  id: string
  title: string
  description: string
  imageUrl?: string
  linkUrl: string
  backgroundColor?: string
  tagline?: string
  ctaLabel?: string
  highlights?: string[]
  icon?: string
}

interface BannerCarouselProps {
  banners: Banner[]
  variant?: 'default' | 'sidebar' | 'hero'
}

export default function BannerCarousel({ banners, variant = 'default' }: BannerCarouselProps) {
  if (!banners || banners.length === 0) {
    return null
  }

  const isSidebar = variant === 'sidebar'
  const isHero = variant === 'hero'

  const autoplayDelay = isSidebar ? 8000 : 5000

  const [sidebarIndex, setSidebarIndex] = useState(0)

  useEffect(() => {
    if (!isSidebar) return
    setSidebarIndex(0)
  }, [isSidebar, banners])

  useEffect(() => {
    if (!isSidebar) return
    if (banners.length <= 1) return

    const timer = window.setInterval(() => {
      setSidebarIndex((prev) => (prev + 1) % banners.length)
    }, autoplayDelay)

    return () => window.clearInterval(timer)
  }, [isSidebar, banners, autoplayDelay])

  if (isSidebar) {
    return (
      <div
        className="banner-carousel-container banner-carousel-sidebar"
        style={{
          width: '100%',
          margin: '0 0 0.6rem 0',
          borderRadius: '12px',
          overflow: 'hidden',
          height: 'var(--sidebar-banner-card-h, 460px)',
          position: 'relative',
        }}
      >
        <div className="sidebar-banner-slides">
          {banners.map((banner, index) => (
            <article
              key={banner.id}
              className={`sidebar-card sidebar-banner-card sidebar-banner-carousel-card sidebar-banner-slide${index === sidebarIndex ? ' active' : ''}`}
              style={{
                background: banner.backgroundColor || undefined,
                height: '100%',
                minHeight: '100%'
              }}
              aria-hidden={index === sidebarIndex ? undefined : true}
            >
              <div className="sidebar-banner-header">
                <div className="sidebar-banner-header-content">
                  {banner.icon && (
                    <span className="sidebar-banner-icon" aria-hidden="true">
                      {banner.icon}
                    </span>
                  )}
                  <div className="sidebar-banner-header-text">
                    <h3 className="sidebar-title">{banner.title}</h3>
                    {banner.tagline && (
                      <p className="sidebar-subtitle">{banner.tagline}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="sidebar-banner-content">
                <div className="sidebar-banner-scroll">
                  {banner.description && (
                    <p className="banner-description">{banner.description}</p>
                  )}
                  {Array.isArray(banner.highlights) && banner.highlights.length > 0 && (
                    <ul className="banner-benefits">
                      {banner.highlights.map((item, benefitIndex) => (
                        <li key={`${banner.id}-benefit-${benefitIndex}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  className="banner-action-btn"
                  onClick={() => {
                    window.location.href = banner.linkUrl
                  }}
                >
                  {banner.ctaLabel ?? '자세히 보기'}
                </button>
              </div>
            </article>
          ))}
        </div>

        {banners.length > 1 && (
          <div className="sidebar-banner-controls" role="tablist" aria-label="사이드바 배너">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                className={`sidebar-banner-indicator${index === sidebarIndex ? ' active' : ''}`}
                aria-label={`${index + 1}번째 배너 보기`}
                aria-selected={index === sidebarIndex}
                role="tab"
                onClick={() => setSidebarIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`banner-carousel-container${isHero ? ' banner-carousel-hero' : ''}`}
      style={{
        width: '100%',
        margin: isHero ? '0' : '1.5rem 0',
        borderRadius: isHero ? '16px' : '12px',
        overflow: 'hidden',
        height: isHero ? '100%' : undefined,
        display: isHero ? 'flex' : undefined,
        ['--banner-slide-max-height' as any]: isHero ? '240px' : '190px'
      }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={!isHero}
        pagination={{ clickable: true }}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
        }}
        loop={banners.length > 1}
        style={{
          borderRadius: isHero ? '16px' : '12px'
        }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="banner-slide"
              onClick={() => window.location.href = banner.linkUrl}
              style={{
                background: banner.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '1.5rem',
                minHeight: '120px',
                // Prevent height jump on long translations
                maxHeight: 'var(--banner-slide-max-height)',
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                scrollbarGutter: 'stable both-edges',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <h2 style={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {banner.title}
              </h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.95rem',
                lineHeight: 1.5
              }}>
                {banner.description}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .banner-carousel-container { --banner-slide-max-height: 180px; }
        .banner-carousel-container.banner-carousel-hero { --banner-slide-max-height: 240px; }
        @media (max-width: 768px) {
          .banner-carousel-container { --banner-slide-max-height: 160px; }
          .banner-carousel-container.banner-carousel-hero { margin-top: 0.75rem; }
        }

        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          background: rgba(0, 0, 0, 0.5);
          padding: 1.5rem;
          border-radius: 50%;
          width: 50px !important;
          height: 50px !important;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(0, 0, 0, 0.7) !important;
          transform: scale(1.1);
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 1.5rem !important;
          font-weight: bold;
        }

        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.5;
        }

        .swiper-pagination-bullet-active {
          opacity: 1 !important;
        }

        /* 모바일에서도 화살표 표시 */
        @media (max-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            width: 40px !important;
            height: 40px !important;
          }

          .swiper-button-next:after,
          .swiper-button-prev:after {
            font-size: 1.2rem !important;
          }
        }

        .banner-carousel-hero .swiper-pagination {
          bottom: 10px !important;
        }

        .banner-carousel-hero .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.8) !important;
        }
      `}</style>
    </div>
  )
}
