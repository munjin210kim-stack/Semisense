import React, { useState, useRef, useEffect } from "react";
import {
  BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Treemap, LabelList, Legend, PieChart, Pie,
} from "recharts";

/* ══════════════════════════════ DATA (기준일: 2026.07.06) ══════════════════════════════ */

const MARKET_5Y = [
  { year: "2021", value: 555.9 },
  { year: "2022", value: 574.1 },
  { year: "2023", value: 526.9 },
  { year: "2024", value: 630.5 },
  { year: "2025", value: 791.7 },
  { year: "2026E", value: 975.0, forecast: true },
];

const SEGMENTS_2025 = {
  total: 791.7,
  system: { label: "시스템 반도체 (로직·아날로그 등)", value: 568.6, sub: "로직 $301.9B (+39.9%)" },
  memory: {
    label: "메모리 반도체", value: 223.1, yoy: "+34.8%",
    dram: { label: "D램", value: 156, note: "HBM $30B+ (D램의 23%)" },
    nand: { label: "낸드", value: 60, note: "eSSD 수요 견인" },
  },
};

const REGION_2025 = [
  { name: "아시아·태평양", yoy: "+45.4%" },
  { name: "미주", yoy: "+31.4%" },
  { name: "중국", yoy: "+17.9%" },
  { name: "유럽", yoy: "+6.7%" },
  { name: "일본", yoy: "-4.3%" },
];

const VENDORS_2025 = [
  { name: "NVIDIA", value: 126, yoy: "+63.9%", color: "#3FD68F", est: false },
  { name: "삼성전자", value: 73, yoy: "+11.3%", color: "#6C9BFF", est: false },
  { name: "SK하이닉스", value: 61, yoy: "+37.0%", color: "#52E0F0", est: false },
  { name: "Intel", value: 47.6, yoy: "-4%", color: "#5A6B8C", est: true },
  { name: "Broadcom", value: 46, yoy: "+30%", color: "#9D8CFF", est: true },
  { name: "Micron", value: 44, yoy: "+45%", color: "#FF8FA3", est: true },
  { name: "Qualcomm", value: 33, yoy: "+8%", color: "#FFB454", est: true },
  { name: "AMD", value: 30, yoy: "+27%", color: "#F0616D", est: true },
  { name: "Apple", value: 24, yoy: "+10%", color: "#8AA0B8", est: true },
  { name: "TI", value: 17, yoy: "+6%", color: "#7FD0C0", est: true },
  { name: "기타", value: 291, yoy: "", color: "#2A3A5C", est: true },
];

const SHARE_BARS = {
  dram: { title: "D램 점유율 (26.1Q)", src: "Counterpoint", items: [
    { name: "삼성전자", v: 38, c: "#6C9BFF" }, { name: "SK하이닉스", v: 29, c: "#52E0F0" },
    { name: "마이크론", v: 22, c: "#FF8FA3" }, { name: "기타(CXMT 등)", v: 11, c: "#2E4066" } ] },
  hbm: { title: "HBM 점유율 (26.1Q)", src: "Counterpoint", items: [
    { name: "SK하이닉스", v: 58, c: "#52E0F0" }, { name: "삼성전자", v: 21, c: "#6C9BFF" },
    { name: "마이크론", v: 21, c: "#FF8FA3" } ] },
  nand: { title: "낸드 점유율 (26.1Q)", src: "Counterpoint", items: [
    { name: "삼성전자", v: 29, c: "#6C9BFF" }, { name: "SK하이닉스", v: 18, c: "#52E0F0" },
    { name: "키옥시아", v: 14, c: "#FFB454" }, { name: "마이크론", v: 13, c: "#FF8FA3" },
    { name: "WDC", v: 13, c: "#9D8CFF" }, { name: "YMTC", v: 13, c: "#2E4066" } ] },
};

const SKH_5Y = [
  { year: "2021", rev: 42.99, op: 12.41, margin: 28.9 },
  { year: "2022", rev: 44.65, op: 6.81, margin: 15.2 },
  { year: "2023", rev: 32.77, op: -7.73, margin: -23.6 },
  { year: "2024", rev: 66.19, op: 23.47, margin: 35.5 },
  { year: "2025", rev: 97.15, op: 47.21, margin: 48.6 },
];

const SDS_5Y = [
  { year: "2021", rev: 94.2, op: 29.2, margin: 31.0 },
  { year: "2022", rev: 98.5, op: 23.8, margin: 24.2 },
  { year: "2023", rev: 66.6, op: -14.9, margin: -22.4 },
  { year: "2024", rev: 111.1, op: 15.1, margin: 13.6 },
  { year: "2025", rev: 130.1, op: 24.9, margin: 19.1, est: true },
];

const MARKET_Q = [
  { q: "25.1Q", value: 166.7 },
  { q: "25.2Q", value: 179.7 },
  { q: "25.3Q", value: 208.3 },
  { q: "25.4Q", value: 236.6 },
  { q: "26.1Q", value: 298.5 },
];

const SKH_Q25 = [
  { q: "25.1Q", rev: 17.64, op: 7.44 },
  { q: "25.2Q", rev: 22.23, op: 9.21 },
  { q: "25.3Q", rev: 24.45, op: 11.38 },
  { q: "25.4Q", rev: 32.83, op: 19.17 },
  { q: "26.1Q", rev: 52.58, op: 37.61 },
];

const SDS_Q25 = [
  { q: "25.1Q", rev: 25.1, op: 1.1 },
  { q: "25.2Q", rev: 27.9, op: 0.4 },
  { q: "25.3Q", rev: 33.1, op: 7.0 },
  { q: "25.4Q", rev: 44.0, op: 16.4 },
  { q: "26.1Q", rev: 81.7, op: 53.7 },
];

const NEWS_KR = [
  { date: "07.02", url: "https://www.fnnews.com/news/202607041300475345", title: "삼성·SK, 충청권 240조 투자 발표", body: "삼성 온양·천안 HBM 팹 56조, SK하이닉스 청주 M17 낸드·P&T7 첨단 패키징 투자. 후공정 거점을 AI 시대 핵심 기지로 고도화.", tag: "투자" },
  { date: "02.12", url: "https://www.smath.world/insight/hbm4e-sk-1c-20260529-1001/", title: "삼성전자, HBM4 양산 출하 개시", body: "1c D램 + 파운드리 4나노 베이스다이, 11.7Gbps·3.3TB/s. HBM4E 12단 샘플도 출하하며 SK하이닉스 추격 본격화.", tag: "기술" },
  { date: "01.28", url: "https://news.skhynix.co.kr/2025-business-results/", title: "SK하이닉스 2025년 영업익 47.2조 — 삼성 첫 추월", body: "매출 97.1조(+47%), 영업이익률 49%. HBM 매출 전년비 2배. 4분기 영업이익률 58%로 사상 최고.", tag: "실적" },
  { date: "01.29", url: "https://zdnet.co.kr/view/?no=20260129090854", title: "삼성전자, 분기 영업익 20조 첫 돌파", body: "4분기 매출 93.8조·영업익 20.1조. DS부문이 44조/16.4조로 견인. 한국 기업 최초 분기 영업익 20조 돌파.", tag: "실적" },
];

const NEWS_GL = [
  { date: "06.05", url: "https://finance.yahoo.com/sectors/technology/articles/nvidia-certifies-samsung-sk-hynix-133001560.html", title: "Nvidia, 3사 모두 Vera Rubin HBM4 인증 (Bloomberg)", body: "젠슨 황이 삼성·SK하이닉스·마이크론 모두 차세대 Vera Rubin용 HBM4 인증 통과 확인. SK 60~70%, 삼성 25~30% 물량 추정.", tag: "경쟁" },
  { date: "04.16", url: "https://www.cnbc.com/2026/04/16/tsmc-q1-profit-58-percent-ai-chip-demand-record.html", title: "TSMC 1분기 순이익 +58% 사상 최대 (CNBC)", body: "AI 수요가 제조 캐파를 한계까지. 2026 매출 30%+ 성장, CapEx $52~56B 전망. 'sold-out 환경 2026년 내내 지속'.", tag: "실적" },
  { date: "05.18", url: "https://www.trendforce.com/news/2026/05/18/news-memory-supercycle-drives-1q26-price-surge-samsung-flags-146-asp-jump-sk-hynix-sees-mid-60-dram-gains/", title: "삼성 메모리 ASP +146% 급등 (TrendForce)", body: "26.1Q 삼성 메모리 평균판가 2025년 평균 대비 146% 급등. SK D램도 60%대 중반 상승. 서버 D램·eSSD가 주도.", tag: "가격" },
  { date: "01.12", url: "https://www.gartner.com/en/newsroom/press-releases/2026-01-12-gartner-says-worldwide-semiconductor-revenue-grew-21-percent-in-2025", title: "Nvidia, 첫 반도체 매출 $100B 돌파 (Gartner)", body: "2025년 $126B로 1위, 업계 성장 35% 기여. 삼성 $73B, SK하이닉스 $61B. 인텔 6%로 하락.", tag: "경쟁" },
];

const NEWS_TAG_COLORS = {
  "투자": "var(--green)", "정책": "var(--red)", "시장": "var(--blue)",
  "경쟁": "var(--amber)", "가격": "var(--violet)", "실적": "var(--cyan)", "기술": "#7FE9F5",
};

