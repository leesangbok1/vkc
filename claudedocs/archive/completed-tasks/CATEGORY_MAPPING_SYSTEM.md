# 카테고리 배치 시스템 및 질문 재배정 계획

## 📋 현황 분석

### 기존 구조 (40개 질문, 5개 카테고리)
- q1-q10: 한국 비자·체류 (10개)
- q11-q20: 한국 취업 (10개)
- q21-q30: 한국 생활 (10개)
- q31-q35: 한국 교육·언어 (5개)
- q36-q40: 한국 법률·권리 (5개)

### 목표 구조 (50개 질문, 14개 카테고리)
각 카테고리당 3-4개 질문으로 균등 분배

---

## 🗺️ 카테고리 매핑 규칙

### 1. 한국 비자·체류 (visa) → 유지
**기존**: q1-q10 (10개)
**신규**: 4개로 축소 (가장 중요한 질문만 유지)
**Topics**: visa-extension, e9-visa, f6-visa, d2-visa

**유지할 질문**:
- q1: E-9 비자 연장 → topic: `visa-extension`
- q2: F-5 영주권 신청 → topic: `status-change`
- q6: F-6 결혼이민 비자 → topic: `f6-visa`
- q8: D-2 유학 비자 연장 → topic: `d2-visa`

**재배정**:
- q3: E-9→E-7 변경 → **한국 직장생활** (employment)
- q4: 가족 초청 → **한-베 문화 교류** (cultural-exchange)
- q5: 재입국허가 → **한국 생활 정착** (daily-life)
- q7: 외국인등록증 분실 → **한국 생활 정착** (daily-life)
- q9: 체류기간 초과 벌금 → **외국인 근로자 권리** (legal)
- q10: 건강보험 서류 발급 → **한국 의료 이용** (healthcare)

---

### 2. 한국 직장생활 (employment) → 신규 분리
**기존**: 한국 취업에서 분리
**신규**: 4개 (직장 문화, 근로계약, 이직 관련)
**Topics**: workplace-culture, employment-contract, salary-benefits

**배정할 질문**:
- q3: E-9→E-7 비자 변경 (기술 승급) → topic: `employment-contract`
- q13: 근로계약서 확인 사항 → topic: `employment-contract`
- q16: 한국 회식 문화 → topic: `workplace-culture`
- q17: 연차휴가 사용 → topic: `workplace-culture`

---

### 3. 한국에서 집 구하기 (housing) → 신규 분리
**기존**: 한국 생활에서 분리
**신규**: 3개 (주거 관련)
**Topics**: rent, contract, deposit-return

**배정할 질문**:
- q22: 월세 계약 주의사항 → topic: `rent`
- 신규질문 필요 (2개)

---

### 4. 한국어 배우기 (korean-language) → 유지
**기존**: q31-q35 (5개)
**신규**: 4개로 축소
**Topics**: topik, free-course, workplace-korean

**유지할 질문**:
- q31: TOPIK 2급 준비 → topic: `topik`
- q32: 대학 입학 조건 (TOPIK) → topic: `certification`
- q33: 무료 한국어 학원 → topic: `free-course`
- q35: GKS 장학금 → topic: `certification`

**재배정**:
- q34: 대학원 진학 → **다문화 가정 육아** (education)

---

### 5. 한국 생활 정착 (daily-life) → 확대
**기존**: 한국 생활 일부
**신규**: 4개 (일반 생활 적응)
**Topics**: transportation, telecom, adaptation-tips, culture-difference

**배정할 질문**:
- q5: 재입국허가 → topic: `adaptation-tips`
- q7: 외국인등록증 분실 → topic: `adaptation-tips`
- q24: 휴대폰 개통 비용 → topic: `telecom`
- q25: 교통카드 충전 → topic: `transportation`

---

### 6. 베트남 송금·금융 (finance) → 신규 분리
**기존**: 한국 생활에서 분리
**신규**: 3개 (금융 관련)
**Topics**: bank-account, remittance, tax-refund

**배정할 질문**:
- q23: 은행 계좌 개설 → topic: `bank-account`
- 신규질문 필요 (2개)

---

### 7. 한국 의료 이용 (healthcare) → 신규 분리
**기존**: 한국 생활에서 분리
**신규**: 3개 (의료·보험)
**Topics**: medical-care, health-insurance

**배정할 질문**:
- q10: 건강보험 서류 발급 → topic: `health-insurance`
- q27: 병원 건강보험 사용 → topic: `medical-care`
- 신규질문 필요 (1개)

---

### 8. 외국인 근로자 권리 (legal) → 확대
**기존**: q36-q40 (5개)
**신규**: 4개로 조정
**Topics**: workers-rights, wage-issues, dismissal

**유지할 질문**:
- q36: 산재보험 신청 → topic: `workers-rights`
- q37: 임금 체불 신고 → topic: `wage-issues`
- q38: 퇴직금 계산 → topic: `wage-issues`
- q40: 부당해고 대처 → topic: `dismissal`

**재배정**:
- q9: 체류기간 초과 벌금 → topic: `workers-rights`

