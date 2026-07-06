# SEMISENSE · 반도체 마켓 인텔리전스

SK하이닉스·삼성전자 DS부문 사업기획/경영기획 실무자를 위한 시장·경쟁·자사 센싱 대시보드.

## 로컬에서 실행
```
npm install
npm run dev
```

## 데이터 수정 방법
`src/App.jsx` 파일 상단의 데이터 상수들을 수정하면 됩니다:
- `MARKET_5Y`, `MARKET_Q` — 시장 규모 (연간/분기)
- `VENDORS_2025` — 벤더 순위 트리맵
- `SHARE_BARS` — D램/HBM/낸드 점유율
- `SKH_5Y`, `SKH_Q25`, `SDS_5Y`, `SDS_Q25` — 회사 실적
- `NEWS_KR`, `NEWS_GL`, `NEWS_TIMELINE` — 뉴스
- `SOURCES` — 출처 링크
- `FX_YEARS` — 연도별 환율

## 자비스 챗봇
현재는 데모(시뮬레이션) 모드. 정식 버전에서 Gemini API를 서버리스 함수로 연동 예정
(`jarvisSimReply` 함수와 `send` 함수 참조).

## 기준일
2026.07.06