const NEWS_TIMELINE = [
  { date: "2026.07.02", region: "KR", tag: "투자", src: "파이낸셜뉴스", title: "삼성·SK, 충청권 240조 투자 발표",
    body: "삼성전자는 온양·천안 HBM 팹에 56조, SK하이닉스는 청주 M17 낸드와 P&T7 첨단 패키징에 투자. 기존 후공정·소재 거점을 AI 시대 핵심 생산기지로 고도화. 이재용 회장은 '온양 캠퍼스가 범용 반도체 후공정에서 글로벌 최첨단 HBM 팹으로 전환하고 있다'고 언급.",
    url: "https://www.fnnews.com/news/202607041300475345" },
  { date: "2026.06.05", region: "GL", src: "Bloomberg", tag: "경쟁", title: "Nvidia certifies Samsung, SK hynix, Micron for Vera Rubin HBM4",
    body: "젠슨 황이 6월 5일 삼성·SK하이닉스·마이크론 3사 모두 차세대 'Vera Rubin' 플랫폼용 HBM4 인증을 통과했다고 확인. 공급망 분석가들은 SK하이닉스가 Vera Rubin HBM4 물량의 약 60~70%, 삼성 25~30%, 마이크론이 나머지를 차지할 것으로 추정. Rubin은 GTC 타이베이(6/1)에서 발표 후 양산 진입.",
    url: "https://finance.yahoo.com/sectors/technology/articles/nvidia-certifies-samsung-sk-hynix-133001560.html" },
  { date: "2026.04.16", region: "GL", src: "CNBC", tag: "실적", title: "TSMC Q1 profit jumps 58%, hits record on AI chip demand",
    body: "TSMC 1분기 순이익이 전년비 58% 급증하며 사상 최대. AI 수요가 제조 캐파를 한계까지 밀어올림. 2026년 연간 매출 30%+ 성장, CapEx $52~56B 전망. Counterpoint는 '수요가 공급을 크게 상회하는 sold-out 환경이 2026년 내내 지속될 것'으로 진단.",
    url: "https://www.cnbc.com/2026/04/16/tsmc-q1-profit-58-percent-ai-chip-demand-record.html" },
  { date: "2026.06.09", region: "KR", tag: "경쟁", src: "CEO스코어데일리", title: "젠슨 황 방한 마무리 — 삼성 전영현과 HBM4E·HBM5 협의",
    body: "엔비디아 젠슨 황 CEO가 4박 5일 방한을 마치고 출국. SK를 'AI 인프라 파트너'로 격상시키고 'SK하이닉스는 가장 큰 메모리 파트너'라 강조하는 한편, 마지막 일정으로 삼성 전영현 DS부문장과 회동해 HBM4E·파운드리·HBM5 장기 협력 논의. 업계는 삼성·SK 경쟁을 활용해 최대 공급을 이끌어내려는 '3각 밀당' 전략으로 해석.",
    url: "https://www.ceoscoredaily.com/page/view/2026060915144331549" },
  { date: "2026.06.07", region: "KR", tag: "경쟁", src: "MBC", title: "젠슨 황·최태원 '2차 깐부 회동' — HBM 추가 공급 요청",
    body: "젠슨 황이 최태원 SK그룹 회장과 삼성동 치킨집에서 회동. SK하이닉스·SK텔레콤 사장도 참석. 황 CEO는 'HBM을 더 달라'며 추가 공급을 요청. 방한 기간 현대차(자율주행·로보틱스), LG(데이터센터·로봇), 네이버(클라우드) 등과도 연쇄 협력 논의.",
    url: "https://imnews.imbc.com/replay/2026/nwdesk/article/6828355_37004.html" },
  { date: "2026.06.05", region: "GL", src: "SIA", tag: "시장", title: "Global chip sales hit $110.5B in April, up 93.9% YoY",
    body: "미국반도체산업협회(SIA) 집계 2026년 4월 글로벌 매출이 전년비 93.9% 급증. 1분기 $298.5B(+25% QoQ). 연간 $1조 돌파가 기정사실화, 일부는 $1.5조까지 전망. AI 데이터센터·컴퓨팅 세그먼트가 성장 견인.",
    url: "https://www.semiconductors.org/policies/tax/market-data/?type=post" },
  { date: "2026.05.18", region: "GL", src: "TrendForce", tag: "가격", title: "Memory supercycle: Samsung flags 146% ASP jump in Q1",
    body: "TrendForce 보도: 26.1Q 삼성 메모리 평균판가가 2025년 연평균 대비 약 146% 급등(D램·낸드 합산). SK하이닉스 D램도 60%대 중반 상승. 서버 D램·엔터프라이즈 SSD가 가격 상승 주도. 스마트폰·노트북 2026 출하 전망은 하향.",
    url: "https://www.trendforce.com/news/2026/05/18/news-memory-supercycle-drives-1q26-price-surge-samsung-flags-146-asp-jump-sk-hynix-sees-mid-60-dram-gains/" },
  { date: "2025.12.29", region: "GL", src: "Bloomberg", tag: "기술", title: "Nvidia's 16-layer HBM push raises stakes for memory makers",
    body: "블룸버그: 엔비디아가 2026년 말 납품을 목표로 16단 HBM에 관심을 타진하며 삼성·SK하이닉스·마이크론을 차세대 개발 경쟁으로 몰아넣음. 계약은 아직 없으나 개발 일정·수율·초도 물량 내부 계획을 촉발. 근시일은 여전히 HBM3E 중심(2026년 HBM 출하의 66% 전망).",
    url: "https://www.koreaherald.com/article/10645471" },
  { date: "2026.04.30", region: "KR", tag: "실적", src: "삼성전자 뉴스룸", title: "삼성전자 26.1Q 영업익 57.2조 — DS 단독 53.7조",
    body: "전사 매출 133.9조, 영업이익 57.2조(전년비 +756%)로 역대 최대 분기 실적. DS부문이 매출 81.7조·영업익 53.7조(OPM 66%)로 견인. HBM4·SOCAMM2 양산, HBM4 완판, 하이퍼스케일러들과 3~5년 장기공급계약(LTA) 논의. 2027년 수요까지 선접수.",
    url: "https://news.samsungsemiconductor.com/kr/%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90-2026%EB%85%84-1%EB%B6%84%EA%B8%B0-%EC%8B%A4%EC%A0%81-%EB%B0%9C%ED%91%9C/" },
  { date: "2026.04.23", region: "KR", tag: "실적", src: "SK하이닉스 뉴스룸", title: "SK하이닉스 26.1Q 영업익 37.6조 — OPM 72%로 TSMC 압도",
    body: "매출 52.58조(사상 첫 분기 50조 돌파)·영업이익 37.61조·순이익 40.35조. 영업이익률 72%로 TSMC(58.1%)를 압도하며 창사 이래 최고. 순현금 35조 달성. HBM·고용량 서버 D램·eSSD가 실적 견인. 맥쿼리는 연간 영업익 272조를 전망.",
    url: "https://news.skhynix.co.kr/q1-2026-business-results/" },
  { date: "2026.02.12", region: "KR", tag: "기술", src: "SMATh World", title: "삼성전자, HBM4 세계 최초 양산 출하 (11.7Gbps)",
    body: "1c D램과 파운드리 4나노 베이스다이를 결합한 HBM4를 세계 최초로 양산 출하. 11.7Gbps 동작 속도, 3.3TB/s 대역폭으로 HBM3E 대비 최대 2.7배 향상. 엔비디아 차세대 '베라 루빈' 플랫폼 공급 시작. 삼성은 2026년 HBM 매출이 전년비 3배 이상 증가할 것으로 전망.",
    url: "https://www.smath.world/insight/hbm4e-sk-1c-20260529-1001/" },
  { date: "2026.01.28", region: "KR", tag: "실적", src: "SK하이닉스 뉴스룸", title: "SK하이닉스 2025년 영업익 47.2조 — 삼성 첫 추월",
    body: "2025년 연간 매출 97.1조(+47%), 영업이익 47.2조(OPM 49%)로 사상 최대. 영업이익에서 삼성전자를 처음으로 추월. HBM 매출이 전년비 2배 성장하며 실적 견인. 4분기 영업이익률은 58%로 분기 최고치 경신.",
    url: "https://news.skhynix.co.kr/2025-business-results/" },
  { date: "2026.01.12", region: "GL", src: "Gartner", tag: "경쟁", title: "Nvidia becomes first chip vendor to cross $100B in sales",
    body: "Gartner 집계 2025년 반도체 매출에서 엔비디아가 $126B(+63.9%)로 1위, 업계 성장의 35% 이상 기여. 삼성 $73B(2위), SK하이닉스 $61B(+37%, 3위). 인텔 점유율은 6%로 2021년의 절반 수준으로 하락. 2026년 AI 인프라 투자는 $1.3조 초과 전망.",
    url: "https://www.gartner.com/en/newsroom/press-releases/2026-01-12-gartner-says-worldwide-semiconductor-revenue-grew-21-percent-in-2025" },
  { date: "2026.01.02", region: "GL", src: "Reuters", tag: "경쟁", title: "'Samsung is back': customers praise HBM4, CEO tells Reuters",
    body: "로이터: 삼성 전영현 부회장이 신년사에서 'HBM4에 대해 고객들이 삼성이 돌아왔다고 평가했다'고 언급. SK하이닉스 곽노정 CEO는 'AI 수요는 이제 상수(常數)이며 2026년 경쟁은 더 치열해질 것'이라 진단. Counterpoint 3Q25 HBM 점유율 SK 53%/삼성 35%/마이크론 11%.",
    url: "https://finance.yahoo.com/news/samsung-electronics-highlights-progress-hbm4-000428574.html" },
];

const BRIEFING = {
  date: "2026.07.06 (월)",
  headline: "메모리 슈퍼사이클 정점 구간 — 2026년 시장 $1조 돌파 확실시",
  points: [
    "AI 데이터센터 수요로 D램·낸드 동반 급등. 26.1Q 시장 +25% QoQ, 4월 매출 전년비 +93.9%",
    "HBM4 패권전 본격화: SK하이닉스 선점(점유율 58%) vs 삼성 1c 기반 양산 추격",
    "리스크: 메모리 가격 조정 가능성, CXMT 등 중국 D램 추격, 관세·지정학 변수",
  ],
};

/* ══════════════════════════════ JARVIS SYSTEM PROMPT ══════════════════════════════ */

/* ── JARVIS 시뮬레이션 응답 엔진 (배포 데모용 · 정식판은 Gemini API 연동 예정) ── */
const JARVIS_KB = [
  { keys: ["hbm", "경쟁", "구도", "점유"], reply:
`네, HBM 경쟁 구도를 정리해 드리겠습니다.

• 26.1Q HBM 점유율: SK하이닉스 58% · 삼성 21% · 마이크론 21% (Counterpoint)
• SK하이닉스가 HBM3E+HBM4 동시 양산 가능한 유일 기업으로 리더십 유지
• 삼성은 26.2월 HBM4 세계 최초 양산 출하(11.7Gbps)로 추격, 엔비디아 'Vera Rubin'용 인증 통과
• UBS는 HBM4 세대에서도 SK하이닉스 약 70% 점유를 전망합니다

추가로 세대별 로드맵(HBM4E·HBM5)이나 고객사 공급 현황도 분석해 드릴까요?` },
  { keys: ["vs", "비교", "삼성", "하이닉스", "누가"], reply:
`SK하이닉스와 삼성전자 DS부문 26.1Q 실적을 비교해 드리겠습니다.

• SK하이닉스: 매출 52.58조 / 영업익 37.61조 / OPM 72%
• 삼성 DS: 매출 81.7조 / 영업익 53.7조 / OPM 66%

매출 규모는 삼성 DS가 크지만(시스템LSI·파운드리 포함), 수익성(OPM)은 SK하이닉스가 앞섭니다. SK하이닉스의 72%는 TSMC(58.1%)를 압도하는 수치입니다. 2025년 연간 기준으로는 SK하이닉스가 삼성 전사 영업익을 처음 추월했습니다.

특정 지표(제품 믹스, HBM 비중 등)로 더 파고들까요?` },
  { keys: ["리스크", "위험", "하반기", "전망", "우려"], reply:
`2026년 하반기 주요 리스크를 짚어 드리겠습니다.

• 가격 조정 가능성: 메모리 ASP가 급등(삼성 +146%)한 만큼, 하반기 조정 국면 진입 우려
• 중국 추격: CXMT(D램)·YMTC(낸드)가 DDR5 전환하며 점유율 확대
• 통상 리스크: 미국 관세, D램 담합 집단소송(6/30 피소) 등 규제 변수
• 전방 수요: 메모리 가격 급등이 스마트폰·PC 수요를 압박(TrendForce 출하 전망 하향)

다만 고성능 HBM은 기술 격차가 있어 단기 구도 급변 가능성은 낮다는 분석이 우세합니다. 특정 리스크를 깊게 볼까요?` },
  { keys: ["시장", "규모", "글로벌", "성장", "전체"], reply:
`글로벌 반도체 시장 현황입니다.

• 2025년: $791.7B (+25.6% YoY, SIA)
• 2026년 전망: $975B~$1조 (WSTS), 일부는 $1.5조까지 제시
• 26.1Q: $298.5B (+25% QoQ), 4월 월매출 $110.5B (+93.9% YoY)
• 2025 세그먼트: 로직 $301.9B(+39.9%), 메모리 $223.1B(+34.8%), HBM $30B+

AI 데이터센터 수요가 성장을 견인하며, AI 반도체는 2029년 전체의 50%+ 차지 전망입니다. 세그먼트별·지역별로 더 볼까요?` },
  { keys: ["젠슨", "황", "엔비디아", "nvidia", "방한"], reply:
`엔비디아 젠슨 황 CEO 관련 최근 동향입니다.

• 6/5 삼성·SK·마이크론 3사 모두 'Vera Rubin' HBM4 인증 통과 확인 (Bloomberg)
• 방한 중 SK를 'AI 인프라 파트너'로 격상, 'HBM 더 달라' 요청
• 삼성 전영현 부회장과 회동해 HBM4E·HBM5 장기 협력 논의
• 업계는 삼성·SK 경쟁을 활용한 '3각 밀당' 전략으로 해석

Vera Rubin은 각 프로세서에 HBM4 8스택 탑재 예정입니다. 공급 물량 배분 전망도 살펴볼까요?` },
  { keys: ["실적", "영업이익", "매출", "분기"], reply:
`최근 실적 하이라이트입니다.

• SK하이닉스 26.1Q: 매출 52.58조(분기 첫 50조 돌파) / 영업익 37.61조 / OPM 72%
• 삼성 DS 26.1Q: 매출 81.7조 / 영업익 53.7조 / OPM 66%
• 두 회사 모두 5개 분기 연속 실적 개선, AI 메모리 수요가 견인

맥쿼리는 SK하이닉스 2026 연간 영업익을 272조로 전망하고 있습니다. 특정 회사·분기를 자세히 볼까요?` },
];

