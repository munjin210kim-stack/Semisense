// scripts/fetch-news.js
// 구글 뉴스 RSS에서 반도체 시장 관련 최신 뉴스를 가져와 public/data/news.json 을 누적 갱신합니다.
// 기존에 쌓여있던 뉴스를 지우지 않고, 오늘 새로 찾은 것만 추가합니다 (같은 링크는 중복 제외).
// GitHub Actions가 매일 아침(KST 06:00)에 이 스크립트를 자동 실행합니다.

import { writeFileSync, readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

// 국내(kr) / 해외(gl) 각각 검색할 키워드
const QUERIES = {
  kr: ['SK하이닉스', '삼성전자 반도체', 'HBM 메모리', '반도체 시장'],
  gl: ['semiconductor market', 'HBM memory chip', 'Samsung SK Hynix', 'DRAM NAND price'],
};

// 대시보드 뉴스 타임라인과 동일한 태그 체계로 자동 분류
const TAG_RULES = [
  { tag: '실적', kws: ['실적', '영업이익', '매출', 'earnings', 'revenue', 'profit'] },
  { tag: '경쟁', kws: ['경쟁', '점유율', 'Micron', '마이크론', 'competition', 'market share'] },
  { tag: '기술', kws: ['기술', 'HBM4', 'HBM5', '공정', 'technology', 'process node'] },
  { tag: '가격', kws: ['가격', 'ASP', 'price', '단가'] },
  { tag: '투자', kws: ['투자', '팹', '공장', 'investment', 'fab', 'plant'] },
  { tag: '정책', kws: ['정책', '관세', '규제', 'policy', 'tariff', 'regulation'] },
];

function classify(title) {
  for (const rule of TAG_RULES) {
    if (rule.kws.some((k) => title.includes(k))) return rule.tag;
  }
  return '시장';
}

function toShortDate(pubDate) {
  if (!pubDate) return '';
  const d = new Date(pubDate);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
}

const parser = new XMLParser({ ignoreAttributes: false });

async function fetchOne(query, region) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=${region === 'kr' ? 'ko' : 'en'}&gl=${region === 'kr' ? 'KR' : 'US'}&ceid=${
    region === 'kr' ? 'KR:ko' : 'US:en'
  }`;

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`요청 실패 (${query}): ${res.status}`);
    return [];
  }
  const xml = await res.text();
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items.slice(0, 6).map((it) => ({
    date: toShortDate(it.pubDate),
    _sortDate: it.pubDate ? new Date(it.pubDate).toISOString() : '',
    url: it.link || '',
    title: (it.title || '').replace(/\s*-\s*[^-]+$/, ''),
    body: '', // 구글 뉴스 RSS는 요약을 제공하지 않아 비워둠
    tag: classify(it.title || ''),
  }));
}

function loadExisting() {
  try {
    const raw = readFileSync('public/data/news.json', 'utf-8');
    const data = JSON.parse(raw);
    return { kr: Array.isArray(data.kr) ? data.kr : [], gl: Array.isArray(data.gl) ? data.gl : [] };
  } catch {
    return { kr: [], gl: [] };
  }
}

function mergeDedupe(existing, fresh, cap) {
  const merged = [...existing, ...fresh];
  const seen = new Set();
  const unique = merged.filter((n) => {
    if (!n.url || seen.has(n.url)) return false;
    seen.add(n.url);
    return true;
  });
  unique.sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));
  return unique.slice(0, cap).map(({ _sortDate, ...rest }) => rest); // 내부용 정렬 필드는 저장 전 제거
}

async function main() {
  const existing = loadExisting();

  const freshKr = [];
  for (const q of QUERIES.kr) freshKr.push(...(await fetchOne(q, 'kr')));

  const freshGl = [];
  for (const q of QUERIES.gl) freshGl.push(...(await fetchOne(q, 'gl')));

  const kr = mergeDedupe(existing.kr, freshKr, 40);
  const gl = mergeDedupe(existing.gl, freshGl, 40);

  const output = { kr, gl, updatedAt: new Date().toISOString() };
  writeFileSync('public/data/news.json', JSON.stringify(output, null, 2), 'utf-8');
  console.log(
    `news.json 갱신 완료: KR ${kr.length}건 / GL ${gl.length}건 (기존 KR ${existing.kr.length} / GL ${existing.gl.length}에서 누적)`
  );
}

main().catch((err) => {
  console.error('뉴스 수집 실패:', err);
  process.exit(1);
});
