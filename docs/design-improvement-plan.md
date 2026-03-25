# Design Improvement Plan (Drug Cross-Reactivity)

## 1) UX 목표
- 임상 의사결정에서 **오해를 줄이는 UI**: 색상만 의존하지 않고 텍스트/배지 병행
- 데이터 신뢰성 강조: `근거등급`, `마지막 검토일`, `Unknown(근거 부족)` 명시
- 데스크탑/모바일 모두에서 빠른 탐색(검색→선택→근거 확인)

## 2) 우선 개선 항목 (P0 → P2)

### P0 (즉시)
- SidePanel 정보 구조 재배치:
  1. 약물 요약 2. 위험 연결 3. 근거 링크 4. 대안
- `Safe alternatives` 문구를 `No known cross-reactivity (not guarantee)`로 변경
- 위험도 배지 표준화: High / Disputed / Moderate / Low + 텍스트 아이콘

### P1
- 필터 UX 개선: class/risk 필터를 섹션별 접힘(accordion)로 정리
- DB 신선도 표시 강화: 상단 날짜 + 툴팁(업데이트 방식 설명)
- 노드 선택 시 패널 내 핵심 근거 상단 고정 (top 3 refs)

### P2
- 모바일 전용 레이아웃: SidePanel → bottom sheet
- 접근성 개선: 대비(AA), 키보드 포커스 스타일, 클릭 영역 40px+

## 3) Figma 권장 구조
- Page 1: Foundations (color, type, spacing, radius, shadow)
- Page 2: Components (Badge, Card, Panel, Filter item, Tooltip)
- Page 3: Screens (Default / Selected / Filtered / Mobile)
- Page 4: States (Empty, Unknown, Dense graph, Error)

### 핵심 컴포넌트
- `RiskBadge` (4 variants)
- `EvidenceChip` (PMID/DOI)
- `DrugSummaryCard`
- `AlternativeListGroup`
- `StatusMeta` (DB update/monitoring info)

## 4) frontend-mcp 활용 방식
1. Figma 토큰/컴포넌트 정의 후 이름 고정
2. frontend-mcp로 현재 코드와 디자인 diff 확인
3. 반복 UI(배지/카드/패널)부터 토큰 기반으로 교체
4. 각 PR에서 시각 변경 + 임상 문구 변경을 분리

## 5) 구현 순서 (권장)
1. 토큰 파일 도입 (`src/styles/tokens.ts`)
2. `RiskBadge`, `StatusMeta` 공통 컴포넌트 생성
3. `SidePanel` 정보 계층 재정렬
4. `FilterPanel` 접근성/가독성 개선
5. 모바일 레이아웃 개선

## 6) 완료 기준
- 사용자가 3클릭 내에 선택 약물의 위험도+근거를 확인 가능
- `Unknown`과 `Safe` 의미가 혼동되지 않음
- 디자인 변경 후 `npm run build` 통과 + 주요 흐름 수동 QA 완료
