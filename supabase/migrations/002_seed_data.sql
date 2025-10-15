-- VietKConnect 초기 데이터 입력
-- 베트남인 한국생활 Q&A 플랫폼 기본 데이터

-- 1. 카테고리 초기 데이터
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('비자/법률', 'visa', '비자 신청, 변경, 연장 및 한국 법률 관련 질문', '🛂', '#3B82F6', 1),
('취업/직장', 'employment', '구직, 이직, 워킹비자, 회사생활 관련 질문', '💼', '#059669', 2),
('주거/부동산', 'housing', '임대, 매매, 부동산 계약 관련 질문', '🏠', '#DC2626', 3),
('교육/학업', 'education', '한국어 학습, 대학교, 어학원 관련 질문', '🎓', '#7C3AED', 4),
('의료/건강', 'healthcare', '병원, 의료보험, 건강관리 관련 질문', '🏥', '#EA580C', 5),
('일상생활', 'daily-life', '음식, 교통, 쇼핑 등 일상생활 관련 질문', '🍜', '#0891B2', 6),
('금융/세금', 'finance', '은행, 송금, 세금, 보험 관련 질문', '💳', '#65A30D', 7),
('문화/여행', 'culture', '한국 문화, 여행, 관광지 관련 질문', '🎎', '#DB2777', 8);

-- 2. 테스트 사용자 계정 생성
INSERT INTO users (
  id,
  email,
  name,
  role,
  verification_status,
  verification_type,
  visa_type,
  company,
  years_in_korea,
  region,
  specialty_areas,
  trust_score,
  question_count,
  answer_count,
  is_verified
) VALUES
-- 관리자 계정
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'admin@vietkconnect.com',
  '관리자',
  'admin',
  'approved',
  'work',
  'F-5',
  'VietKConnect',
  5,
  '서울',
  ARRAY['visa', 'employment', 'legal'],
  100,
  0,
  0,
  true
),
-- 검증된 사용자 (베트남 커뮤니티 리더)
(
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  'leader@vietkconnect.com',
  '응우옌 반 민',
  'verified',
  'approved',
  'work',
  'E-7',
  '삼성전자',
  7,
  '서울',
  ARRAY['employment', 'visa', 'daily-life'],
  85,
  15,
  42,
  true
),
-- 일반 인증 사용자
(
  'c3d4e5f6-g7h8-9012-cdef-345678901234',
  'user1@vietkconnect.com',
  '트란 티 후에',
  'verified',
  'approved',
  'student',
  'D-2',
  '서울대학교',
  3,
  '서울',
  ARRAY['education', 'daily-life'],
  65,
  8,
  23,
  true
),
-- 일반 사용자
(
  'd4e5f6g7-h8i9-0123-defg-456789012345',
  'user2@vietkconnect.com',
  '레 반 투안',
  'user',
  'none',
  null,
  'H-2',
  null,
  2,
  '부산',
  ARRAY['housing', 'employment'],
  30,
  5,
  8,
  false
),
-- 새로운 사용자
(
  'e5f6g7h8-i9j0-1234-efgh-567890123456',
  'newuser@vietkconnect.com',
  '팜 티 란',
  'user',
  'pending',
  'family',
  'F-3',
  null,
  1,
  '인천',
  ARRAY['healthcare', 'daily-life'],
  15,
  2,
  1,
  false
);

