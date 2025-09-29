export const oauthConfig = {
  google: {
    scope: 'openid email profile',
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  kakao: {
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback',
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
  }
}

// OAuth provider 별 프로필 정보 매핑
export function mapOAuthProfile(provider: string, profile: any) {
  switch (provider) {
    case 'google':
      return {
        name: profile.name || profile.given_name + ' ' + profile.family_name,
        avatar_url: profile.picture,
        email: profile.email,
      }

    case 'kakao':
      return {
        name: profile.kakao_account?.profile?.nickname || profile.properties?.nickname,
        avatar_url: profile.kakao_account?.profile?.profile_image_url || profile.properties?.profile_image,
        email: profile.kakao_account?.email,
      }

    default:
      return {
        name: profile.name || profile.email?.split('@')[0],
        avatar_url: profile.avatar_url || profile.picture,
        email: profile.email,
      }
  }
}