'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import { getSubscribedTopics, subscribeTopic, unsubscribeTopic } from '@/lib/utils/follow-manager'

type UserRole = 'GUEST' | 'USER' | 'VERIFIED' | 'ADMIN'

interface UserProfile {
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
  { id: 1, name: '한국 비자·체류', icon: '🛂' },
  { id: 2, name: '한국 직장생활', icon: '💼' },
  { id: 4, name: '한국 생활 정착', icon: '🌏' },
  { id: 6, name: '한국에서 집 구하기', icon: '🏠' },
  { id: 8, name: '베트남 송금·금융', icon: '💰' },
  { id: 9, name: '한국어 배우기', icon: '📚' }
]

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

  const payload = {
    name: editForm.name ?? profile.name,
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
    const updatedProfile: UserProfile = {
      ...profile,
      ...editForm,
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
          await subscribeTopic({
            id: meta.id,
            slug: meta.name.replace(/\s+/g, '-').toLowerCase()
          })
        })
      )
    } catch (topicError) {
      console.warn('관심 토픽 동기화 실패:', topicError)
    }

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
  }

  function handleProfilePictureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // In real app, would upload to server and get URL
    // For mock, create object URL
    const imageUrl = URL.createObjectURL(file)
    setEditForm({ ...editForm, profilePictureUrl: imageUrl })
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
    const roleMap = {
      GUEST: { label: '게스트', icon: '🔒', color: 'gray' },
      USER: { label: '일반 사용자', icon: '👤', color: 'blue' },
      VERIFIED: { label: '인증 사용자', icon: '✅', color: 'green' },
      ADMIN: { label: '관리자', icon: '👑', color: 'purple' }
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
      <PageLayout variant="centered">
        <div className="card">
          <div className="card-content">
            <p>프로필을 불러오는 중...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  const roleInfo = getRoleInfo(profile.role)

  return (
    <PageLayout variant="centered">
        {/* Page Header */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="card-title">프로필</h1>
              <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                내 정보 관리 및 확인
              </p>
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn-secondary">
                ✏️ 편집
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSave} className="btn-primary">
                  💾 저장
                </button>
                <button onClick={handleCancel} className="btn-secondary">
                  ✖️ 취소
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            background: '#d1fae5',
            color: '#065f46',
            border: '1px solid #a7f3d0'
          }}>
            ✅ 프로필이 성공적으로 업데이트되었습니다!
          </div>
        )}

        {/* Section 1: User-Editable Information */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">✏️ 사용자 수정 가능</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              본인이 직접 수정할 수 있는 정보
            </p>
          </div>
          <div className="card-content">
            {/* Profile Picture */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">프로필 사진</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: profile.profilePictureUrl
                    ? `url(${profile.profilePictureUrl}) center/cover`
                    : '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  {!profile.profilePictureUrl && '👤'}
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
                      className="btn-secondary"
                      style={{ fontSize: '0.875rem' }}
                    >
                      📷 사진 업로드
                    </button>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                      JPG, PNG 파일 (최대 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Name and Nickname */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
                  <p style={{ padding: '0.5rem 0', fontWeight: 500 }}>{profile.name}</p>
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
                  <p style={{ padding: '0.5rem 0', fontWeight: 500 }}>@{profile.nickname}</p>
                )}
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">이메일</label>
              <p style={{ padding: '0.5rem 0', color: '#6b7280' }}>{profile.email}</p>
            </div>

            {/* Bio */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">자기소개</label>
              {isEditing ? (
                <textarea
                  className="form-textarea"
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="간단한 자기소개를 작성해주세요"
                  rows={3}
                />
              ) : (
                <p style={{ padding: '0.5rem 0', color: profile.bio ? '#374151' : '#9ca3af' }}>
                  {profile.bio || '자기소개가 없습니다'}
                </p>
              )}
            </div>

            {/* Personal Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">비자 종류</label>
                {isEditing ? (
                  <select
                    className="form-input"
                    value={editForm.visaType || ''}
                    onChange={(e) => setEditForm({ ...editForm, visaType: e.target.value })}
                  >
                    <option value="D-2">D-2 (유학)</option>
                    <option value="E-7">E-7 (특정활동)</option>
                    <option value="E-9">E-9 (비전문취업)</option>
                    <option value="F-2">F-2 (거주)</option>
                    <option value="F-4">F-4 (재외동포)</option>
                    <option value="F-5">F-5 (영주)</option>
                    <option value="기타">기타</option>
                  </select>
                ) : (
                  <p style={{ padding: '0.5rem 0', fontWeight: 500 }}>{profile.visaType}</p>
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
                  <p style={{ padding: '0.5rem 0', fontWeight: 500 }}>{profile.region}</p>
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
                  <p style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                    {profile.company || '미설정'}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">한국 거주 기간</label>
                {isEditing ? (
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.yearsInKorea || ''}
                    onChange={(e) => setEditForm({ ...editForm, yearsInKorea: parseInt(e.target.value) || 0 })}
                    placeholder="년"
                  />
                ) : (
                  <p style={{ padding: '0.5rem 0', fontWeight: 500 }}>{profile.yearsInKorea}년</p>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">거주 상태</label>
                {isEditing ? (
                  <div className="option-grid">
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
                  <p style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                    {resolveLabel(profile.residence, RESIDENCE_OPTIONS)}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">성별</label>
                {isEditing ? (
                  <div className="option-grid">
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
                  <p style={{ padding: '0.5rem 0', fontWeight: 500 }}>
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
                  <p style={{ padding: '0.5rem 0', fontWeight: 500 }}>
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
                  <p style={{ padding: '0.5rem 0', fontWeight: 500 }}>
                    {resolveLabel(profile.primaryCategory, CATEGORY_OPTIONS)}
                  </p>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">관심 토픽</label>
              {isEditing ? (
                <div className="option-grid two-columns">
                  {TOPIC_OPTIONS.map((topic) => {
                    const current = editForm.interests ?? profile.interests ?? []
                    const checked = current.includes(topic.name)
                    return (
                      <label key={topic.id} className={`option-card ${checked ? 'selected' : ''}`}>
                        <input
                          type="checkbox"
                          value={topic.name}
                          checked={checked}
                          onChange={(e) => {
                            const interests = editForm.interests ?? profile.interests ?? []
                            const next = e.target.checked
                              ? Array.from(new Set([...interests, topic.name]))
                              : interests.filter((name) => name !== topic.name)
                            setEditForm({ ...editForm, interests: next })
                          }}
                        />
                        <span>{topic.icon} {topic.name}</span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(profile.interests && profile.interests.length > 0)
                    ? profile.interests.map((interest) => {
                        const topicMeta = TOPIC_OPTIONS.find((item) => item.name === interest)
                        return (
                          <span
                            key={interest}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.35rem 0.8rem',
                              borderRadius: '999px',
                              background: '#eef2ff',
                              color: '#3730a3',
                              fontWeight: 600,
                              fontSize: '0.85rem'
                            }}
                          >
                            {topicMeta?.icon || '⭐'} {interest}
                          </span>
                        )
                      })
                    : <span style={{ color: '#9ca3af' }}>관심 토픽을 설정하지 않았습니다</span>}
                </div>
              )}
            </div>

            {/* Onboarding Snapshot */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🌱</span> 온보딩 기본 정보
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>거주 지역</div>
                  <div style={{ fontWeight: 600 }}>{profile.residence || '미설정'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>성별</div>
                  <div style={{ fontWeight: 600 }}>{profile.gender || '미설정'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>연령대</div>
                  <div style={{ fontWeight: 600 }}>{profile.ageRange || '미설정'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>관심 카테고리</div>
                  <div style={{ fontWeight: 600 }}>{profile.primaryCategory || '미설정'}</div>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>관심 토픽</div>
                {profile.interests.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {profile.interests.map(topic => (
                      <span
                        key={topic}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '999px',
                          background: '#eef2ff',
                          color: '#3730a3',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#9ca3af' }}>관심 토픽이 없습니다</div>
                )}
              </div>
            </div>

            {/* Foreign Registration Card Upload */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <label className="form-label">외국인등록증 업로드</label>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                관리자 인증을 위한 외국인등록증을 업로드해주세요
              </p>

              {profile.registrationCardUrl ? (
                <div style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: '#374151' }}>
                        {profile.registrationCardUrl}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {profile.registrationCardVerified ? (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: '#d1fae5',
                            color: '#065f46'
                          }}>
                            ✅ 관리자 인증 완료
                          </span>
                        ) : (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: '#fef3c7',
                            color: '#92400e'
                          }}>
                            ⏳ 관리자 확인 대기중
                          </span>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => registrationCardInputRef.current?.click()}
                        className="btn-secondary"
                        style={{ fontSize: '0.875rem' }}
                      >
                        📎 재업로드
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {isEditing && (
                    <>
                      <input
                        ref={registrationCardInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleRegistrationCardUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={() => registrationCardInputRef.current?.click()}
                        className="btn-secondary"
                      >
                        📎 파일 선택
                      </button>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        JPG, PNG, PDF 파일 (최대 10MB)
                      </p>
                    </>
                  )}
                  {!isEditing && (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                      업로드된 파일이 없습니다
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Admin-Assigned Information */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">🔒 관리자 부여 정보</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              사용자핵심정보 - 인증 (관리자만 수정 가능)
            </p>
          </div>
          <div className="card-content">
            {/* Role/권한 */}
            <div style={{
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{roleInfo.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>사용자 권한</p>
                  <p style={{ fontWeight: 600, color: '#374151', fontSize: '1.125rem' }}>
                    {roleInfo.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Score */}
            <div style={{
              padding: '1rem',
              background: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #dbeafe',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⭐</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>신뢰도 점수</p>
                  <p style={{ fontWeight: 700, color: '#1e40af', fontSize: '1.5rem' }}>
                    {profile.trustScore}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Badges */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">인증 배지</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {profile.badges.verified && (
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: '#d1fae5',
                    color: '#065f46',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ✅ 인증 사용자
                  </span>
                )}
                {profile.badges.expert && (
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    color: '#92400e',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🎓 전문가
                  </span>
                )}
                {profile.badges.helpful && (
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: '#e0e7ff',
                    color: '#3730a3',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    💙 도움이 되는 답변자
                  </span>
                )}
                {!profile.badges.verified && !profile.badges.expert && !profile.badges.helpful && (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    획득한 배지가 없습니다
                  </p>
                )}
              </div>
            </div>

            {/* Activity Statistics */}
            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <label className="form-label" style={{ marginBottom: '1rem' }}>커뮤니티 활동 통계</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{
                  padding: '1rem',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a' }}>
                    {profile.questionCount}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#15803d', marginTop: '0.25rem' }}>
                    작성한 질문
                  </p>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#eff6ff',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb' }}>
                    {profile.answerCount}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.25rem' }}>
                    작성한 답변
                  </p>
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#d97706' }}>
                    {profile.helpfulAnswerCount}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#92400e', marginTop: '0.25rem' }}>
                    도움이 된 답변
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </PageLayout>
  )
}