function jarvisSimReply(text) {
  const t = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const item of JARVIS_KB) {
    const score = item.keys.filter((k) => t.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = item; }
  }
  if (best && bestScore > 0) return best.reply;
  return `좋은 질문입니다. 다만 현재 저는 데모(시뮬레이션) 모드로 작동 중이라, 준비된 핵심 주제 위주로 답변드릴 수 있습니다.

지금 답변 가능한 주제: HBM 경쟁 구도 · SK하이닉스 vs 삼성DS 비교 · 2026 하반기 리스크 · 글로벌 시장 규모 · 젠슨 황/엔비디아 동향 · 최근 실적

정식 버전에서는 실시간 데이터 기반의 자유로운 분석을 제공할 예정입니다. 위 주제 중 하나를 물어봐 주시겠습니까?`;
}

const JARVIS_SYSTEM = `당신은 'JARVIS'입니다.`;

/* ══════════════════════════════ STYLES ══════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root {
  --bg:#0A101E; --panel:#101A30; --panel2:#16233F; --line:#223252; --line2:#2C3F63;
  --ink:#EAF0FB; --mut:#93A3C0; --dim:#5F7093;
  --cyan:#52E0F0; --blue:#6C9BFF; --amber:#FFB454; --green:#3FD68F; --red:#FF6B7A; --violet:#9D8CFF;
}
* { box-sizing: border-box; }
.app {
  min-height: 100vh; background: var(--bg); color: var(--ink);
  font-family: 'IBM Plex Sans KR', sans-serif; font-size: 13px;
  background-image:
    radial-gradient(circle at 15% 0%, rgba(82,224,240,0.05), transparent 40%),
    radial-gradient(circle at 85% 100%, rgba(108,155,255,0.05), transparent 40%),
    linear-gradient(rgba(34,50,82,0.22) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34,50,82,0.22) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 44px 44px, 44px 44px;
}
.mono { font-family: 'IBM Plex Mono', monospace; }
.disp { font-family: 'Space Grotesk', 'IBM Plex Sans KR', sans-serif; }

.card {
  background: linear-gradient(180deg, var(--panel2), var(--panel));
  border: 1px solid var(--line); border-radius: 12px;
  transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}
.card.clickable { cursor: pointer; }
.card.clickable:hover {
  transform: translateY(-2px); border-color: rgba(82,224,240,0.55);
  box-shadow: 0 8px 28px rgba(0,0,0,0.45), 0 0 0 1px rgba(82,224,240,0.18), 0 0 24px rgba(82,224,240,0.07);
}
.newsitem { border: 1px solid transparent; border-radius: 9px; padding: 9px 11px; cursor: pointer;
  transition: background .15s, border-color .15s, transform .15s; }
.newsitem:hover { background: rgba(82,224,240,0.06); border-color: rgba(82,224,240,0.3); transform: translateX(3px); }
.hoverline { transition: background .12s; border-radius: 6px; }
.hoverline:hover { background: rgba(108,155,255,0.10); }

.tag { font-size: 10px; padding: 2px 7px; border-radius: 20px; border: 1px solid var(--line2);
  color: var(--mut); white-space: nowrap; }
.eyebrow { font-size: 10.5px; letter-spacing: 0.4px; font-weight: 600; color: var(--dim); text-transform: uppercase; }
.btn {
  background: var(--panel2); border: 1px solid var(--line2); color: var(--ink);
  border-radius: 8px; padding: 7px 14px; cursor: pointer; font-family: inherit; font-size: 12px;
  transition: all .15s;
}
.btn:hover { border-color: var(--cyan); color: var(--cyan); background: rgba(82,224,240,0.07); }
.srcchip {
  font-size: 9.5px; padding: 2px 8px; border-radius: 20px; border: 1px solid var(--line2);
  color: var(--mut); text-decoration: none; white-space: nowrap; font-family: 'IBM Plex Mono', monospace;
  transition: all .15s; background: rgba(16,26,48,0.5);
}
.srcchip:hover { border-color: var(--cyan); color: var(--cyan); background: rgba(82,224,240,0.08); }

@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.35 } }
.live { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: pulse 1.8s infinite;
  box-shadow: 0 0 8px rgba(63,214,143,0.8); }

/* JARVIS orb */
@keyframes orbspin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
@keyframes orbspin2 { from { transform: rotate(360deg) } to { transform: rotate(0) } }
@keyframes orbglow { 0%,100% { box-shadow: 0 0 16px rgba(82,224,240,.5), inset 0 0 12px rgba(82,224,240,.4) }
  50% { box-shadow: 0 0 30px rgba(82,224,240,.9), inset 0 0 20px rgba(82,224,240,.7) } }
.orb { position: relative; border-radius: 50%; background: radial-gradient(circle at 50% 45%, rgba(226,250,255,.95), rgba(82,224,240,.55) 42%, rgba(16,26,48,.9) 75%);
  animation: orbglow 2.6s ease-in-out infinite; }
.orb.thinking { animation-duration: .9s; }
.orb .ring { position: absolute; inset: -6px; border-radius: 50%; border: 1.5px solid rgba(82,224,240,.5);
  border-top-color: transparent; border-bottom-color: transparent; animation: orbspin 3.2s linear infinite; }
.orb .ring2 { position: absolute; inset: -12px; border-radius: 50%; border: 1px dashed rgba(82,224,240,.28);
  animation: orbspin2 7s linear infinite; }
.orb.thinking .ring { animation-duration: .8s; }

.chatscroll::-webkit-scrollbar, .mainscroll::-webkit-scrollbar { width: 8px; }
.chatscroll::-webkit-scrollbar-thumb, .mainscroll::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 4px; }
.chatscroll::-webkit-scrollbar-track, .mainscroll::-webkit-scrollbar-track { background: transparent; }

.msg-j { background: rgba(82,224,240,0.07); border: 1px solid rgba(82,224,240,0.22); }
.msg-u { background: var(--panel2); border: 1px solid var(--line2); }
.chatinput {
  width: 100%; background: var(--panel); border: 1px solid var(--line2); color: var(--ink);
  border-radius: 10px; padding: 10px 40px 10px 12px; font-family: inherit; font-size: 12.5px; outline: none;
  transition: border-color .15s, box-shadow .15s; resize: none;
}
.chatinput:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(82,224,240,0.12); }
.sendbtn { position: absolute; right: 7px; top: 50%; transform: translateY(-50%);
  background: var(--cyan); border: none; color: #06121F; width: 26px; height: 26px; border-radius: 7px;
  cursor: pointer; font-weight: 700; transition: all .15s; display:flex; align-items:center; justify-content:center; }
.sendbtn:hover { filter: brightness(1.15); transform: translateY(-50%) scale(1.06); }
.sendbtn:disabled { opacity: .35; cursor: default; }

@media (prefers-reduced-motion: reduce) {
  .orb, .orb .ring, .orb .ring2, .live { animation: none; }
  .card, .newsitem { transition: none; }
}
`;

/* ══════════════════════════════ SMALL COMPONENTS ══════════════════════════════ */

/* ── 출처 레지스트리: 실제 원문 링크 ── */
const SOURCES = {
  sia2025: { name: "SIA 2025 연간", url: "https://www.semiconductors.org/global-annual-semiconductor-sales-increase-25-6-to-791-7-billion-in-2025/" },
  siaData: { name: "SIA 월별 데이터", url: "https://www.semiconductors.org/policies/tax/market-data/?type=post" },
  wsts: { name: "WSTS 전망", url: "https://www.wsts.org/esraCMS/extension/media/f/WST/7310/WSTS_FC-Release-2025_11.pdf" },
  gartner: { name: "Gartner 순위", url: "https://www.gartner.com/en/newsroom/press-releases/2026-01-12-gartner-says-worldwide-semiconductor-revenue-grew-21-percent-in-2025" },
  cpDram: { name: "Counterpoint D램/HBM", url: "https://counterpointresearch.com/en/insights/global-dram-and-hbm-market-share" },
  cpNand: { name: "Counterpoint 낸드", url: "https://counterpointresearch.com/en/insights/global-nand-memory-market-share" },
  skh2025: { name: "SK하이닉스 IR('25연간)", url: "https://news.skhynix.co.kr/2025-business-results/" },
  skhQ1: { name: "SK하이닉스 IR(26.1Q)", url: "https://news.skhynix.co.kr/q1-2026-business-results/" },
  ss4Q: { name: "삼성전자 뉴스룸('25.4Q)", url: "https://news.samsung.com/kr/%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90-2025%EB%85%84-4%EB%B6%84%EA%B8%B0-%EC%8B%A4%EC%A0%81-%EB%B0%9C%ED%91%9C" },
  ssQ1: { name: "삼성전자 뉴스룸(26.1Q)", url: "https://news.samsungsemiconductor.com/kr/%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90-2026%EB%85%84-1%EB%B6%84%EA%B8%B0-%EC%8B%A4%EC%A0%81-%EB%B0%9C%ED%91%9C/" },
  tfAsp: { name: "TrendForce(ASP)", url: "https://www.trendforce.com/news/2026/05/18/news-memory-supercycle-drives-1q26-price-surge-samsung-flags-146-asp-jump-sk-hynix-sees-mid-60-dram-gains/" },
  deloitte: { name: "Deloitte 2026 전망", url: "https://www.deloitte.com/us/en/insights/industry/technology/technology-media-telecom-outlooks/semiconductor-industry-outlook.html" },
  irsFx: { name: "IRS 연평균 환율", url: "https://www.irs.gov/ko/individuals/international-taxpayers/yearly-average-currency-exchange-rates" },
  bofa: { name: "SK하이닉스 뉴스룸('26 전망)", url: "https://news.skhynix.co.kr/2026-market-outlook/" },
};

function SrcChips({ ids, align }) {
  return (
    <span style={{ display: "inline-flex", gap: 5, flexWrap: "wrap", justifyContent: align === "right" ? "flex-end" : "flex-start" }}
      onClick={(e) => e.stopPropagation()}>
      {ids.map((id) => SOURCES[id] && (
        <a key={id} href={SOURCES[id].url} target="_blank" rel="noopener noreferrer" className="srcchip">
          {SOURCES[id].name} ↗
        </a>
      ))}
    </span>
  );
}

const fmtB = (v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;
const fmtT = (v) => `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}조`;

/* ── 단위 시스템: 자동(차트별 기본) / $B / 조원 ──
   환율: 연도별 평균환율 적용 (2021~2025 IRS 연평균, 2026은 상반기 추정치) */
const FX_YEARS = { 2021: 1144.9, 2022: 1291.7, 2023: 1306.7, 2024: 1364.2, 2025: 1421.8, 2026: 1480 };
const fxOf = (y) => FX_YEARS[y] || FX_YEARS[2026];
const yearOf = (s) => {
  const m = String(s).match(/\d+/);
  if (!m) return 2026;
  const n = parseInt(m[0], 10);
  return n < 100 ? 2000 + n : n;
};
const UnitCtx = React.createContext("auto");
const effCurr = (curr, native) => (curr === "auto" ? native : curr);
const convB = (v, c, y = 2025) => (c === "krw" ? Math.round((v * fxOf(y)) / 100) / 10 : v); // $B → 표시값
const convT = (v, c, y = 2025) => (c === "usd" ? Math.round((v * 10000) / fxOf(y)) / 10 : v); // 조원 → 표시값
const fmtBy = (v, c) => (c === "usd"
  ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 1 })}B`
  : `${v.toLocaleString(undefined, { maximumFractionDigits: 1 })}조`);
