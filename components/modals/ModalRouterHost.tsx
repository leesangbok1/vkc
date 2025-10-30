'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import QuestionCreateModal from './QuestionCreateModal'
import PostCreateModal from './PostCreateModal'
import BookmarkModal from './BookmarkModal'
import SettingsModal from './SettingsModal'
import MissionsModal from './MissionsModal'
import UserRankModal from './UserRankModal'
import VisaChallengeModal from './VisaChallengeModal'
import ProfileModal from './ProfileModal'
import FollowersModal from './FollowersModal'
import { useAuth } from '@/lib/hooks/useAuth'

type ManagedModal =
  | 'question'
  | 'post'
  | 'bookmarks'
  | 'settings'
  | 'missions'
  | 'user-rank'
  | 'visa-challenge'
  | 'profile'
  | 'followers'

const AUTH_REQUIRED: ManagedModal[] = [
  'question',
  'post',
  'bookmarks',
  'settings',
  'missions',
  'profile',
  'followers',
]

export default function ModalRouterHost() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isLoading, isLoggedIn } = useAuth()

  const modalKey = useMemo(() => {
    const key = searchParams.get('modal')
    if (
      key === 'question' ||
      key === 'post' ||
      key === 'bookmarks' ||
      key === 'settings' ||
      key === 'missions' ||
      key === 'user-rank' ||
      key === 'visa-challenge' ||
      key === 'profile' ||
      key === 'followers'
    ) {
      return key as ManagedModal
    }
    return null
  }, [searchParams])

  const closeModal = (options?: { replace?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('modal')
    const query = params.toString()
    const target = `${pathname}${query ? `?${query}` : ''}`
    if (options?.replace) {
      router.replace(target, { scroll: false })
    } else {
      router.push(target, { scroll: false })
    }
  }

  useEffect(() => {
    if (!modalKey) return
    if (isLoading) return
    if (!AUTH_REQUIRED.includes(modalKey)) return
    if (isLoggedIn) return

    const params = new URLSearchParams(searchParams.toString())
    const current = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`
    router.replace(`/auth/login?redirectTo=${encodeURIComponent(current)}`, { scroll: true })
  }, [isLoading, isLoggedIn, modalKey, pathname, router, searchParams])

  const settingsSectionParam = useMemo(() => {
    if (!modalKey || modalKey !== 'settings') return undefined
    const section = searchParams.get('section')
    if (section === 'notifications' || section === 'account') {
      return section as 'notifications' | 'account'
    }
    return undefined
  }, [modalKey, searchParams])

  return (
    <>
      <QuestionCreateModal
        isOpen={modalKey === 'question' && isLoggedIn}
        onClose={() => closeModal()}
      />
      <PostCreateModal
        isOpen={modalKey === 'post' && isLoggedIn}
        onClose={() => closeModal()}
      />
      <BookmarkModal
        isOpen={modalKey === 'bookmarks' && isLoggedIn}
        onClose={() => closeModal()}
      />
      <SettingsModal
        isOpen={modalKey === 'settings' && isLoggedIn}
        onClose={() => closeModal()}
        initialSection={settingsSectionParam}
      />
      <MissionsModal
        isOpen={modalKey === 'missions' && isLoggedIn}
        onClose={() => closeModal()}
      />
      <UserRankModal isOpen={modalKey === 'user-rank'} onClose={() => closeModal()} />
      <VisaChallengeModal isOpen={modalKey === 'visa-challenge'} onClose={() => closeModal()} />
      <ProfileModal isOpen={modalKey === 'profile'} onClose={() => closeModal()} />
      <FollowersModal isOpen={modalKey === 'followers'} onClose={() => closeModal()} />
    </>
  )
}