-- 3. 테스트 질문 데이터
INSERT INTO questions (
  id,
  title,
  content,
  author_id,
  category_id,
  tags,
  urgency,
  view_count,
  answer_count,
  upvote_count,
  downvote_count,
  status,
  is_featured
) VALUES
-- 비자 관련 질문
(
  'q1a2b3c4-d5e6-7890-abcd-ef1234567890',
  'E-7 비자에서 F-2로 변경하는 방법이 궁금합니다',
  '현재 E-7 비자로 한국에서 일하고 있습니다. 3년 정도 되었는데 F-2 비자로 변경하고 싶어요. 어떤 서류가 필요하고 절차는 어떻게 되나요? 경험이 있으신 분들의 조언 부탁드립니다.',
  'c3d4e5f6-g7h8-9012-cdef-345678901234',
  1,
  ARRAY['E-7', 'F-2', '비자변경', '서류'],
  'high',
  45,
  3,
  12,
  0,
  'open',
  true
),
-- 취업 관련 질문
(
  'q2b3c4d5-e6f7-8901-bcde-f23456789012',
  '한국 회사 면접에서 자주 나오는 질문들',
  '다음 주에 한국 IT 회사 면접이 있습니다. 베트남 사람으로서 한국 회사 면접에서 자주 나오는 질문들과 어떻게 대답하면 좋을지 알고 싶어요. 특히 한국어 실력이나 문화 적응에 대한 질문이 나올 것 같은데 어떻게 준비해야 할까요?',
  'd4e5f6g7-h8i9-0123-defg-456789012345',
  2,
  ARRAY['면접', 'IT회사', '한국어', '문화적응'],
  'normal',
  32,
  5,
  8,
  0,
  'open',
  false
),
-- 주거 관련 질문
(
  'q3c4d5e6-f7g8-9012-cdef-345678901234',
  '서울에서 원룸 구하기 - 보증금 얼마나 준비해야 하나요?',
  '서울에서 첫 직장을 구했는데 원룸을 구하려고 합니다. 강남구나 서초구 쪽으로 알아보고 있는데 보증금이 너무 비싸서 놀랐어요. 베트남 사람들이 주로 어느 지역에 살고 계시는지, 보증금은 보통 얼마나 준비해야 하는지 궁금합니다.',
  'e5f6g7h8-i9j0-1234-efgh-567890123456',
  3,
  ARRAY['원룸', '보증금', '서울', '강남'],
  'normal',
  28,
  2,
  5,
  0,
  'open',
  false
),
-- 교육 관련 질문
(
  'q4d5e6f7-g8h9-0123-defg-456789012345',
  'TOPIK 6급 준비 - 효과적인 공부 방법',
  '현재 TOPIK 4급인데 6급까지 따려고 합니다. 회사에서 승진을 위해 필요해서요. 독학으로 공부하고 있는데 특히 쓰기 영역이 어려워요. 6급 합격하신 분들의 공부 방법이나 추천 교재 있으면 공유해 주세요.',
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  4,
  ARRAY['TOPIK', '6급', '한국어', '쓰기', '독학'],
  'low',
  67,
  7,
  15,
  1,
  'open',
  true
),
-- 의료 관련 질문
(
  'q5e6f7g8-h9i0-1234-efgh-567890123456',
  '국민건강보험 가입 후 병원비가 얼마나 나올까요?',
  '다음 달부터 국민건강보험에 가입하게 됩니다. 치과 치료를 받아야 하는데 보험 적용되면 비용이 얼마나 줄어드는지 궁금해요. 특히 스케일링이나 충치 치료 비용이 궁금합니다. 경험 있으신 분들 답변 부탁드려요.',
  'c3d4e5f6-g7h8-9012-cdef-345678901234',
  5,
  ARRAY['국민건강보험', '치과', '스케일링', '충치'],
  'normal',
  19,
  1,
  3,
  0,
  'open',
  false
);

-- 4. 테스트 답변 데이터
INSERT INTO answers (
  id,
  content,
  question_id,
  author_id,
  is_accepted,
  upvote_count,
  helpful_count
) VALUES
-- E-7 → F-2 질문에 대한 답변
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '저도 작년에 E-7에서 F-2로 변경했습니다. 주요 서류는 다음과 같아요:

1. 거주사실확인서 (주민센터 발급)
2. 소득증명원 (회사에서 발급)
3. 건강보험료 납부확인서
4. 국민연금 가입증명서
5. 통장 잔고증명서 (최소 3개월치)