const uLabel = (c) => (c === "usd" ? "$B" : "조원");
const fxNote = (c, native) => (c !== native ? " · 연도별 평균환율 환산('26은 추정)" : "");

function ChartTip({ active, payload, label, c }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#0C1526", border: "1px solid var(--line2)", borderRadius: 8, padding: "8px 11px", fontSize: 12 }}>
      <div className="mono" style={{ color: "var(--mut)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "var(--ink)" }}>
          {p.name}: <b>{String(p.name).includes("OPM") ? `${p.value}%` : fmtBy(p.value, c || "usd")}</b>
        </div>
      ))}
    </div>
  );
}

function BoardHead({ kicker, title, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
      <div>
        <div className="eyebrow" style={{ color: accent, marginBottom: 3 }}>{kicker}</div>
        <div className="disp" style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
      </div>
    </div>
  );
}

function ShareBar({ data }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11.5, color: "var(--mut)", fontWeight: 600 }}>{data.title}</span>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--dim)" }}>{data.src}</span>
      </div>
      <div style={{ display: "flex", height: 22, borderRadius: 6, overflow: "hidden", border: "1px solid var(--line)" }}>
        {data.items.map((it, i) => (
          <div key={i}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ width: `${it.v}%`, background: it.c, opacity: hov === null || hov === i ? 1 : 0.35,
              transition: "opacity .15s, filter .15s", filter: hov === i ? "brightness(1.2)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>
            {it.v >= 12 && <span className="mono" style={{ fontSize: 9.5, color: "#06121F", fontWeight: 700 }}>{it.v}%</span>}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginTop: 5 }}>
        {data.items.map((it, i) => (
          <span key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ fontSize: 10, color: hov === i ? "var(--ink)" : "var(--mut)", cursor: "default", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: it.c, display: "inline-block" }} />
            {it.name} {it.v}%
          </span>
        ))}
      </div>
    </div>
  );
}

function TreemapCell(props) {
  const { x, y, width, height, name, value, fill } = props;
  if (width < 4 || height < 4) return null;
  const nameStr = name == null ? "" : String(name);
  if (!nameStr) return null; // 루트/이름 없는 노드는 렌더링 안 함
  const pad = 6;
  const fs = width > 60 && height > 44 ? 11 : 9; // 셀 크기에 따라 폰트 축소
  const lineH = fs + 2.5;
  const charW = (ch) => (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(ch) ? fs * 1.0 : fs * 0.62);
  // 이름을 셀 폭에 맞춰 여러 줄로 분할
  const wrap = (text, maxW) => {
    const lines = [];
    let cur = "", curW = 0;
    for (const ch of text) {
      const w = charW(ch);
      if (curW + w > maxW && cur) { lines.push(cur); cur = ch; curW = w; }
      else { cur += ch; curW += w; }
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const maxW = width - pad * 2;
  const showText = width >= 26 && height >= 16 && maxW >= fs;
  let nameLines = showText ? wrap(nameStr, maxW) : [];
  const maxLines = Math.max(0, Math.floor((height - pad) / lineH));
  const showVal = props.disp && nameLines.length + 1 <= maxLines && (props.disp.length * fs * 0.62) <= maxW;
  if (nameLines.length > maxLines) nameLines = nameLines.slice(0, maxLines);
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4}
        style={{ fill, stroke: "#0A101E", strokeWidth: 2.5, transition: "opacity .15s", cursor: "default" }}
        onMouseEnter={(e) => (e.target.style.opacity = 0.78)}
        onMouseLeave={(e) => (e.target.style.opacity = 1)} />
      {nameLines.map((ln, i) => (
        <text key={i} x={x + pad} y={y + pad + fs - 1 + i * lineH} fill="#06121F" fontSize={fs} fontWeight={700}
          fontFamily="'IBM Plex Sans KR',sans-serif" pointerEvents="none">{ln}</text>
      ))}
      {showVal && (
        <text x={x + pad} y={y + pad + fs - 1 + nameLines.length * lineH} fill="rgba(6,18,31,0.72)"
          fontSize={fs - 1} fontWeight={600}
          fontFamily="'IBM Plex Mono',monospace" pointerEvents="none">{props.disp}</text>
      )}
    </g>
  );
}

