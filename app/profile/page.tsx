'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import { DEFAULT_AVATAR_URL } from '@/lib/constants/avatar'
import { getSubscribedTopics, subscribeTopic, unsubscribeTopic } from '@/lib/utils/follow-manager'

type UserRole = 'GUEST' | 'USER' | 'VERIFIED' | 'ADMIN'

interface UserProfile {
  id: string
  name: string
  nickname: string
  email: string
  bio: string
  profilePictureUrl: string

  // User-editable details
  visaType: string
  region: string
  company: string
  yearsInKorea: number
  residence: string
  gender: string
  ageRange: string
  primaryCategory: string
  interests: string[]

  // Admin-assigned fields
  role: UserRole
  trustScore: number
  questionCount: number
  answerCount: number
  helpfulAnswerCount: number
  registrationCardUrl: string
  registrationCardVerified: boolean

  // Verification badges
  badges: {
    verified: boolean
    expert: boolean
    helpful: boolean
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null)

  const emitProfileUpdated = useCallback(
    (payload: { id?: string; name?: string; avatarUrl?: string | null }) => {
      if (typeof window === 'undefined') return
      const targetId = payload.id ?? profile?.id
      if (!targetId) return

      const detail = {
        id: targetId,
        avatar_url: payload.avatarUrl ?? profile?.profilePictureUrl ?? null,
        name: payload.name ?? profile?.nickname ?? profile?.name,
      }

      window.dispatchEvent(new CustomEvent('vk-profile-updated', { detail }))
    },
    [profile?.id, profile?.name, profile?.nickname, profile?.profilePictureUrl]
  )

  const profilePictureInputRef = useRef<HTMLInputElement>(null)
  const registrationCardInputRef = useRef<HTMLInputElement>(null)

  const RESIDENCE_OPTIONS = [
    { value: 'korea', label: '한국 거주' },
    { value: 'abroad', label: '해외 거주' }
  ]

  const GENDER_OPTIONS = [
    { value: 'male', label: '남성' },
    { value: 'female', label: '여성' },
    { value: 'other', label: '기타' }
  ]

  const AGE_RANGE_OPTIONS = [
    { value: '10s', label: '10대' },
    { value: '20s', label: '20대' },
    { value: '30s', label: '30대' },
    { value: '40s', label: '40대' },
    { value: '50s', label: '50대' },
    { value: '60s', label: '60대 이상' }
  ]

  const CATEGORY_OPTIONS = [
    { value: 'student', label: '학생' },
    { value: 'worker', label: '직장인' },
    { value: 'resident', label: '장기 체류자' },
    { value: 'business', label: '사업자' },
    { value: 'other', label: '기타' }
  ]

  const TOPIC_OPTIONS = [
    { slug: 'visa', name: '한국 비자·체류', icon: '🛂' },
    { slug: 'employment', name: '한국 직장생활', icon: '💼' },
    { slug: 'daily-life', name: '한국 생활 정착', icon: '🌏' },
    { slug: 'housing', name: '한국에서 집 구하기', icon: '🏠' },
    { slug: 'finance', name: '베트남 송금·금융', icon: '💰' },
    { slug: 'education', name: '한국어 배우기', icon: '📚' }
  ]

