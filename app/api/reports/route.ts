import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import {
  createSupabaseServerClient,
  createSupabaseServiceClient
} from '@/lib/supabase-server'
import {
  DEFAULT_REPORT_REASON,
  REPORT_REASON_LABEL_MAP,
  REPORT_TARGET_TYPES,
  ReportTargetType,
  isReportTargetType
} from '@/lib/constants/reports'
import {
  ensureReportTargetExists,
  setTargetReportedFlag
} from '@/lib/server/reporting'

const MAX_DESCRIPTION_LENGTH = 1000

type ReportRequestPayload = {
  targetId?: string
  targetType?: string
  reason?: string
  description?: string
  metadata?: Record<string, unknown>
}

const normalizedTargetType = (value: string | undefined): ReportTargetType | null => {
  if (!value) return null
  const lowered = value.toLowerCase()
  return isReportTargetType(lowered) ? lowered : null
}

const sanitizeDescription = (text: string | undefined) => {
  if (typeof text !== 'string') return null
  const trimmed = text.trim()
  if (!trimmed) return null
  return trimmed.slice(0, MAX_DESCRIPTION_LENGTH)
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      return NextResponse.json({
        success: true,
        message: '모의 환경에서는 신고가 자동 승인됩니다.'
      })
    }

    const payload = (await request.json().catch(() => null)) as ReportRequestPayload | null
    if (!payload) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
    }

    const targetId = typeof payload.targetId === 'string' ? payload.targetId.trim() : ''
    const targetType = normalizedTargetType(payload.targetType)
    const reasonRaw = typeof payload.reason === 'string' ? payload.reason.trim().toLowerCase() : DEFAULT_REPORT_REASON
    const description = sanitizeDescription(payload.description)
    const metadata = isPlainObject(payload.metadata) ? payload.metadata : {}

    if (!targetId || targetId.length < 10) {
      return NextResponse.json({ error: '신고 대상을 확인할 수 없습니다.' }, { status: 400 })
    }

    if (!targetType) {
      return NextResponse.json(
        { error: `지원하지 않는 신고 대상입니다. (${REPORT_TARGET_TYPES.join(', ')})` },
        { status: 400 }
      )
    }

    const normalizedReason = REPORT_REASON_LABEL_MAP[reasonRaw] ? reasonRaw : DEFAULT_REPORT_REASON

    if (normalizedReason === 'other' && (!description || description.length < 10)) {
      return NextResponse.json(
        { error: '기타 사유를 선택한 경우 상세 설명을 10자 이상 입력해주세요.' },
        { status: 400 }
      )
    }

    const { user, error: authError } = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: authError || '로그인이 필요합니다.' }, { status: 401 })
    }

    let serviceClient
    try {
      serviceClient = createSupabaseServiceClient()
    } catch (serviceError) {
      console.error('[Report] service client 생성 실패', serviceError)
      return NextResponse.json(
        { error: '서버 설정이 올바르지 않습니다.' },
        { status: 500 }
      )
    }

    const targetExists = await ensureReportTargetExists(serviceClient, targetId, targetType)
    if (!targetExists) {
      return NextResponse.json({ error: '신고 대상 콘텐츠를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 동일 사용자의 중복 신고 방지 (진행 중 상태만 확인)
    const { data: existingReport, error: duplicateCheckError } = await serviceClient
      .from('content_reports')
      .select('id, status')
      .eq('reporter_id', user.id)
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (duplicateCheckError && duplicateCheckError.code !== 'PGRST116') {
      console.warn('[Report] duplicate check 실패', duplicateCheckError)
    }

    if (
      existingReport &&
      (existingReport.status === 'pending' || existingReport.status === 'in_review')
    ) {
      return NextResponse.json(
        {
          success: true,
          message: '이미 신고가 접수되어 검토 중입니다.',
          reportId: existingReport.id
        },
        { status: 200 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const { error: insertError } = await supabase
      .from('content_reports')
      .insert({
        target_id: targetId,
        target_type: targetType,
        reporter_id: user.id,
        reason: normalizedReason,
        description,
        metadata
      })

    if (insertError) {
      console.error('[Report] 신고 저장 실패', insertError)
      return NextResponse.json(
        { error: '신고 접수 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    try {
      await setTargetReportedFlag(serviceClient, targetId, targetType, true)
    } catch (flagError) {
      console.warn('[Report] 신고 대상 플래그 업데이트 실패', flagError)
    }

    return NextResponse.json({
      success: true,
      message: '신고가 접수되었습니다. 빠르게 검토하겠습니다.'
    })
  } catch (error) {
    console.error('[Report] API 오류', error)
    return NextResponse.json(
      { error: '신고 처리 중 문제가 발생했습니다.' },
      { status: 500 }
    )
  }
}