function NewsList({ items, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {items.map((n, i) => (
        <div key={i} className="newsitem" style={{ padding: "4px 8px" }}
          onClick={(e) => { e.stopPropagation(); n.url && window.open(n.url, "_blank", "noopener"); }} title={`${n.body}\n\n클릭 → 원문 보기`}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
            <span className="mono" style={{ fontSize: 9.5, color: "var(--cyan)", flexShrink: 0 }}>{n.date}</span>
            <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden",
              textOverflow: "ellipsis", minWidth: 0, flex: 1 }}>{n.title} <span style={{ color: "var(--dim)", fontSize: 10 }}>↗</span></span>
            <span className="tag" style={{ flexShrink: 0, fontSize: 9, padding: "1px 6px" }}>{n.tag}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════ JARVIS CHAT ══════════════════════════════ */

function JarvisPanel({ open, setOpen }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "안녕하십니까. 반도체 마켓 인텔리전스 에이전트 JARVIS입니다. 시장·경쟁·자사 데이터는 2026년 7월 6일 기준으로 준비되어 있습니다.\n\n현재는 데모 모드로, 핵심 주제(HBM 경쟁·실적 비교·리스크·시장 규모·엔비디아 동향)에 답변드립니다. 아래 버튼을 눌러보시거나 직접 질문해 주십시오." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  const send = async (override) => {
    const text = (override != null ? override : input).trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    // 데모 모드: 준비된 지식베이스에서 응답 (정식판은 Gemini API 연동 예정)
    const reply = jarvisSimReply(text);
    const delay = 700 + Math.min(reply.length * 6, 1400); // 분석하는 느낌의 지연
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      setLoading(false);
    }, delay);
  };

  if (!open) {
    return (
      <div style={{ width: 56, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 18, gap: 12, borderLeft: "1px solid var(--line)" }}>
        <div className="orb" style={{ width: 34, height: 34, cursor: "pointer" }} onClick={() => setOpen(true)}
          title="JARVIS 열기">
          <div className="ring" /><div className="ring2" />
        </div>
        <div onClick={() => setOpen(true)} style={{ cursor: "pointer", textAlign: "center", lineHeight: 1.5 }}>
          <div className="mono" style={{ fontSize: 9.5, fontWeight: 600, color: "var(--cyan)" }}>JARVIS</div>
          <div className="mono" style={{ fontSize: 8.5, color: "var(--dim)" }}>CLICK</div>
          <div className="mono" style={{ fontSize: 8.5, color: "var(--dim)" }}>TO</div>
          <div className="mono" style={{ fontSize: 8.5, color: "var(--dim)" }}>OPEN</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: 352, flexShrink: 0, borderLeft: "1px solid var(--line)", display: "flex",
      flexDirection: "column", height: "100vh", position: "sticky", top: 0,
      background: "linear-gradient(180deg, rgba(16,26,48,0.6), rgba(10,16,30,0.9))" }}>
      {/* head */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
        <div className={`orb ${loading ? "thinking" : ""}`} style={{ width: 38, height: 38 }}>
          <div className="ring" /><div className="ring2" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="disp" style={{ fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>J.A.R.V.I.S</div>
          <div className="mono" style={{ fontSize: 9.5, color: loading ? "var(--cyan)" : "var(--dim)" }}>
            {loading ? "ANALYZING…" : "SEMICONDUCTOR INTELLIGENCE · DEMO"}
          </div>
        </div>
        <button className="btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setOpen(false)}>숨기기</button>
      </div>
      {/* messages */}
      <div ref={scrollRef} className="chatscroll" style={{ flex: 1, overflowY: "auto", padding: 14,
        display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 8, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            {m.role === "assistant" && (
              <div className="orb" style={{ width: 20, height: 20, flexShrink: 0, marginTop: 3, animation: "none",
                boxShadow: "0 0 8px rgba(82,224,240,.4)" }} />
            )}
            <div className={m.role === "assistant" ? "msg-j" : "msg-u"}
              style={{ borderRadius: 11, padding: "9px 12px", maxWidth: "85%", fontSize: 12.5,
                lineHeight: 1.62, whiteSpace: "pre-wrap" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8 }}>
            <div className="orb thinking" style={{ width: 20, height: 20, flexShrink: 0, marginTop: 3 }} />
            <div className="msg-j mono" style={{ borderRadius: 11, padding: "9px 12px", fontSize: 11, color: "var(--cyan)" }}>
              데이터 스트림 분석 중…
            </div>
          </div>
        )}
      </div>
      {/* quick prompts */}
      <div style={{ padding: "0 14px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["HBM 경쟁구도 요약", "SK하이닉스 vs 삼성DS 비교", "2026 하반기 리스크는?"].map((q) => (
          <button key={q} className="btn" style={{ fontSize: 10.5, padding: "4px 9px", borderRadius: 20 }}
            onClick={() => send(q)}>{q}</button>
        ))}
      </div>
      {/* input */}
      <div style={{ padding: "0 14px 16px", position: "relative" }}>
        <textarea className="chatinput" rows={2} value={input} placeholder="반도체 시장·경쟁·자사에 대해 물어보세요…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button className="sendbtn" onClick={send} disabled={loading || !input.trim()} title="전송">▶</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════ MAIN BOARDS ══════════════════════════════ */

function MarketBoard({ goDetail }) {
  const [segHov, setSegHov] = useState(null);
  const curr = React.useContext(UnitCtx);
  const c = effCurr(curr, "usd");
  const seg = SEGMENTS_2025;
  const memPct = (seg.memory.value / seg.total) * 100;
  const m5 = MARKET_5Y.map((d) => ({ ...d, value: convB(d.value, c, yearOf(d.year)) }));
  const mq = MARKET_Q.map((d) => ({ ...d, value: convB(d.value, c, yearOf(d.q)) }));
  return (
    <div className="card clickable" style={{ padding: 18 }} onClick={() => goDetail("market")}>
      <BoardHead kicker="MARKET" title="글로벌 반도체 시장" accent="var(--blue)" onMore />
      {/* 5yr bar */}
      <div className="mono" style={{ fontSize: 10.5, color: "var(--mut)", marginBottom: 4 }}>연간 시장규모 (단위: {uLabel(c)} · SIA/WSTS{fxNote(c, "usd")})</div>
      <div style={{ height: 190 }} onClick={(e) => e.stopPropagation()}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={m5} margin={{ top: 18, right: 6, left: -14, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: "var(--mut)", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
            <YAxis tick={{ fill: "var(--dim)", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTip c={c} />} cursor={{ fill: "rgba(108,155,255,0.07)" }} />
            <Bar dataKey="value" name={`시장규모(${uLabel(c)})`} radius={[5, 5, 0, 0]}>
              <LabelList dataKey="value" position="top" style={{ fill: "var(--mut)", fontSize: 9.5, fontFamily: "IBM Plex Mono" }} formatter={(v) => Math.round(v)} />
              {m5.map((d, i) => (
                <Cell key={i} fill={d.forecast ? "rgba(108,155,255,0.28)" : "var(--blue)"}
                  stroke={d.forecast ? "var(--blue)" : "none"} strokeDasharray={d.forecast ? "4 3" : "0"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* segment split */}
      <div className="mono" style={{ fontSize: 10.5, color: "var(--mut)", margin: "14px 0 5px" }}>2025 시장 구성 — 시스템 vs 메모리 (단위: {uLabel(c)})</div>
      <div style={{ display: "flex", height: 30, borderRadius: 7, overflow: "hidden", border: "1px solid var(--line)" }}>
        <div onMouseEnter={() => setSegHov("sys")} onMouseLeave={() => setSegHov(null)}
          style={{ width: `${100 - memPct}%`, background: "linear-gradient(180deg,#6C9BFF,#4A76D8)",
            display: "flex", alignItems: "center", paddingLeft: 10, transition: "filter .15s",
            filter: segHov === "sys" ? "brightness(1.15)" : "none" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#06121F" }}>시스템 {fmtBy(convB(seg.system.value, c), c)}</span>
        </div>
        <div onMouseEnter={() => setSegHov("mem")} onMouseLeave={() => setSegHov(null)}
          style={{ width: `${memPct}%`, background: "linear-gradient(180deg,#9D8CFF,#7B69E8)",
            display: "flex", alignItems: "center", paddingLeft: 10, transition: "filter .15s",
            filter: segHov === "mem" ? "brightness(1.15)" : "none" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#06121F" }}>메모리 {fmtBy(convB(seg.memory.value, c), c)}</span>
        </div>
      </div>
      {/* memory sub */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {[seg.memory.dram, seg.memory.nand].map((m, i) => (
          <div key={i} className="hoverline" style={{ flex: m.value, border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--violet)" }}>{m.label}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink)" }}>≈{fmtBy(convB(m.value, c), c)}</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 2 }}>{m.note}</div>
          </div>
        ))}
      </div>
      {/* quarterly momentum */}
      <div className="mono" style={{ fontSize: 10.5, color: "var(--mut)", margin: "14px 0 4px" }}>분기 모멘텀 — 슈퍼사이클 가속 (단위: {uLabel(c)})</div>
      <div style={{ height: 120 }} onClick={(e) => e.stopPropagation()}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mq} margin={{ top: 16, right: 6, left: -14, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="q" tick={{ fill: "var(--mut)", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
            <YAxis tick={{ fill: "var(--dim)", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} domain={[0, c === "krw" ? 450 : 320]} />
            <Tooltip content={<ChartTip c={c} />} cursor={{ fill: "rgba(63,214,143,0.07)" }} />
            <Bar dataKey="value" name={`분기 매출(${uLabel(c)})`} radius={[4, 4, 0, 0]}>
              <LabelList dataKey="value" position="top" style={{ fill: "var(--mut)", fontSize: 9, fontFamily: "IBM Plex Mono" }} formatter={(v) => Math.round(v)} />
              {mq.map((d, i) => (
                <Cell key={i} fill={i === mq.length - 1 ? "var(--green)" : "rgba(63,214,143,0.45)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* region growth */}
      <div className="mono" style={{ fontSize: 10.5, color: "var(--mut)", margin: "12px 0 5px" }}>2025 지역별 성장률</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {REGION_2025.map((r, i) => (
          <div key={i} className="hoverline" style={{ border: "1px solid var(--line)", borderRadius: 7, padding: "5px 9px", flex: "1 1 auto", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "var(--dim)" }}>{r.name}</div>
            <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: r.yoy.startsWith("-") ? "var(--red)" : "var(--green)" }}>{r.yoy}</div>
          </div>
        ))}
      </div>
      {/* key stats */}
      <div style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 12px" }}>
        {[
          ["26.1Q 시장", "$298.5B (+25% QoQ)"],
          ["4월 월매출", "$110.5B (+93.9% YoY)"],
          ["2025 로직", "$301.9B (+39.9%)"],
          ["2025 메모리", "$223.1B (+34.8%)"],
          ["HBM 시장", "$30B+ → '26E $54.6B"],
          ["2026 전망", "$975B~1조 (WSTS)"],
        ].map(([k, v], i) => (
          <div key={i} className="hoverline" style={{ padding: "3px 6px" }}>
            <div className="mono" style={{ fontSize: 9.5, color: "var(--dim)" }}>{k}</div>
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitorBoard({ goDetail }) {
  const top = VENDORS_2025.slice(0, 6);
  const curr = React.useContext(UnitCtx);
  const c = effCurr(curr, "usd");
  return (
    <div className="card clickable" style={{ padding: 18 }} onClick={() => goDetail("competitor")}>
      <BoardHead kicker="COMPETITOR" title="경쟁 구도" accent="var(--amber)" onMore />
      <div className="mono" style={{ fontSize: 10.5, color: "var(--mut)", marginBottom: 4 }}>2025 벤더별 매출 트리맵 (단위: {uLabel(c)} · Gartner 잠정{fxNote(c, "usd")})</div>
      <div style={{ height: 210 }} onClick={(e) => e.stopPropagation()}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={VENDORS_2025.map((v) => ({ name: v.name, value: convB(v.value, c), fill: v.color, disp: fmtBy(convB(v.value, c), c) }))}
            dataKey="value" nameKey="name" content={<TreemapCell />} isAnimationActive={false}>
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div style={{ background: "#0C1526", border: "1px solid var(--line2)", borderRadius: 8, padding: "7px 10px", fontSize: 12 }}>
                <b>{payload[0].payload.name}</b> · {fmtBy(payload[0].payload.value, c)}
              </div>) : null} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      {/* rank table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, fontSize: 12 }}>
        <thead>
          <tr className="mono" style={{ fontSize: 9.5, color: "var(--dim)", textAlign: "left" }}>
            <th style={{ padding: "4px 6px", fontWeight: 500 }}>#</th>
            <th style={{ padding: "4px 6px", fontWeight: 500 }}>업체</th>
            <th style={{ padding: "4px 6px", fontWeight: 500, textAlign: "right" }}>매출({uLabel(c)})</th>
            <th style={{ padding: "4px 6px", fontWeight: 500, textAlign: "right" }}>M/S</th>
            <th style={{ padding: "4px 6px", fontWeight: 500, textAlign: "right" }}>YoY</th>
          </tr>
        </thead>
        <tbody>
          {top.map((v, i) => (
            <tr key={i} className="hoverline" style={{ borderTop: "1px solid var(--line)" }}>
              <td className="mono" style={{ padding: "5px 6px", color: "var(--dim)" }}>{i + 1}</td>
              <td style={{ padding: "5px 6px", fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, background: v.color, borderRadius: 2, display: "inline-block", marginRight: 7 }} />
                {v.name}
              </td>
              <td className="mono" style={{ padding: "5px 6px", textAlign: "right" }}>{fmtBy(convB(v.value, c), c)}{v.est && <span style={{ color: "var(--dim)" }}>*</span>}</td>
              <td className="mono" style={{ padding: "5px 6px", textAlign: "right", color: "var(--mut)" }}>{((v.value / 793) * 100).toFixed(1)}%</td>
              <td className="mono" style={{ padding: "5px 6px", textAlign: "right", color: v.yoy.startsWith("-") ? "var(--red)" : "var(--green)" }}>{v.yoy}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mono" style={{ fontSize: 9, color: "var(--dim)", marginTop: 4 }}>* 추정치 포함 · 전체 {fmtBy(convB(793, c), c)} 기준{fxNote(c, "usd")}</div>
      {/* share bars */}
      <div style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
        <ShareBar data={SHARE_BARS.dram} />
        <ShareBar data={SHARE_BARS.hbm} />
      </div>
      {/* competitor news */}
      <div style={{ marginTop: 6, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>경쟁사 주요 소식</div>
        {[
          "엔비디아, 사상 첫 반도체 매출 $100B 돌파 — 업계 성장 35% 기여",
          "마이크론, 2026년 HBM 물량 완판 · CapEx $200억으로 확대",
          "CXMT 등 중국 D램, DDR5 전환하며 점유율 확대 지속",
        ].map((t, i) => (
          <div key={i} className="hoverline" style={{ padding: "5px 6px", fontSize: 11.5, color: "var(--mut)", lineHeight: 1.5 }}>
            <span style={{ color: "var(--amber)", marginRight: 6 }}>▸</span>{t}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompanyChart({ data }) {
  const curr = React.useContext(UnitCtx);
  const c = effCurr(curr, "krw");
  const rows = data.map((d) => ({ ...d, rev: convT(d.rev, c, yearOf(d.year)), op: convT(d.op, c, yearOf(d.year)) }));
  return (
    <div style={{ height: 165 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: "var(--mut)", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
          <YAxis yAxisId="l" tick={{ fill: "var(--dim)", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="r" orientation="right" hide domain={[-40, 70]} />
          <Tooltip content={<ChartTip c={c} />} cursor={{ fill: "rgba(82,224,240,0.06)" }} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} iconSize={8} />
          <Bar yAxisId="l" dataKey="rev" name={`매출(${uLabel(c)})`} fill="var(--cyan)" radius={[4, 4, 0, 0]} opacity={0.85} />
          <Bar yAxisId="l" dataKey="op" name={`영업익(${uLabel(c)})`} radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.op < 0 ? "var(--red)" : "var(--green)"} />)}
          </Bar>
          <Line yAxisId="r" dataKey="margin" name="OPM(%)" stroke="var(--amber)" strokeWidth={2}
            dot={{ r: 3, fill: "var(--amber)" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

const COMPANIES = {
  skh: {
    label: "SK하이닉스", accent: "var(--cyan)", data: SKH_5Y, detail: "skhynix",
    quarterly: SKH_Q25,
    mix: { title: "2025 제품 믹스 (매출 비중 · 추정)", items: [
      { name: "HBM", v: 32, c: "#1FB8D8", grp: "D램" },
      { name: "범용 D램", v: 46, c: "#7FE9F5", grp: "D램" },
      { name: "낸드", v: 8, c: "#9D8CFF" },
      { name: "솔루션(SSD)", v: 12, c: "#C4B8FF" },
      { name: "기타", v: 2, c: "#3A4C74" } ] },
    mixNote: "D램 합산 78% — HBM은 D램 매출의 40%+ 수준 · 솔루션은 eSSD 중심으로 낸드 계열 최대 매출 견인",
    statLabel: "2025 매출 / 영업익",
    statValue: <>97.1조 / <span style={{ color: "var(--green)" }}>47.2조</span></>,
    statNote: "OPM 49% · 삼성 영업익 첫 추월",
    product: <>HBM 매출 <b style={{ color: "var(--cyan)" }}>2배↑</b> · HBM3E+HBM4 동시양산 유일 · 낸드 최대매출</>,
    news: [
      "25.4Q 영업이익률 58% — 분기 사상 최고",
      "충청권: 청주 M17 낸드 + P&T7 패키징 신규 투자",
      "High NA EUV 업계 최초 양산라인 도입",
      "UBS, HBM4 점유율 약 70% 전망 — BofA 톱픽",
    ],
  },
  sds: {
    label: "삼성전자 DS", accent: "var(--blue)", data: SDS_5Y, detail: "samsung",
    quarterly: SDS_Q25,
    mix: { title: "2025 사업 믹스 (매출 비중 · 추정)", items: [
      { name: "HBM", v: 8, c: "#3E6FE0", grp: "D램" },
      { name: "범용 D램", v: 40, c: "#8FB4FF", grp: "D램" },
      { name: "낸드", v: 22, c: "#9D8CFF" },
      { name: "시스템LSI·파운드리", v: 30, c: "#FFB454" } ] },
    mixNote: "D램 합산 48% — 삼성 HBM은 '25년 약 $9B(D램의 ~19%) · 4Q 영업익은 사실상 메모리가 견인",
    statLabel: "2025 매출 / 영업익 (추정 합산)",
    statValue: <>≈130조 / <span style={{ color: "var(--green)" }}>≈24.9조</span></>,
    statNote: "4Q 단독 44조 / 16.4조 (사상 최대)",
    product: <>HBM4 <b style={{ color: "var(--blue)" }}>양산 출하</b>(11.7Gbps) · 서버 DDR5 · eSSD 확대</>,
    news: [
      "26.1Q 메모리 ASP, 2025년 평균 대비 +146%",
      "온양·천안 후공정 → HBM 팹 전환에 56조 투자",
      "테슬라 165억 달러 파운드리 장기 수주 (2033년까지)",
      "전사 4Q 영업익 20.1조 — 한국 기업 최초 20조 돌파",
    ],
  },
};

function MixDonut({ mix, accent }) {
  const [hov, setHov] = useState(null);
  const dramSum = mix.items.filter((it) => it.grp === "D램").reduce((s, it) => s + it.v, 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 170, height: 170, position: "relative", flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={mix.items} dataKey="v" nameKey="name" cx="50%" cy="50%"
              innerRadius={46} outerRadius={74} paddingAngle={2} startAngle={90} endAngle={-270}
              stroke="#0A101E" strokeWidth={2} isAnimationActive={false}
              onMouseEnter={(_, i) => setHov(i)} onMouseLeave={() => setHov(null)}>
              {mix.items.map((it, i) => (
                <Cell key={i} fill={it.c}
                  opacity={hov === null || hov === i ? 1 : 0.3}
                  style={{ transition: "opacity .15s", cursor: "default", outline: "none" }} />
              ))}
            </Pie>
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div style={{ background: "#0C1526", border: "1px solid var(--line2)", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
                <b>{payload[0].name}</b> · {payload[0].value}%
              </div>) : null} />
          </PieChart>
        </ResponsiveContainer>
        {/* center label */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          {hov !== null ? (
            <>
              <div style={{ fontSize: 10, color: "var(--mut)" }}>{mix.items[hov].name}</div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: mix.items[hov].c }}>{mix.items[hov].v}%</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 10, color: "var(--mut)" }}>D램 합산</div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: accent }}>{dramSum}%</div>
            </>
          )}
        </div>
      </div>
      {/* legend */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        {mix.items.map((it, i) => (
          <div key={i} className="hoverline"
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 7px",
              opacity: hov === null || hov === i ? 1 : 0.45, transition: "opacity .15s", cursor: "default" }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: it.c, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, minWidth: 0 }}>{it.name}</span>
            <span className="mono" style={{ fontSize: 11.5, marginLeft: "auto", color: "var(--mut)" }}>{it.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompanyBoard({ goDetail }) {
  const [sel, setSel] = useState("skh");
  const c = COMPANIES[sel];
  const curr = React.useContext(UnitCtx);
  const uc = effCurr(curr, "krw");
  return (
    <div className="card clickable" style={{ padding: 18 }} onClick={() => goDetail(c.detail)}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div className="eyebrow" style={{ color: c.accent, marginBottom: 3 }}>COMPANY</div>
          <div className="disp" style={{ fontSize: 17, fontWeight: 600 }}>{c.label}</div>
        </div>
        {/* toggle */}
        <div onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", border: "1px solid var(--line2)", borderRadius: 8, overflow: "hidden" }}>
          {Object.entries(COMPANIES).map(([key, co]) => (
            <button key={key} onClick={() => setSel(key)}
              style={{ border: "none", cursor: "pointer", padding: "5px 11px", fontSize: 11, fontWeight: 600,
                fontFamily: "inherit", transition: "all .15s",
                background: sel === key ? "rgba(82,224,240,0.14)" : "transparent",
                color: sel === key ? co.accent : "var(--dim)",
                boxShadow: sel === key ? `inset 0 -2px 0 ${key === "skh" ? "#52E0F0" : "#6C9BFF"}` : "none" }}>
              {co.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--mut)", marginBottom: 4 }}>5개년 연간 실적 (단위: {uLabel(uc)}{fxNote(uc, "krw")})</div>
      <div onClick={(e) => e.stopPropagation()}><CompanyChart data={c.data} /></div>
      {/* quarterly */}
      <div className="mono" style={{ fontSize: 10.5, color: "var(--mut)", margin: "12px 0 4px" }}>최근 5분기 실적 (단위: {uLabel(uc)}{fxNote(uc, "krw")}{sel === "sds" ? " · 25년 일부 추정" : ""})</div>
      <div style={{ height: 130 }} onClick={(e) => e.stopPropagation()}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={c.quarterly.map((d) => ({ ...d, margin: Math.round((d.op / d.rev) * 1000) / 10, rev: convT(d.rev, uc, yearOf(d.q)), op: convT(d.op, uc, yearOf(d.q)) }))} margin={{ top: 14, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="q" tick={{ fill: "var(--mut)", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
            <YAxis yAxisId="l" tick={{ fill: "var(--dim)", fontSize: 9, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="r" orientation="right" hide domain={[0, 90]} />
            <Tooltip content={<ChartTip c={uc} />} cursor={{ fill: "rgba(82,224,240,0.06)" }} />
            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} iconSize={8} />
            <Bar yAxisId="l" dataKey="rev" name={`매출(${uLabel(uc)})`} fill={sel === "skh" ? "var(--cyan)" : "var(--blue)"} radius={[3, 3, 0, 0]} opacity={0.85} />
            <Bar yAxisId="l" dataKey="op" name={`영업익(${uLabel(uc)})`} fill="var(--green)" radius={[3, 3, 0, 0]} />
            <Line yAxisId="r" dataKey="margin" name="OPM(%)" stroke="var(--amber)" strokeWidth={2} dot={{ r: 2.5, fill: "var(--amber)" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* product mix — donut */}
      <div style={{ margin: "10px 0 0" }}>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--mut)", marginBottom: 2 }}>{c.mix.title}</div>
        <MixDonut mix={c.mix} accent={c.accent} />
        <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 2, lineHeight: 1.5 }}>{c.mixNote}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        <div className="hoverline" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px" }}>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--dim)" }}>{c.statLabel}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{c.statValue}</div>
          <div style={{ fontSize: 10, color: "var(--mut)" }}>{c.statNote}</div>
        </div>
        <div className="hoverline" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px" }}>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--dim)" }}>제품 하이라이트</div>
          <div style={{ fontSize: 11, lineHeight: 1.5 }}>{c.product}</div>
        </div>
      </div>
      <div style={{ marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 8 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>주요 소식</div>
        {c.news.map((t, i) => (
          <div key={i} className="hoverline" style={{ padding: "4px 6px", fontSize: 11, color: "var(--mut)" }}>
            <span style={{ color: c.accent, marginRight: 6 }}>▸</span>{t}
          </div>
        ))}
      </div>
      <div className="mono" style={{ fontSize: 9.5, color: "var(--dim)", marginTop: 10, textAlign: "right" }}>클릭 → {c.label} 상세 ↗</div>
    </div>
  );
}

/* ══════════════════════════════ DETAIL PAGES ══════════════════════════════ */

function DetailShell({ title, kicker, accent, onBack, children }) {
  return (
    <div style={{ padding: "22px 26px", maxWidth: 1080 }}>
      <button className="btn" onClick={onBack} style={{ marginBottom: 18 }}>← 메인 대시보드</button>
      <div className="eyebrow" style={{ color: accent }}>{kicker}</div>
      <h1 className="disp" style={{ fontSize: 28, fontWeight: 700, margin: "4px 0 22px" }}>{title}</h1>
      {children}
    </div>
  );
}

function Sect({ title, srcs, children }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div className="disp" style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
        {srcs && <SrcChips ids={srcs} align="right" />}
      </div>
      {children}
    </div>
  );
}

function Kv({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
      {items.map(([k, v], i) => (
        <div key={i} className="hoverline" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "9px 12px" }}>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--dim)", marginBottom: 3 }}>{k}</div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function NewsColumn({ items, title, accent }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
        paddingBottom: 8, borderBottom: `2px solid ${accent}` }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}` }} />
        <span className="disp" style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--dim)", marginLeft: "auto" }}>{items.length}건</span>
      </div>
      <div style={{ position: "relative" }}>
        {items.map((n, i) => {
          const tagC = NEWS_TAG_COLORS[n.tag] || "var(--mut)";
          return (
            <div key={i} style={{ display: "flex", gap: 12, position: "relative", paddingBottom: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 10, flexShrink: 0 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: tagC, marginTop: 18,
                  boxShadow: `0 0 6px ${tagC}`, flexShrink: 0, zIndex: 1 }} />
                {i < items.length - 1 && <div style={{ width: 2, flex: 1, background: "var(--line)", marginTop: 3 }} />}
              </div>
              <a href={n.url} target="_blank" rel="noopener noreferrer"
                className="card clickable" style={{ flex: 1, padding: "11px 14px", marginBottom: 0,
                  textDecoration: "none", color: "inherit", display: "block", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--cyan)" }}>{n.date}</span>
                  <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 20, border: `1px solid ${tagC}`, color: tagC }}>{n.tag}</span>
                  {n.src && <span className="tag" style={{ fontSize: 9, padding: "1px 6px" }}>{n.src}</span>}
                  <span className="mono" style={{ fontSize: 9, color: "var(--dim)", marginLeft: "auto" }}>원문 ↗</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.4 }}>{n.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--mut)", lineHeight: 1.6 }}>{n.body}</div>
              </a>
            </div>
          );
        })}
        {items.length === 0 && <div className="mono" style={{ fontSize: 11, color: "var(--dim)", padding: "8px 0" }}>해당 항목 없음</div>}
      </div>
    </div>
  );
}

function NewsDetail({ onBack }) {
  const [filter, setFilter] = useState("전체");
  const tags = ["전체", "실적", "경쟁", "기술", "시장", "가격", "투자", "정책"];
  const base = filter === "전체" ? NEWS_TIMELINE : NEWS_TIMELINE.filter((n) => n.tag === filter);
  const kr = base.filter((n) => n.region === "KR");
  const gl = base.filter((n) => n.region === "GL");
  return (
    <DetailShell kicker="NEWS TIMELINE" title="반도체 뉴스 타임라인" accent="var(--green)" onBack={onBack}>
      {/* filter chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
        {tags.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ border: "1px solid var(--line2)", cursor: "pointer", padding: "5px 13px", fontSize: 12,
              borderRadius: 20, fontFamily: "inherit", fontWeight: 600, transition: "all .15s",
              background: filter === t ? "rgba(82,224,240,0.14)" : "transparent",
              color: filter === t ? "var(--cyan)" : "var(--mut)" }}>
            {t}{t !== "전체" && <span style={{ marginLeft: 5, color: "var(--dim)", fontWeight: 400 }}>
              {NEWS_TIMELINE.filter((n) => n.tag === t).length}</span>}
          </button>
        ))}
      </div>
      {/* two columns: KR | GL */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <NewsColumn items={kr} title="한국" accent="var(--cyan)" />
        <div style={{ width: 1, alignSelf: "stretch", background: "var(--line)" }} />
        <NewsColumn items={gl} title="해외" accent="var(--amber)" />
      </div>
      <div className="mono" style={{ fontSize: 10, color: "var(--dim)", marginTop: 14 }}>
        각 항목 클릭 → 원문 기사 · 좌우 열 각각 최신순 · 큐레이션 기준 (2026.07.06)
      </div>
    </DetailShell>
  );
}

function MarketDetail({ onBack }) {
  const curr = React.useContext(UnitCtx);
  const c = effCurr(curr, "usd");
  const m5 = MARKET_5Y.map((d) => ({ ...d, value: convB(d.value, c, yearOf(d.year)) }));
  return (
    <DetailShell kicker="MARKET DETAIL" title="글로벌 반도체 시장 상세" accent="var(--blue)" onBack={onBack}>
      <Sect srcs={["sia2025", "wsts", "irsFx"]} title={`연간 시장규모 추이 및 2026년 전망 (단위: ${uLabel(c)}${fxNote(c, "usd")})`}>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={m5} margin={{ top: 24, right: 10, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "var(--mut)", fontSize: 12, fontFamily: "IBM Plex Mono" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
              <YAxis tick={{ fill: "var(--dim)", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip c={c} />} cursor={{ fill: "rgba(108,155,255,0.07)" }} />
              <Bar dataKey="value" name={`시장규모(${uLabel(c)})`} radius={[6, 6, 0, 0]}>
                <LabelList dataKey="value" position="top" style={{ fill: "var(--ink)", fontSize: 11, fontFamily: "IBM Plex Mono" }} formatter={(v) => Math.round(v)} />
                {m5.map((d, i) => (
                  <Cell key={i} fill={d.forecast ? "rgba(108,155,255,0.28)" : "var(--blue)"}
                    stroke={d.forecast ? "var(--blue)" : "none"} strokeDasharray={d.forecast ? "4 3" : "0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--mut)", lineHeight: 1.7, marginTop: 8 }}>
          2025년 글로벌 반도체 매출은 <b style={{ color: "var(--ink)" }}>$791.7B(+25.6%, SIA)</b>로 사상 최대.
          2024년 $630.5B에서 AI 인프라 투자 폭증으로 급성장했으며, WSTS는 2026년 <b style={{ color: "var(--ink)" }}>$975B(+25%↑)</b>로
          1조 달러 접근을 전망. 2026년 들어 성장은 더 가속 — 1분기 $298.5B(+25% QoQ), 4월 $110.5B(+93.9% YoY).
        </div>
      </Sect>
      <Sect srcs={["sia2025"]} title="2025 제품 세그먼트">
        <Kv items={[
          ["로직", "$301.9B (+39.9%) · 최대 카테고리"],
          ["메모리", "$223.1B (+34.8%)"],
          ["└ D램 (추정)", "≈$156B · HBM $30B+ (23%)"],
          ["└ 낸드 (추정)", "≈$60B · eSSD 수요 견인"],
          ["AI 프로세서", "$200B 초과 (2025)"],
          ["AI 반도체 비중", "전체의 약 1/3 → '29년 50%+"],
        ]} />
      </Sect>
      <Sect srcs={["sia2025", "wsts"]} title="2025 지역별 성장률">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {REGION_2025.map((r, i) => (
            <div key={i} className="hoverline" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "10px 16px", minWidth: 130 }}>
              <div style={{ fontSize: 12, color: "var(--mut)" }}>{r.name}</div>
              <div className="mono" style={{ fontSize: 17, fontWeight: 600, color: r.yoy.startsWith("-") ? "var(--red)" : "var(--green)" }}>{r.yoy}</div>
            </div>
          ))}
        </div>
      </Sect>
      <Sect srcs={["wsts", "bofa", "deloitte"]} title="2026년 전망 및 관전 포인트">
        <div style={{ fontSize: 12.5, color: "var(--mut)", lineHeight: 1.8 }}>
          <b style={{ color: "var(--ink)" }}>① 메모리 슈퍼사이클</b> — BofA는 2026년을 1990년대급 호황으로 정의. D램 매출 +51%, 낸드 +45%, ASP는 각각 +33%/+26% 전망.<br />
          <b style={{ color: "var(--ink)" }}>② HBM 시장</b> — 2026년 $54.6B(+58%) 전망. ASIC향 HBM 수요 +82%로 시장의 1/3 차지 예상 (골드만삭스).<br />
          <b style={{ color: "var(--ink)" }}>③ 리스크</b> — 메모리 가격 급등에 따른 소비자 시장 부담(스마트폰·노트북 전망 하향), 2026년 이후 HBM 가격 조정 가능성, 관세·지정학 변수.
        </div>
      </Sect>
      <div className="mono" style={{ fontSize: 10, color: "var(--dim)" }}>출처: SIA, WSTS, Gartner, Counterpoint, TrendForce, Deloitte (2026.07.06 기준)</div>
    </DetailShell>
  );
}

function CompetitorDetail({ onBack }) {
  const curr = React.useContext(UnitCtx);
  const c = effCurr(curr, "usd");
  return (
    <DetailShell kicker="COMPETITOR DETAIL" title="경쟁 구도 상세" accent="var(--amber)" onBack={onBack}>
      <Sect srcs={["gartner"]} title={`2025 벤더별 매출 트리맵 (단위: ${uLabel(c)} · Gartner 잠정, 전체 ${fmtBy(convB(793, c), c)}${fxNote(c, "usd")})`}>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap data={VENDORS_2025.map((v) => ({ name: v.name, value: convB(v.value, c), fill: v.color, disp: fmtBy(convB(v.value, c), c) }))}
              dataKey="value" nameKey="name" content={<TreemapCell />} isAnimationActive={false}>
              <Tooltip content={({ active, payload }) => active && payload?.length ? (
                <div style={{ background: "#0C1526", border: "1px solid var(--line2)", borderRadius: 8, padding: "7px 10px", fontSize: 12 }}>
                  <b>{payload[0].payload.name}</b> · {fmtBy(payload[0].payload.value, c)}
                </div>) : null} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </Sect>
      <Sect srcs={["gartner"]} title="Top 10 순위표">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr className="mono" style={{ fontSize: 10, color: "var(--dim)", textAlign: "left" }}>
              <th style={{ padding: "6px 8px" }}>#</th><th style={{ padding: "6px 8px" }}>업체</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>2025 매출({uLabel(c)})</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>점유율</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>YoY</th>
              <th style={{ padding: "6px 8px" }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {VENDORS_2025.filter((v) => v.name !== "기타").map((v, i) => (
              <tr key={i} className="hoverline" style={{ borderTop: "1px solid var(--line)" }}>
                <td className="mono" style={{ padding: "7px 8px", color: "var(--dim)" }}>{i + 1}</td>
                <td style={{ padding: "7px 8px", fontWeight: 600 }}>
                  <span style={{ width: 9, height: 9, background: v.color, borderRadius: 2, display: "inline-block", marginRight: 8 }} />{v.name}
                </td>
                <td className="mono" style={{ padding: "7px 8px", textAlign: "right" }}>{fmtBy(convB(v.value, c), c)}{v.est && "*"}</td>
                <td className="mono" style={{ padding: "7px 8px", textAlign: "right", color: "var(--mut)" }}>{((v.value / 793) * 100).toFixed(1)}%</td>
                <td className="mono" style={{ padding: "7px 8px", textAlign: "right", color: v.yoy.startsWith("-") ? "var(--red)" : "var(--green)" }}>{v.yoy}</td>
                <td style={{ padding: "7px 8px", fontSize: 11, color: "var(--dim)" }}>
                  {["첫 $100B 돌파, 업계성장 35% 기여", "메모리 +13%, 비메모리 -8%", "HBM 수요로 3위 등극", "점유율 6%, '21년의 절반", "AI 네트워킹·커스텀 ASIC", "HBM '26 물량 완판", "", "", "", ""][i]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--dim)", marginTop: 6 }}>* 표시는 추정치 (Gartner 발표는 상위권 확정치 위주)</div>
      </Sect>
      <Sect srcs={["cpDram", "cpNand"]} title="메모리 제품별 점유율 (2026.1Q)">
        <ShareBar data={SHARE_BARS.dram} />
        <ShareBar data={SHARE_BARS.hbm} />
        <ShareBar data={SHARE_BARS.nand} />
      </Sect>
      <Sect srcs={["gartner", "tfAsp"]} title="경쟁사 동향 브리핑">
        <div style={{ fontSize: 12.5, color: "var(--mut)", lineHeight: 1.8 }}>
          <b style={{ color: "var(--ink)" }}>엔비디아</b> — 2025년 매출 $126B(+63.9%)로 압도적 1위. Rubin 플랫폼으로 HBM4 수요 견인.<br />
          <b style={{ color: "var(--ink)" }}>마이크론</b> — FY26.1Q 매출 $13.6B 사상 최대. 2026년 HBM 완판, CapEx $200억, HBM4 11Gbps+ 구현.<br />
          <b style={{ color: "var(--ink)" }}>CXMT(창신메모리)</b> — 글로벌 D램 톱5 진입. DDR4→DDR5 전환 중, 중국 내수 대체 가속. 낸드는 YMTC가 13% 점유.<br />
          <b style={{ color: "var(--ink)" }}>인텔</b> — 점유율 6%로 하락(2021년의 절반). 전 제품군에서 경쟁 압박 지속.
        </div>
      </Sect>
      <div className="mono" style={{ fontSize: 10, color: "var(--dim)" }}>출처: Gartner(2026.1), Counterpoint(26.1Q), TrendForce (2026.07.06 기준)</div>
    </DetailShell>
  );
}

function SkhDetail({ onBack }) {
  const curr = React.useContext(UnitCtx);
  const uc = effCurr(curr, "krw");
  return (
    <DetailShell kicker="COMPANY DETAIL" title="SK하이닉스" accent="var(--cyan)" onBack={onBack}>
      <Sect srcs={["skh2025", "skhQ1", "irsFx"]} title={`5개년 실적 (연결 · 차트 단위: ${uLabel(uc)}${fxNote(uc, "krw")} · 표: 조원)`}>
        <div style={{ height: 260 }}><CompanyChart data={SKH_5Y} /></div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 10 }}>
          <thead><tr className="mono" style={{ fontSize: 10, color: "var(--dim)", textAlign: "right" }}>
            <th style={{ textAlign: "left", padding: 6 }}>연도</th><th style={{ padding: 6 }}>매출</th><th style={{ padding: 6 }}>영업이익</th><th style={{ padding: 6 }}>OPM</th></tr></thead>
          <tbody>{SKH_5Y.map((d, i) => (
            <tr key={i} className="hoverline" style={{ borderTop: "1px solid var(--line)", textAlign: "right" }}>
              <td className="mono" style={{ textAlign: "left", padding: 6 }}>{d.year}</td>
              <td className="mono" style={{ padding: 6 }}>{d.rev}조</td>
              <td className="mono" style={{ padding: 6, color: d.op < 0 ? "var(--red)" : "var(--green)" }}>{d.op}조</td>
              <td className="mono" style={{ padding: 6, color: "var(--mut)" }}>{d.margin}%</td>
            </tr>))}
          </tbody>
        </table>
      </Sect>
      <Sect srcs={["skh2025"]} title="2025년 하이라이트">
        <Kv items={[
          ["연간 실적", "매출 97.15조 / 영업익 47.21조 (OPM 49%)"],
          ["순이익", "42.95조 (순이익률 44%)"],
          ["4분기", "매출 32.83조 / 영업익 19.17조 (OPM 58%)"],
          ["의미", "영업익 전년비 +101% · 삼성전자 첫 추월"],
          ["HBM", "매출 전년비 2배↑ · HBM3E+HBM4 동시 양산 유일"],
          ["D램", "1c(10나노 6세대) DDR5 양산 · 256GB RDIMM"],
          ["낸드", "321단 QLC 개발 완료 · eSSD로 연간 최대 매출"],
          ["주주환원", "연 배당 2.1조 + 자사주 1,530만주 전량 소각"],
        ]} />
      </Sect>
      <Sect srcs={["skhQ1", "bofa"]} title="투자·전략 동향">
        <div style={{ fontSize: 12.5, color: "var(--mut)", lineHeight: 1.8 }}>
          <b style={{ color: "var(--ink)" }}>생산 인프라</b> — 청주 M15X, 용인 클러스터에 더해 청주 M17(낸드)·P&T7(첨단 패키징) 신규 투자 발표(7.2 충청권 발전비전).<br />
          <b style={{ color: "var(--ink)" }}>기술</b> — 업계 최초 High NA EUV(EXE:5200B) 양산라인 도입. HBM4E는 26년 하반기 샘플, 27년 양산 목표(1c 코어다이).<br />
          <b style={{ color: "var(--ink)" }}>비전</b> — '풀 스택 AI 메모리 크리에이터'. AI가 학습→추론 중심으로 전환되며 메모리 수요 구조적 확대 전망.<br />
          <b style={{ color: "var(--ink)" }}>외부 평가</b> — BofA 글로벌 메모리 톱픽. UBS는 HBM4 점유율 약 70% 전망.
        </div>
      </Sect>
      <div className="mono" style={{ fontSize: 10, color: "var(--dim)" }}>출처: SK하이닉스 IR/뉴스룸(26.1.28), THE ELEC, Counterpoint (2026.07.06 기준)</div>
    </DetailShell>
  );
}

function SamsungDetail({ onBack }) {
  const curr = React.useContext(UnitCtx);
  const uc = effCurr(curr, "krw");
  return (
    <DetailShell kicker="COMPANY DETAIL" title="삼성전자 DS부문" accent="var(--blue)" onBack={onBack}>
      <Sect srcs={["ss4Q", "ssQ1", "irsFx"]} title={`5개년 실적 (DS부문 · 차트 단위: ${uLabel(uc)}${fxNote(uc, "krw")} · 표: 조원 · 2025는 분기 합산 추정)`}>
        <div style={{ height: 260 }}><CompanyChart data={SDS_5Y} /></div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 10 }}>
          <thead><tr className="mono" style={{ fontSize: 10, color: "var(--dim)", textAlign: "right" }}>
            <th style={{ textAlign: "left", padding: 6 }}>연도</th><th style={{ padding: 6 }}>매출</th><th style={{ padding: 6 }}>영업이익</th><th style={{ padding: 6 }}>OPM</th></tr></thead>
          <tbody>{SDS_5Y.map((d, i) => (
            <tr key={i} className="hoverline" style={{ borderTop: "1px solid var(--line)", textAlign: "right" }}>
              <td className="mono" style={{ textAlign: "left", padding: 6 }}>{d.year}{d.est && "*"}</td>
              <td className="mono" style={{ padding: 6 }}>{d.rev}조</td>
              <td className="mono" style={{ padding: 6, color: d.op < 0 ? "var(--red)" : "var(--green)" }}>{d.op}조</td>
              <td className="mono" style={{ padding: 6, color: "var(--mut)" }}>{d.margin}%</td>
            </tr>))}
          </tbody>
        </table>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--dim)", marginTop: 4 }}>* 2025년은 분기 실적 합산 기반 추정치</div>
      </Sect>
      <Sect srcs={["ss4Q"]} title="2025년 하이라이트">
        <Kv items={[
          ["전사 연간", "매출 333.6조(사상 최대) / 영업익 43.6조(+33%)"],
          ["DS 4분기", "매출 44조 / 영업익 16.4조 — 분기 사상 최대"],
          ["전사 4분기", "영업익 20.1조 — 한국 기업 최초 20조 돌파"],
          ["메모리", "범용 D램 강세 + HBM 확대로 분기 최대 실적"],
          ["가격", "26.1Q 메모리 ASP, '25년 평균 대비 +146%"],
          ["R&D", "연간 37.7조 — 역대 최대"],
        ]} />
      </Sect>
      <Sect srcs={["ssQ1", "tfAsp"]} title="투자·전략 동향">
        <div style={{ fontSize: 12.5, color: "var(--mut)", lineHeight: 1.8 }}>
          <b style={{ color: "var(--ink)" }}>HBM4 반격</b> — 26.2월 양산 출하(11.7Gbps·3.3TB/s). 1c D램 + 파운드리 4나노 베이스다이 결합. HBM4E 12단 샘플 출하.<br />
          <b style={{ color: "var(--ink)" }}>생산 투자</b> — 온양·천안 후공정을 최첨단 HBM 팹으로 전환, 56조 투자(7.2 발표). 평택·화성 1c 라인 가동률 3분기 70%+ 목표.<br />
          <b style={{ color: "var(--ink)" }}>파운드리</b> — 테슬라 165억 달러(약 22조) 장기 수주(~2033). 2나노 확대로 손익 개선 추진.<br />
          <b style={{ color: "var(--ink)" }}>전략</b> — 로직·메모리·파운드리·패키징 '원스톱 솔루션' 유일 기업 포지셔닝으로 AI 반도체 주도권 확보.
        </div>
      </Sect>
      <div className="mono" style={{ fontSize: 10, color: "var(--dim)" }}>출처: 삼성전자 뉴스룸/IR(26.1.29), TrendForce, ZDNet (2026.07.06 기준)</div>
    </DetailShell>
  );
}

/* ══════════════════════════════ DASHBOARD ══════════════════════════════ */

function Dashboard({ goDetail }) {
  return (
    <div style={{ padding: "18px 22px 40px", display: "flex", flexDirection: "column", gap: 14, minWidth: 900 }}>
      {/* briefing */}
      <div className="card" style={{ padding: "16px 20px", borderColor: "rgba(82,224,240,0.35)",
        background: "linear-gradient(90deg, rgba(82,224,240,0.08), rgba(16,26,48,0.4) 55%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div className="live" />
          <span className="eyebrow" style={{ color: "var(--cyan)" }}>Daily Briefing · {BRIEFING.date}</span>
        </div>
        <div className="disp" style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>{BRIEFING.headline}</div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {BRIEFING.points.map((p, i) => (
            <div key={i} className="hoverline" style={{ flex: "1 1 240px", fontSize: 12, color: "var(--mut)", lineHeight: 1.6, padding: "4px 6px" }}>
              <span className="mono" style={{ color: "var(--cyan)", marginRight: 7 }}>{String(i + 1).padStart(2, "0")}</span>{p}
            </div>
          ))}
        </div>
      </div>
      {/* news */}
      <div className="card clickable" style={{ padding: "9px 16px 10px" }} onClick={() => goDetail("news")}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span className="eyebrow" style={{ color: "var(--green)" }}>NEWS</span>
            <span className="eyebrow" style={{ color: "var(--cyan)", width: 44, textAlign: "center" }}>한국</span>
          </div>
          <div style={{ paddingLeft: 16, display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 10 }}>
            <span className="eyebrow" style={{ color: "var(--amber)", width: 44, textAlign: "center" }}>해외</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <NewsList items={NEWS_KR} />
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 16 }}>
            <NewsList items={NEWS_GL} />
          </div>
        </div>
        <div className="mono" style={{ fontSize: 9.5, color: "var(--dim)", textAlign: "right", marginTop: 6 }}>전체 타임라인 보기 →</div>
      </div>
      {/* 3 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, alignItems: "start" }}>
        <MarketBoard goDetail={goDetail} />
        <CompetitorBoard goDetail={goDetail} />
        <CompanyBoard goDetail={goDetail} />
      </div>
    </div>
  );
}

/* ══════════════════════════════ APP ══════════════════════════════ */

export default function App() {
  const [view, setView] = useState("dashboard");
  const [chatOpen, setChatOpen] = useState(true);
  const [curr, setCurr] = useState("auto");
  const mainRef = useRef(null);

  const goDetail = (v) => { setView(v); if (mainRef.current) mainRef.current.scrollTop = 0; };

  return (
    <UnitCtx.Provider value={curr}>
    <div className="app">
      <style>{CSS}</style>
      <div style={{ display: "flex", overflowX: "hidden" }}>
        {/* main */}
        <div ref={mainRef} className="mainscroll" style={{ flex: 1, height: "100vh", overflowY: "auto", minWidth: 0 }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 22px 0" }}>
            <svg width="34" height="34" viewBox="0 0 32 32" style={{ flexShrink: 0, filter: "drop-shadow(0 0 6px rgba(82,224,240,0.45))" }}>
              {/* HBM 적층 심볼: 베이스 다이 + D램 3층 + TSV */}
              <rect x="3" y="23.5" width="26" height="5.5" rx="1.8" fill="#2A4A7A" />
              <rect x="6.5" y="17.2" width="19" height="4.4" rx="1.2" fill="#2596B4" />
              <rect x="6.5" y="11.6" width="19" height="4.4" rx="1.2" fill="#38C4DE" />
              <rect x="6.5" y="6" width="19" height="4.4" rx="1.2" fill="#7FE9F5" />
              <line x1="12.5" y1="6.8" x2="12.5" y2="28" stroke="rgba(6,18,31,0.55)" strokeWidth="1.4" />
              <line x1="19.5" y1="6.8" x2="19.5" y2="28" stroke="rgba(6,18,31,0.55)" strokeWidth="1.4" />
              <circle cx="12.5" cy="26.2" r="1.1" fill="#7FE9F5" />
              <circle cx="19.5" cy="26.2" r="1.1" fill="#7FE9F5" />
            </svg>
            <div>
              <div className="disp" style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.5, color: "var(--ink)" }}>
                SEMISENSE / 반도체 마켓 인텔리전스
              </div>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--dim)", letterSpacing: 0.4 }}>
                MARKET · COMPETITOR · COMPANY — SENSING TERMINAL
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
              {/* unit toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--dim)" }}>단위</span>
                <div style={{ display: "flex", border: "1px solid var(--line2)", borderRadius: 7, overflow: "hidden" }}>
                  {[["auto", "자동"], ["usd", "$B"], ["krw", "조원"]].map(([k, lb]) => (
                    <button key={k} onClick={() => setCurr(k)}
                      style={{ border: "none", cursor: "pointer", padding: "4px 10px", fontSize: 11, fontWeight: 600,
                        fontFamily: "'IBM Plex Mono',monospace", transition: "all .15s",
                        background: curr === k ? "rgba(82,224,240,0.14)" : "transparent",
                        color: curr === k ? "var(--cyan)" : "var(--dim)" }}
                      title={k === "auto" ? "차트별 기본 단위" : k === "usd" ? "전체 달러($B) 표시" : "전체 원화(조원) 표시 · 환율 1,400원/$"}>
                      {lb}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="live" />
                <span className="mono" style={{ fontSize: 10.5, color: "var(--mut)" }}>DATA AS OF 2026.07.06</span>
              </div>
            </div>
          </div>
          {view === "dashboard" && <Dashboard goDetail={goDetail} />}
          {view === "news" && <NewsDetail onBack={() => goDetail("dashboard")} />}
          {view === "market" && <MarketDetail onBack={() => goDetail("dashboard")} />}
          {view === "competitor" && <CompetitorDetail onBack={() => goDetail("dashboard")} />}
          {view === "skhynix" && <SkhDetail onBack={() => goDetail("dashboard")} />}
          {view === "samsung" && <SamsungDetail onBack={() => goDetail("dashboard")} />}
        </div>
        {/* jarvis */}
        <JarvisPanel open={chatOpen} setOpen={setChatOpen} />
      </div>
    </div>
    </UnitCtx.Provider>
  );
}