  const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_AVATAR_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const res = await fetch('/api/auth/profile', { cache: 'no-store' })
      if (!res.ok) {
        router.push('/auth/login?redirectTo=/profile')
        return
      }
      const { data } = await res.json()
      const initialProfile: UserProfile = {
        id: data?.id || '',
        name: data?.name || data?.email || '사용자',
        nickname: data?.name || 'user',
        email: data?.email || '',
        bio: data?.bio || '',
        profilePictureUrl: data?.avatar_url || '',
        visaType: data?.visa_type || '',
        region: data?.region || '',
        company: data?.company || '',
        yearsInKorea: data?.years_in_korea || 0,
        residence: data?.residence || '',
        gender: data?.gender || '',
        ageRange: data?.age || '',
        primaryCategory: data?.category || '',
        interests: Array.isArray(data?.interests) ? data.interests as string[] : [],
        role: (data?.role?.toUpperCase?.() as UserRole) || 'USER',
        trustScore: data?.trust_score || 0,
        questionCount: data?.question_count || 0,
        answerCount: data?.answer_count || 0,
        helpfulAnswerCount: data?.helpful_answer_count || 0,
        registrationCardUrl: '',
        registrationCardVerified: !!data?.is_verified,
        badges: {
          verified: !!data?.is_verified,
          expert: false,
          helpful: (data?.helpful_answer_count || 0) > 0
        }
      }
      setProfile(initialProfile)
      setEditForm(initialProfile)
    } catch (e) {
      console.error('Failed to load profile:', e)
      router.push('/auth/login?redirectTo=/profile')
    }
  }

  async function handleSave() {
    if (!profile) return
    if (isUploadingAvatar) {
      alert('프로필 사진 업로드가 완료될 때까지 기다려주세요.')
      return
    }

    const avatarHasChanged =
      (editForm.profilePictureUrl ?? profile.profilePictureUrl ?? '') !== (profile.profilePictureUrl ?? '')

    const resolvedDisplayName = (editForm.nickname ?? profile.nickname ?? profile.name ?? '').trim()

    const payload: Record<string, unknown> = {
      name: resolvedDisplayName.length > 0 ? resolvedDisplayName : (editForm.name ?? profile.name),
      bio: editForm.bio ?? profile.bio,
      visa_type: editForm.visaType ?? profile.visaType,
      company: editForm.company ?? profile.company,
      years_in_korea: editForm.yearsInKorea ?? profile.yearsInKorea,
      region: editForm.region ?? profile.region,
      residence: editForm.residence ?? profile.residence,
      gender: editForm.gender ?? profile.gender,
      age: editForm.ageRange ?? profile.ageRange,
      category: editForm.primaryCategory ?? profile.primaryCategory,
      interests: editForm.interests ?? profile.interests
    }

    if (avatarHasChanged) {
      payload.avatar_url = (editForm.profilePictureUrl ?? '').trim().length > 0
        ? editForm.profilePictureUrl
        : null
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(text || '프로필 저장 중 오류가 발생했습니다.')
      }

      const json = await response.json().catch(() => ({ data: null }))
      const serverData = json?.data || {}
      const profilePictureUrl =
        typeof serverData.avatar_url === 'string'
          ? serverData.avatar_url
          : (editForm.profilePictureUrl ?? profile.profilePictureUrl)

      const serverDisplayName = resolvedDisplayName

      const resolvedName =
        typeof serverData.name === 'string' && serverData.name.length > 0
          ? serverData.name
          : serverDisplayName || (editForm.name ?? profile.name)

      const updatedProfile: UserProfile = {
        ...profile,
        ...editForm,
        name: resolvedName || profile.name,
        nickname: serverDisplayName || editForm.nickname || profile.nickname,
        profilePictureUrl: profilePictureUrl || '',
        visaType: serverData.visa_type ?? (editForm.visaType ?? profile.visaType),
        company: serverData.company ?? (editForm.company ?? profile.company),
        yearsInKorea: serverData.years_in_korea ?? (editForm.yearsInKorea ?? profile.yearsInKorea),
        region: serverData.region ?? (editForm.region ?? profile.region),
        residence: serverData.residence ?? (editForm.residence ?? profile.residence),
        gender: serverData.gender ?? (editForm.gender ?? profile.gender),
        ageRange: serverData.age ?? (editForm.ageRange ?? profile.ageRange),
        primaryCategory: serverData.category ?? (editForm.primaryCategory ?? profile.primaryCategory),
        interests: Array.isArray(serverData.interests)
          ? serverData.interests
          : (editForm.interests ?? profile.interests)
      }
      setProfile(updatedProfile)
      setEditForm(updatedProfile)

      try {
        const currentTopics = await getSubscribedTopics(true)
        await Promise.all(currentTopics.map((topic) => unsubscribeTopic(topic.subscriptionId)))

        await Promise.all(
          (updatedProfile.interests || []).map(async (topicName) => {
            const meta = TOPIC_OPTIONS.find((item) => item.name === topicName)
            if (!meta) return
            await subscribeTopic({ slug: meta.slug })
          })
        )
      } catch (topicError) {
        console.warn('관심 토픽 동기화 실패:', topicError)
      }

      emitProfileUpdated({
        id: updatedProfile.id,
        avatarUrl: updatedProfile.profilePictureUrl || null,
        name: updatedProfile.nickname || updatedProfile.name,
      })

      setIsEditing(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error: any) {
      console.error('Profile update failed:', error)
      alert(error?.message || '프로필 저장 중 오류가 발생했습니다.')
    }
  }

  function handleCancel() {
    setEditForm(profile || {})
    setIsEditing(false)
    setAvatarUploadError(null)
    if (profilePictureInputRef.current) {
      profilePictureInputRef.current.value = ''
    }
    emitProfileUpdated({
      avatarUrl: profile?.profilePictureUrl || null,
      name: profile?.nickname || profile?.name,
    })
  }

  async function handleProfilePictureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploadError(null)

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setAvatarUploadError('PNG, JPG, WEBP 형식의 이미지만 업로드할 수 있습니다.')
      return
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setAvatarUploadError('프로필 사진은 5MB 이하의 이미지만 업로드할 수 있습니다.')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/uploads', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        const status = response.status
        const serverMessage =
          typeof payload?.error === 'string' && payload.error.trim().length > 0
            ? payload.error.trim()
            : null

        const detailMessage =
          typeof payload?.details === 'string' && payload.details.trim().length > 0
            ? payload.details.trim()
            : null

        let message = serverMessage || detailMessage || '프로필 사진 업로드에 실패했습니다.'
        if (status === 401) {
          message = '로그인이 필요합니다. 다시 로그인 후 시도해주세요.'
          router.push('/auth/login?redirectTo=/profile')
        } else if (status === 413) {
          message = '파일 크기가 너무 큽니다. 5MB 이하 이미지를 선택해주세요.'
        } else if (status === 415) {
          message = '지원하지 않는 이미지 형식입니다. PNG, JPG, WEBP 이미지를 사용해주세요.'
        }

        if (profilePictureInputRef.current) {
          profilePictureInputRef.current.value = ''
        }
        setAvatarUploadError(message)
        return
      }

      const uploadedUrl = payload?.url

      if (typeof uploadedUrl !== 'string' || uploadedUrl.length === 0) {
        if (profilePictureInputRef.current) {
          profilePictureInputRef.current.value = ''
        }
        setAvatarUploadError('업로드된 파일 URL을 확인할 수 없습니다.')
        return
      }

      setEditForm((prev) => ({
        ...prev,
        profilePictureUrl: uploadedUrl,
      }))

      emitProfileUpdated({ avatarUrl: uploadedUrl })
      if (profilePictureInputRef.current) {
        profilePictureInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Avatar upload failed:', error)
      setAvatarUploadError(error?.message || '프로필 사진 업로드에 실패했습니다.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  function handleRegistrationCardUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // In real app, would upload to server and get URL
    // For mock, just show file name
    setEditForm({
      ...editForm,
      registrationCardUrl: file.name,
      registrationCardVerified: false // Reset verification on new upload
    })
  }

  function getRoleInfo(role: UserRole) {
    const roleMap: Record<UserRole, { label: string; icon: string; pillClass: string }> = {
      GUEST: { label: '게스트', icon: '🔒', pillClass: 'guest' },
      USER: { label: '일반 사용자', icon: '👤', pillClass: 'user' },
      VERIFIED: { label: '인증 사용자', icon: '✅', pillClass: 'verified' },
      ADMIN: { label: '관리자', icon: '👑', pillClass: 'admin' }
    }
    return roleMap[role] || roleMap.USER
  }

  const resolveLabel = (
    value: string | undefined,
    options: { value: string; label: string }[],
    fallback: string = '미설정'
  ) => {
    if (!value) return fallback
    return options.find((option) => option.value === value)?.label ?? fallback
  }

  if (!profile) {
    return (
      <PageLayout variant="withSidebar" showSidebar={false}>
        <div className="profile-page">
          <section className="card profile-hero">
            <p>프로필을 불러오는 중...</p>
          </section>
        </div>
      </PageLayout>
    )
  }

  const roleInfo = getRoleInfo(profile.role)
  const displayName = profile.nickname || profile.name
  const primaryEmail = profile.email || ''
  const rawProfilePictureUrl = isEditing
    ? (editForm.profilePictureUrl ?? profile.profilePictureUrl)
    : profile.profilePictureUrl
  const displayProfilePictureUrl =
    rawProfilePictureUrl && rawProfilePictureUrl.length > 0
      ? rawProfilePictureUrl
      : DEFAULT_AVATAR_URL
  const rolePillClass = `profile-role-pill ${roleInfo.pillClass}`
  const interests = Array.isArray(profile.interests) ? profile.interests : []

  const heroSection = (
    <section className="card profile-hero">
      <div className="profile-hero-top">
        <div className="profile-avatar">
          <img src={displayProfilePictureUrl} alt={`${displayName}의 프로필 사진`} />
        </div>
        <div className="profile-hero-meta">
          <span className="profile-hero-name" translate="no" data-no-translate="true">
            {displayName}
          </span>
          <span className={rolePillClass}>
            <span aria-hidden>{roleInfo.icon}</span>
            {roleInfo.label}
          </span>
          <p className="profile-section-subtitle">{primaryEmail}</p>
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-secondary">
              ✏️ 편집
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? '⏳ 업로드 대기' : '💾 저장'}
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                ✖️ 취소
              </button>
            </>
          )}
        </div>
      </div>
      <div className="profile-hero-stats">
        <div className="profile-stat-card">
          <span>작성한 질문</span>
          <strong>{profile.questionCount}</strong>
        </div>
        <div className="profile-stat-card">
          <span>작성한 답변</span>
          <strong>{profile.answerCount}</strong>
        </div>
        <div className="profile-stat-card">
          <span>도움이 된 답변</span>
          <strong>{profile.helpfulAnswerCount}</strong>
        </div>
      </div>
    </section>
  )

  const editableSection = (
    <section className="card">
      <div className="card-header profile-section-header">
        <h2 className="card-title">✏️ 사용자 수정 가능</h2>
        <p className="profile-section-subtitle">본인이 직접 수정할 수 있는 정보</p>
      </div>
      <div className="card-content">
        <div className="profile-field-group">
          <label className="form-label">프로필 사진</label>
          <div className="profile-avatar-row">
            <div className="profile-avatar">
              <img src={displayProfilePictureUrl} alt={`${displayName}의 프로필 사진`} />
            </div>
            {isEditing && (
              <div>
                <input
                  ref={profilePictureInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => profilePictureInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="btn-secondary"
                >
                  {isUploadingAvatar ? '⏳ 업로드 중...' : '📷 사진 업로드'}
                </button>
                <p className="profile-helper-text">JPG, PNG, WEBP 파일 (최대 5MB)</p>
                {avatarUploadError && <p className="profile-error-text">{avatarUploadError}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="profile-two-column">
          <div className="form-group">
            <label className="form-label">이름</label>
            {isEditing ? (
              <input
                type="text"
                className="form-input"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            ) : (
              <p className="profile-text-strong">{profile.name}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">닉네임</label>
            {isEditing ? (
              <input
                type="text"
                className="form-input"
                value={editForm.nickname || ''}
                onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                placeholder="사용자 닉네임"
              />
            ) : (
              <p className="profile-text-strong">@{profile.nickname}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">이메일</label>
          <p className="profile-text-muted">{primaryEmail}</p>
        </div>

        <div className="form-group">
          <label className="form-label">자기소개</label>
          {isEditing ? (
            <textarea
              className="form-textarea"
              value={editForm.bio || ''}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="간단한 자기소개를 작성해주세요"
              rows={3}
            />
          ) : profile.bio ? (
            <p className="profile-text-muted">{profile.bio}</p>
          ) : (
            <p className="profile-empty">자기소개가 없습니다</p>
          )}
        </div>

        <div className="profile-two-column">
          <div className="form-group">
            <label className="form-label">비자 종류</label>
            {isEditing ? (
              <select
                className="form-input"
                value={editForm.visaType || ''}
                onChange={(e) => setEditForm({ ...editForm, visaType: e.target.value })}
              >
                <option value="">선택</option>
                <option value="D-2">D-2 (유학)</option>
                <option value="E-7">E-7 (특정활동)</option>
                <option value="E-9">E-9 (비전문취업)</option>
                <option value="F-2">F-2 (거주)</option>
                <option value="F-4">F-4 (재외동포)</option>
                <option value="F-5">F-5 (영주)</option>
                <option value="기타">기타</option>
              </select>
            ) : (
              <p className="profile-text-strong">{profile.visaType || '미설정'}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">거주 지역</label>
            {isEditing ? (
              <input
                type="text"
                className="form-input"
                value={editForm.region || ''}
                onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                placeholder="예: 서울, 부산"
              />
            ) : (
              <p className="profile-text-strong">{profile.region || '미설정'}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">회사/학교</label>
            {isEditing ? (
              <input
                type="text"
                className="form-input"
                value={editForm.company || ''}
                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                placeholder="근무처 또는 학교명"
              />
            ) : (
              <p className="profile-text-strong">{profile.company || '미설정'}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">한국 거주 기간</label>
            {isEditing ? (
              <input
                type="number"
                className="form-input"
                value={editForm.yearsInKorea ?? profile.yearsInKorea ?? 0}
                onChange={(e) => setEditForm({ ...editForm, yearsInKorea: parseInt(e.target.value, 10) || 0 })}
                placeholder="년"
              />
            ) : (
              <p className="profile-text-strong">{profile.yearsInKorea}년</p>
            )}
          </div>
        </div>

        <div className="profile-two-column">
          <div className="form-group">
            <label className="form-label">거주 상태</label>
            {isEditing ? (
              <div className="profile-option-grid">
                {RESIDENCE_OPTIONS.map((option) => {
                  const current = editForm.residence ?? profile.residence ?? ''
                  const checked = current === option.value
                  return (
                    <label key={option.value} className={`option-card ${checked ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="residence"
                        value={option.value}
                        checked={checked}
                        onChange={(e) => setEditForm({ ...editForm, residence: e.target.value })}
                      />
                      <span>{option.label}</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <p className="profile-text-strong">
                {resolveLabel(profile.residence, RESIDENCE_OPTIONS)}
              </p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">성별</label>
            {isEditing ? (
              <div className="profile-option-grid">
                {GENDER_OPTIONS.map((option) => {
                  const current = editForm.gender ?? profile.gender ?? ''
                  const checked = current === option.value
                  return (
                    <label key={option.value} className={`option-card ${checked ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={checked}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      />
                      <span>{option.label}</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <p className="profile-text-strong">
                {resolveLabel(profile.gender, GENDER_OPTIONS)}
              </p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">연령대</label>
            {isEditing ? (
              <select
                className="form-input"
                value={editForm.ageRange ?? profile.ageRange ?? ''}
                onChange={(e) => setEditForm({ ...editForm, ageRange: e.target.value })}
              >
                <option value="">선택</option>
                {AGE_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <p className="profile-text-strong">
                {resolveLabel(profile.ageRange, AGE_RANGE_OPTIONS)}
              </p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">관심 카테고리</label>
            {isEditing ? (
              <select
                className="form-input"
                value={editForm.primaryCategory ?? profile.primaryCategory ?? ''}
                onChange={(e) => setEditForm({ ...editForm, primaryCategory: e.target.value })}
              >
                <option value="">선택</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <p className="profile-text-strong">
                {resolveLabel(profile.primaryCategory, CATEGORY_OPTIONS)}
              </p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">관심 토픽</label>
          {isEditing ? (
            <div className="profile-option-grid two-columns">
              {TOPIC_OPTIONS.map((topic) => {
                const current = editForm.interests ?? profile.interests ?? []
                const checked = current.includes(topic.name)
                return (
                  <label key={topic.slug} className={`option-card ${checked ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      value={topic.name}
                      checked={checked}
                      onChange={(e) => {
                        const interestsValue = editForm.interests ?? profile.interests ?? []
                        const next = e.target.checked
                          ? Array.from(new Set([...interestsValue, topic.name]))
                          : interestsValue.filter((name) => name !== topic.name)
                        setEditForm({ ...editForm, interests: next })
                      }}
                    />
                    <span>{topic.icon} {topic.name}</span>
                  </label>
                )
              })}
            </div>
          ) : interests.length > 0 ? (
            <div className="profile-chip-list">
              {interests.map((interest) => {
                const topicMeta = TOPIC_OPTIONS.find((item) => item.name === interest)
                return (
                  <span key={interest} className="profile-chip">
                    {topicMeta?.icon || '⭐'} {interest}
                  </span>
                )
              })}
            </div>
          ) : (
            <p className="profile-empty">관심 토픽을 설정하지 않았습니다</p>
          )}
        </div>

        <div className="profile-section-divider">
          <h3 className="profile-section-subtitle" style={{ fontWeight: 600 }}>
            <span aria-hidden>🌱</span> 온보딩 기본 정보
          </h3>
          <div className="profile-onboarding-grid">
            <div className="profile-onboarding-item">
              <span>거주 지역</span>
              <span className="profile-text-strong">{profile.residence || '미설정'}</span>
            </div>
            <div className="profile-onboarding-item">
              <span>성별</span>
              <span className="profile-text-strong">{profile.gender || '미설정'}</span>
            </div>
            <div className="profile-onboarding-item">
              <span>연령대</span>
              <span className="profile-text-strong">{profile.ageRange || '미설정'}</span>
            </div>
            <div className="profile-onboarding-item">
              <span>관심 카테고리</span>
              <span className="profile-text-strong">{profile.primaryCategory || '미설정'}</span>
            </div>
          </div>
          <div className="profile-section-divider" style={{ marginTop: '1rem' }}>
            <span className="profile-section-subtitle" style={{ fontWeight: 500 }}>관심 토픽</span>
            {interests.length > 0 ? (
              <div className="profile-chip-list">
                {interests.map((topic) => (
                  <span key={topic} className="profile-chip">#{topic}</span>
                ))}
              </div>
            ) : (
              <p className="profile-empty">관심 토픽이 없습니다</p>
            )}
          </div>
        </div>

        <div className="profile-section-divider">
          <label className="form-label">외국인등록증 업로드</label>
          <p className="profile-helper-text">관리자 인증을 위해 파일을 업로드해주세요.</p>
          <input
            ref={registrationCardInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleRegistrationCardUpload}
            style={{ display: 'none' }}
          />
          {profile.registrationCardUrl ? (
            <div className="profile-file-card">
              <span aria-hidden style={{ fontSize: '1.5rem' }}>📄</span>
              <div style={{ flex: 1 }}>
                <p className="profile-text-strong">{profile.registrationCardUrl}</p>
                <div className="profile-file-actions">
                  <span
                    className={`profile-file-status ${profile.registrationCardVerified ? 'success' : 'pending'}`}
                  >
                    {profile.registrationCardVerified ? '✅ 관리자 인증 완료' : '⏳ 관리자 확인 대기중'}
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => registrationCardInputRef.current?.click()}
                      className="btn-secondary"
                    >
                      📎 재업로드
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {isEditing ? (
                <>
                  <button
                    onClick={() => registrationCardInputRef.current?.click()}
                    className="btn-secondary"
                  >
                    📎 파일 선택
                  </button>
                  <p className="profile-helper-text">JPG, PNG, PDF 파일 (최대 10MB)</p>
                </>
              ) : (
                <p className="profile-empty">업로드된 파일이 없습니다</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )

  const adminSection = (
    <aside className="card">
      <div className="card-header profile-section-header">
        <h2 className="card-title">🔒 관리자 부여 정보</h2>
        <p className="profile-section-subtitle">관리자가 설정하는 인증 및 활동 정보</p>
      </div>
      <div className="card-content profile-stats-stack">
        <div className="profile-file-card">
          <span aria-hidden style={{ fontSize: '1.5rem' }}>{roleInfo.icon}</span>
          <div>
            <p className="profile-section-subtitle" style={{ fontWeight: 500 }}>사용자 권한</p>
            <p className="profile-text-strong">{roleInfo.label}</p>
          </div>
        </div>

        <div className="profile-trust-card">
          <span aria-hidden style={{ fontSize: '1.5rem' }}>⭐</span>
          <div>
            <p className="profile-section-subtitle" style={{ color: '#1e40af' }}>신뢰도 점수</p>
            <p className="profile-hero-name" style={{ fontSize: '1.5rem', color: '#1e40af' }}>
              {profile.trustScore}
            </p>
          </div>
        </div>

        <div>
          <label className="form-label">인증 배지</label>
          <div className="profile-badge-list">
            {profile.badges.verified && (
              <span className="profile-badge-pill verified">✅ 인증 사용자</span>
            )}
            {profile.badges.expert && (
              <span className="profile-badge-pill expert">🎓 전문가</span>
            )}
            {profile.badges.helpful && (
              <span className="profile-badge-pill helpful">💙 도움이 되는 답변자</span>
            )}
            {!profile.badges.verified && !profile.badges.expert && !profile.badges.helpful && (
              <p className="profile-empty">획득한 배지가 없습니다</p>
            )}
          </div>
        </div>

        <div className="profile-stat-summary">
          <label className="form-label">커뮤니티 활동 통계</label>
          <div className="profile-stat-grid">
            <div className="profile-stat-card-lite questions">
              <strong>{profile.questionCount}</strong>
              <span>작성한 질문</span>
            </div>
            <div className="profile-stat-card-lite answers">
              <strong>{profile.answerCount}</strong>
              <span>작성한 답변</span>
            </div>
            <div className="profile-stat-card-lite helpful">
              <strong>{profile.helpfulAnswerCount}</strong>
              <span>도움이 된 답변</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <PageLayout variant="withSidebar" showSidebar={false}>
      <div className="profile-page">
        {heroSection}
        {showSuccess && (
          <div className="profile-alert profile-alert-success">
            <span aria-hidden>✅</span>
            <span>프로필이 성공적으로 업데이트되었습니다!</span>
          </div>
        )}
        <div className="profile-content-grid">
          {editableSection}
          {adminSection}
        </div>
      </div>
    </PageLayout>
  )
}
