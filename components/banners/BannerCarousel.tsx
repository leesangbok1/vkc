'use client'

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
}

interface BannerCarouselProps {
  banners: Banner[]
  variant?: 'default' | 'sidebar'
}

export default function BannerCarousel({ banners, variant = 'default' }: BannerCarouselProps) {
  if (!banners || banners.length === 0) {
    return null
  }

  const isSidebar = variant === 'sidebar'

  return (
    <div
      className={`banner-carousel-container${isSidebar ? ' banner-carousel-sidebar' : ''}`}
      style={{
        width: '100%',
        margin: isSidebar ? '0 0 1.25rem 0' : '1.5rem 0',
        borderRadius: '12px',
        overflow: 'hidden',
        ['--banner-slide-max-height' as any]: isSidebar ? '210px' : '180px'
      }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={banners.length > 1}
        style={{
          borderRadius: '12px'
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
                minHeight: '100px',
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
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                {banner.description}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .banner-carousel-container { --banner-slide-max-height: 180px; }
        .banner-carousel-container.banner-carousel-sidebar { --banner-slide-max-height: 210px; }
        @media (max-width: 768px) {
          .banner-carousel-container { --banner-slide-max-height: 160px; }
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

        .banner-carousel-sidebar .swiper-button-next,
        .banner-carousel-sidebar .swiper-button-prev {
          background: rgba(255, 255, 255, 0.6);
          color: #2563eb !important;
        }
      `}</style>
    </div>
  )
}