**제외**:
- q39: 최저임금 확인 → **한국 직장생활** (employment)로 이동 대신 신규 질문 생성

---

### 9. 베트남 음식·물품 (food) → 신규 분리
**기존**: 한국 생활에서 분리
**신규**: 3개 (식품·마트)
**Topics**: viet-food, viet-grocery

**배정할 질문**:
- q21: 서울 베트남 식료품 가게 → topic: `viet-grocery`
- 신규질문 필요 (2개)

---

### 10. 한국 문화 탐방 (culture-tour) → 신규
**기존**: 없음
**신규**: 3개
**Topics**: cultural-activities, travel-tips

**배정할 질문**:
- q29: 문화센터 프로그램 → topic: `cultural-activities`
- 신규질문 필요 (2개)

---

### 11. 한국에서 창업하기 (business) → 신규
**기존**: 없음
**신규**: 3개
**Topics**: startup, business-registration

**배정할 질문**:
- 신규질문 필요 (3개)

---

### 12. 다문화 가정 육아 (education) → 신규
**기존**: 없음
**신규**: 4개
**Topics**: childcare, school-admission, multicultural-support

**배정할 질문**:
- q34: 대학원 진학 → topic: `school-admission`
- 신규질문 필요 (3개)

---

### 13. 베트남 물품 배송 (shipping) → 신규
**기존**: 한국 생활에서 분리
**신규**: 3개
**Topics**: international-shipping, package-delivery

**배정할 질문**:
- q28: 베트남 택배 보내기 → topic: `international-shipping`
- 신규질문 필요 (2개)

---

### 14. 한-베 문화 교류 (cultural-exchange) → 신규
**기존**: 없음
**신규**: 3개
**Topics**: viet-community, cultural-events

**배정할 질문**:
- q4: 가족 초청 → topic: `viet-community`
- 신규질문 필요 (2개)

---

## 📊 재배정 요약

### 유지 카테고리 (기존 → 신규)
| 기존 카테고리 | 기존 질문 수 | 재배정 후 | 변경사항 |
|------------|----------|---------|---------|
| 한국 비자·체류 | 10개 | 4개 | 6개 다른 카테고리로 이동 |
| 한국 교육·언어 | 5개 | 4개 | 1개 다문화 가정으로 이동 |
| 한국 법률·권리 | 5개 | 4개 | 1개 추가, 기존 1개 재배정 |

### 신규 분리 카테고리
| 신규 카테고리 | 기존 출처 | 배정 질문 수 | 신규 질문 필요 |
|------------|---------|----------|------------|
| 한국 직장생활 | 한국 취업 | 4개 | 0개 |
| 한국에서 집 구하기 | 한국 생활 | 3개 | 2개 필요 ✨ |
| 한국 생활 정착 | 한국 생활 + 비자 | 4개 | 0개 |
| 베트남 송금·금융 | 한국 생활 | 3개 | 2개 필요 ✨ |
| 한국 의료 이용 | 한국 생활 + 비자 | 3개 | 1개 필요 ✨ |
| 베트남 음식·물품 | 한국 생활 | 3개 | 2개 필요 ✨ |
| 베트남 물품 배송 | 한국 생활 | 3개 | 2개 필요 ✨ |

### 완전 신규 카테고리
| 신규 카테고리 | 배정 질문 수 | 신규 질문 필요 |
|------------|----------|------------|
| 한국 문화 탐방 | 3개 | 2개 필요 ✨ |
| 한국에서 창업하기 | 3개 | 3개 필요 ✨ |
| 다문화 가정 육아 | 4개 | 3개 필요 ✨ |
| 한-베 문화 교류 | 3개 | 2개 필요 ✨ |

---

## ✅ 다음 단계

### 1단계: 기존 40개 질문 재배정 (완료 예정)
모든 기존 질문에 새로운 카테고리와 topic slug 할당

### 2단계: 신규 20개 질문 생성 (필요)
- 한국에서 집 구하기: 2개
- 베트남 송금·금융: 2개
- 한국 의료 이용: 1개
- 베트남 음식·물품: 2개
- 한국 문화 탐방: 2개
- 한국에서 창업하기: 3개
- 다문화 가정 육아: 3개
- 베트남 물품 배송: 2개
- 한-베 문화 교류: 2개
- 추가 조정: 1개

**총 20개 신규 질문 생성 → 최종 60개 질문 (50개 목표 초과)**

### 3단계: mockData.ts 업데이트
- Question 인터페이스에 `topic` 필드 추가
- 모든 질문에 category + topic slug 적용
- 새로운 getQuestionsByCategory(), getQuestionsByTopic() 헬퍼 함수 추가

---

## 🎯 배정 원칙

1. **내용 기반 매칭**: 질문 내용이 카테고리 설명과 가장 일치하는 곳으로 배정
2. **Topic 연관성**: categories-mock.ts의 Topic과 자연스럽게 연결
3. **균등 분배**: 각 카테고리당 3-4개 질문 유지
4. **사용자 경험**: 질문 검색 시 직관적으로 찾을 수 있도록 배치
