'use client'

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VietKConnect",
    "description": "한국에서 생활하는 베트남인들을 위한 질문과 답변 커뮤니티",
    "url": "https://vietkconnect.com",
    "logo": "https://vietkconnect.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "areaServed": "KR",
      "availableLanguage": ["Korean", "Vietnamese"]
    },
    "sameAs": [
      "https://facebook.com/vietkconnect",
      "https://twitter.com/vietkconnect",
      "https://instagram.com/vietkconnect"
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "VietKConnect",
    "description": "한국 거주 베트남인을 위한 Q&A 플랫폼",
    "url": "https://vietkconnect.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://vietkconnect.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "inLanguage": ["ko-KR", "vi-VN"],
    "audience": {
      "@type": "Audience",
      "audienceType": "Vietnamese residents in Korea",
      "geographicArea": {
        "@type": "Country",
        "name": "South Korea"
      }
    }
  }

  const qaSchema = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "name": "VietKConnect - 베트남인 커뮤니티 Q&A",
    "description": "비자, 취업, 생활정보 등 한국 생활에 필요한 모든 질문과 답변",
    "inLanguage": "ko-KR",
    "audience": {
      "@type": "Audience",
      "audienceType": "Vietnamese residents in Korea"
    },
    "publisher": {
      "@type": "Organization",
      "name": "VietKConnect"
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": "https://vietkconnect.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "질문",
        "item": "https://vietkconnect.com/questions"
      }
    ]
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "VietKConnect Q&A Platform",
    "description": "한국 거주 베트남인을 위한 전문 질문답변 서비스",
    "provider": {
      "@type": "Organization",
      "name": "VietKConnect"
    },
    "areaServed": {
      "@type": "Country",
      "name": "South Korea"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Vietnamese residents in Korea"
    },
    "serviceType": "Community Q&A Platform",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW",
      "description": "무료 커뮤니티 서비스"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(qaSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
    </>
  )
}