가장 중요한 건 소득 요건입니다. 전년도 연봉이 2천만원 이상이어야 하고, 건보료와 연금을 성실히 납부한 기록이 있어야 해요. 출입국관리소에서 상담받고 진행하시길 추천드립니다.',
  'q1a2b3c4-d5e6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  true,
  8,
  6
),
-- 면접 질문에 대한 답변
(
  'a2c3d4e5-f6g7-8901-bcde-f23456789012',
  'IT 회사 면접 경험을 공유드릴게요.

자주 나오는 질문들:
- 한국어 실력은 어느 정도인가요?
- 한국 문화에 적응하는 데 어려움은 없나요?
- 베트남과 한국의 업무 방식 차이를 어떻게 생각하나요?
- 장기적으로 한국에서 일할 계획이 있나요?

답변 팁:
1. 한국어 실력은 TOPIK 급수와 함께 구체적으로 말하기
2. 문화 적응 노력을 구체적인 사례로 설명
3. 한국 업무 문화의 장점을 언급하며 긍정적으로 답변
4. 성장 의지와 회사에 기여하고 싶은 마음 표현

면접 화이팅하세요!',
  'q2b3c4d5-e6f7-8901-bcde-f23456789012',
  'c3d4e5f6-g7h8-9012-cdef-345678901234',
  false,
  5,
  4
),
-- TOPIK 질문에 대한 답변
(
  'a3d4e5f6-g7h8-9012-cdef-345678901234',
  'TOPIK 6급 합격 경험을 공유합니다.

쓰기 영역 공부법:
1. 기출문제 분석 - 최근 3년간 기출문제 패턴 파악
2. 템플릿 암기 - 논술문 구조를 템플릿으로 만들어 암기
3. 매일 쓰기 연습 - 하루에 한 편씩 시간 재며 연습
4. 한국인 친구 피드백 - 문법과 자연스러운 표현 확인

추천 교재:
- TOPIK 쓰기 마스터 (시사한국어사)
- 한국어 능력시험 TOPIK II 쓰기 (박이정)

무엇보다 꾸준함이 중요해요. 6급까지 화이팅!',
  'q4d5e6f7-g8h9-0123-defg-456789012345',
  'b2c3d4e5-f6g7-8901-bcde-f23456789012',
  true,
  12,
  9
);

-- 5. 투표 데이터 (테스트용)
INSERT INTO votes (user_id, target_id, target_type, vote_type) VALUES
-- 질문에 대한 투표
('b2c3d4e5-f6g7-8901-bcde-f23456789012', 'q1a2b3c4-d5e6-7890-abcd-ef1234567890', 'question', 'upvote'),
('c3d4e5f6-g7h8-9012-cdef-345678901234', 'q1a2b3c4-d5e6-7890-abcd-ef1234567890', 'question', 'upvote'),
('d4e5f6g7-h8i9-0123-defg-456789012345', 'q1a2b3c4-d5e6-7890-abcd-ef1234567890', 'question', 'upvote'),

-- 답변에 대한 투표
('c3d4e5f6-g7h8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'answer', 'upvote'),
('d4e5f6g7-h8i9-0123-defg-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'answer', 'upvote'),
('e5f6g7h8-i9j0-1234-efgh-567890123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'answer', 'helpful');

-- 6. 댓글 데이터 (테스트용)
INSERT INTO comments (content, target_id, target_type, author_id) VALUES
('정말 유용한 정보네요. 저도 비슷한 상황이라 참고하겠습니다!', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'answer', 'd4e5f6g7-h8i9-0123-defg-456789012345'),
('출입국관리소 상담 예약은 어떻게 하나요?', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'answer', 'e5f6g7h8-i9j0-1234-efgh-567890123456'),
('면접 준비에 도움이 많이 될 것 같아요. 감사합니다!', 'a2c3d4e5-f6g7-8901-bcde-f23456789012', 'answer', 'd4e5f6g7-h8i9-0123-defg-456789012345');

-- 7. 알림 데이터 (테스트용)
INSERT INTO notifications (user_id, type, title, message, related_id, related_type) VALUES
('c3d4e5f6-g7h8-9012-cdef-345678901234', 'new_answer', '새로운 답변이 등록되었습니다', 'E-7 비자에서 F-2로 변경하는 방법이 궁금합니다 질문에 새로운 답변이 등록되었습니다.', 'q1a2b3c4-d5e6-7890-abcd-ef1234567890', 'question'),
('d4e5f6g7-h8i9-0123-defg-456789012345', 'answer_accepted', '답변이 채택되었습니다', '한국 회사 면접에서 자주 나오는 질문들에 대한 답변이 도움이 되었다는 피드백을 받았습니다.', 'a2c3d4e5-f6g7-8901-bcde-f23456789012', 'answer'),
('b2c3d4e5-f6g7-8901-bcde-f23456789012', 'question_commented', '댓글이 등록되었습니다', 'TOPIK 6급 준비 - 효과적인 공부 방법에 대한 답변에 댓글이 등록되었습니다.', 'a3d4e5f6-g7h8-9012-cdef-345678901234', 'answer');