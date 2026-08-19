// scripts/fetch-news.js
// 구글 뉴스 RSS에서 반도체 시장 관련 최신 뉴스를 가져와 public/data/news.json 을 누적 갱신합니다.
// 기존에 쌓여있던 뉴스를 지우지 않고, 오늘 새로 찾은 것만 추가합니다.
// 같은 사건을 여러 언론사가 보도한 "제목만 다른 동일 기사"는 하나만 남깁니다.
// GitHub Actions가 매일 아침(KST 06:00)에 이 스크립트를 자동 실행합니다.

import { writeFileSync, readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

// 국내(kr) / 해외(gl) 각각 검색할 키워드
const QUERIES = {
  kr: ['SK하이닉스', '삼성전자 반도체', 'HBM 메모리', '반도체 시장'],
  gl: ['semiconductor market', 'HBM memory chip', 'Samsung SK Hynix', 'DRAM NAND price'],
};

const ITEMS_PER_QUERY = 3; // 쿼리당 상위 3건만 (너무 많으면 같은 사건이 중복으로 쌓임)

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

// 제목을 의미있는 단어 집합으로 쪼갬 (조사/기호/언론사 태그 제거)
function titleTokens(title) {
  const cleaned = (title || '')
    .replace(/\[[^\]]*\]/g, ' ') // [속보], [단독] 같은 태그 제거
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // 문장부호 제거 (한글/영문/숫자만 남김)
    .toLowerCase();
  return new Set(cleaned.split(/\s+/).filter((w) => w.length >= 2));
}

// 두 제목의 단어 겹침 비율 (자카드 유사도) — 0.5 이상이면 사실상 같은 기사로 취급
function titleSimilarity(a, b) {
  const setA = titleTokens(a);
  const setB = titleTokens(b);
  if (!setA.size || !setB.size) return 0;
  let overlap = 0;
  for (const w of setA) if (setB.has(w)) overlap++;
  return overlap / Math.min(setA.size, setB.size);
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

  return items.slice(0, ITEMS_PER_QUERY).map((it) => ({
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
  // 최신순으로 정렬한 뒤, 앞에서부터 훑으며 "이미 채택한 것과 제목이 너무 비슷하면" 건너뜁니다.
  merged.sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));

  const seenUrls = new Set();
  const kept = [];
  for (const n of merged) {
    if (!n.url || seenUrls.has(n.url)) continue;
    const isDuplicate = kept.some((k) => titleSimilarity(k.title, n.title) >= 0.5);
    if (isDuplicate) continue;
    seenUrls.add(n.url);
    kept.push(n);
    if (kept.length >= cap) break;
  }
  return kept.map(({ _sortDate, ...rest }) => rest); // 내부용 정렬 필드는 저장 전 제거
}

// ── 데일리 브리핑: 오늘 수집된 뉴스를 근거로 제미나이가 요약을 새로 씀 ──
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function todayLabel() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} (${WEEKDAYS[d.getDay()]})`;
}

function loadExistingBriefing() {
  try {
    return JSON.parse(readFileSync('public/data/briefing.json', 'utf-8'));
  } catch {
    return null;
  }
}

async function generateBriefing(kr, gl) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY가 없어 데일리 브리핑 생성을 건너뜁니다 (뉴스 목록은 정상 갱신됨).');
    return null;
  }

  const headlines = [...kr.slice(0, 10), ...gl.slice(0, 10)]
    .map((n) => `- [${n.tag}] ${n.title}`)
    .join('\n');

  const prompt = `아래는 오늘 수집된 반도체 산업 최신 뉴스 헤드라인이다. 이 중 가장 중요한 시장 트렌드를 골라 "데일리 브리핑"을 작성하라.

[오늘의 뉴스 헤드라인]
${headlines}

다음 JSON 형식으로만 답하라 (다른 텍스트, 코드블록 없이 순수 JSON만):
{"headline": "한 줄 핵심 헤드라인 (30자 내외)", "points": ["포인트1 (50자 내외)", "포인트2", "포인트3"]}`;

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    );
    if (!res.ok) {
      console.warn('브리핑 생성 API 오류:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const raw = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('\n').trim();
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.headline || !Array.isArray(parsed.points)) throw new Error('형식 오류');
    return { date: todayLabel(), headline: parsed.headline, points: parsed.points, updatedAt: new Date().toISOString() };
  } catch (err) {
    console.warn('브리핑 생성 실패, 기존 브리핑 유지:', err.message);
    return null;
  }
}

async function main() {
  const existing = loadExisting();

  const freshKr = [];
  for (const q of QUERIES.kr) freshKr.push(...(await fetchOne(q, 'kr')));

  const freshGl = [];
  for (const q of QUERIES.gl) freshGl.push(...(await fetchOne(q, 'gl')));

  const kr = mergeDedupe(existing.kr, freshKr, 25);
  const gl = mergeDedupe(existing.gl, freshGl, 25);

  const output = { kr, gl, updatedAt: new Date().toISOString() };
  writeFileSync('public/data/news.json', JSON.stringify(output, null, 2), 'utf-8');
  console.log(
    `news.json 갱신 완료: KR ${kr.length}건 / GL ${gl.length}건 (기존 KR ${existing.kr.length} / GL ${existing.gl.length}에서 누적)`
  );

  const briefing = await generateBriefing(kr, gl);
  if (briefing) {
    writeFileSync('public/data/briefing.json', JSON.stringify(briefing, null, 2), 'utf-8');
    console.log('briefing.json 갱신 완료:', briefing.headline);
  } else {
    console.log('briefing.json은 이번엔 갱신하지 않음 (기존 파일 유지)');
  }
}

main().catch((err) => {
  console.error('뉴스 수집 실패:', err);
  process.exit(1);
});
