'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { User, Edit2, Save, X, MapPin, Briefcase, Clock, Award } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  bio?: string
  visa_type?: string
  company?: string
  years_in_korea?: number
  region?: string
  preferred_language?: string
  trust_score?: number
  badges?: {
    verified: boolean
    expert: boolean
    helpful: boolean
  }
  question_count?: number
  answer_count?: number
  helpful_answer_count?: number
  specialties?: string[]
  interests?: string[]
  notification_settings?: {
    email_notifications: boolean
    push_notifications: boolean
    sms_notifications: boolean
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setProfile(result.data)
          setEditForm(result.data)
        }
      }
    } catch (error) {
      console.error('프로필 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setProfile(result.data)
          setEditing(false)
          // 신뢰도 보너스가 있으면 알림
          if (result.trust_bonus) {
            alert(`프로필이 업데이트되었습니다! 신뢰도 보너스: ${result.trust_bonus}`)
          }
        }
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error)
      alert('프로필 업데이트에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm(profile || {})
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">프로필을 불러오는 중...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-500">프로필을 불러올 수 없습니다.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">프로필</h1>
          {!editing ? (
            <Button onClick={() => setEditing(true)} variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              편집
            </Button>
          ) : (
            <div className="space-x-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                취소
              </Button>
            </div>
          )}
        </div>

        {/* 기본 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">자기소개</label>
                  <Textarea
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="자기소개를 입력하세요 (50자 이상 작성시 신뢰도 +10)"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profile.name}</h2>
                    <p className="text-gray-600">{profile.email}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    {profile.badges?.verified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Award className="w-3 h-3 mr-1" />
                        인증됨
                      </Badge>
                    )}
                    {profile.badges?.helpful && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        도움이 되는 답변자
                      </Badge>
                    )}
                  </div>
                </div>
                {profile.bio && (
                  <div className="mt-4">
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* 상세 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>상세 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">비자 종류</label>
                    <Select value={editForm.visa_type || ''} onValueChange={(value) => setEditForm({ ...editForm, visa_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="비자 종류를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="D-2">D-2 (유학)</SelectItem>
                        <SelectItem value="E-7">E-7 (특정활동)</SelectItem>
                        <SelectItem value="F-2">F-2 (거주)</SelectItem>
                        <SelectItem value="F-5">F-5 (영주)</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">거주 지역</label>
                    <Input
                      value={editForm.region || ''}
                      onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                      placeholder="거주 지역을 입력하세요"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">회사/학교</label>
                    <Input
                      value={editForm.company || ''}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      placeholder="회사나 학교를 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">한국 거주 기간 (년)</label>
                    <Input
                      type="number"
                      value={editForm.years_in_korea || ''}
                      onChange={(e) => setEditForm({ ...editForm, years_in_korea: parseInt(e.target.value) || 0 })}
                      placeholder="거주 기간을 입력하세요"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">거주 지역</p>
                    <p className="font-medium">{profile.region || '미설정'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">비자 종류</p>
                    <p className="font-medium">{profile.visa_type || '미설정'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">한국 거주 기간</p>
                    <p className="font-medium">{profile.years_in_korea ? `${profile.years_in_korea}년` : '미설정'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">회사/학교</p>
                    <p className="font-medium">{profile.company || '미설정'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 활동 통계 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>커뮤니티 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.trust_score || 0}</div>
                <p className="text-sm text-gray-500">신뢰도 점수</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile.question_count || 0}</div>
                <p className="text-sm text-gray-500">작성한 질문</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.answer_count || 0}</div>
                <p className="text-sm text-gray-500">작성한 답변</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{profile.helpful_answer_count || 0}</div>
                <p className="text-sm text-gray-500">도움이 된 답변</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}