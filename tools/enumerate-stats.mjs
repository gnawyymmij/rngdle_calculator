import fs from "node:fs";
import vm from "node:vm";

const MAX = 999_999;
const bundle = fs.readFileSync(new URL("../vendor/rngdle-main.js", import.meta.url), "utf8");

let pushed;
const sandbox = {
  console,
  globalThis: {
    TURBOPACK: {
      push(entry) {
        pushed = entry;
      }
    }
  }
};
vm.runInNewContext(bundle, sandbox, { filename: "rngdle-main.js" });

const modules = new Map();
for (let i = 1; i < pushed.length; i++) {
  if (typeof pushed[i] !== "number") continue;
  if (typeof pushed[i + 1] === "function") {
    modules.set(pushed[i], pushed[i + 1]);
    i++;
  } else if (typeof pushed[i + 1] === "number" && typeof pushed[i + 2] === "function") {
    modules.set(pushed[i], pushed[i + 2]);
    i += 2;
  }
}

const cache = new Map();
function load(id) {
  if (cache.has(id)) return cache.get(id);
  const fn = modules.get(id);
  if (!fn) throw new Error(`Missing module ${id}`);
  const exp = {};
  cache.set(id, exp);
  fn({
    i: load,
    s(entries) {
      for (let i = 0; i < entries.length;) {
        const name = entries[i++];
        if (entries[i] === 0) {
          i++;
          exp[name] = entries[i++];
        } else {
          const getter = entries[i++];
          Object.defineProperty(exp, name, { enumerable: true, get: getter });
        }
      }
    }
  });
  return exp;
}

const api = load(5641);
const definitions = load(67711).BADGE_DEFINITIONS;
const badgeLabels = new Map(definitions.map((badge) => [badge.id, badge.label]));
const total = MAX + 1;
const rarityOrder = ["trash", "common", "uncommon", "rare", "epic", "anomaly", "mythic"];

const cardRarityCounts = Object.fromEntries(rarityOrder.map((rarity) => [rarity, 0]));
const badgeHitCounts = new Map();
const badgeScoringCounts = new Map();
const scoreCounts = new Map();
const badgeCountHistogram = new Map();
const scoringBadgeCountHistogram = new Map();
const topNumbers = [];

let minScore = Infinity;
let maxScore = -Infinity;
let sumScore = 0;
let sumScoreSquared = 0;
let minBadgeCount = Infinity;
let maxBadgeCount = -Infinity;
let minScoringBadgeCount = Infinity;
let maxScoringBadgeCount = -Infinity;
let zeroScoreCount = 0;

function inc(map, key, by = 1) {
  map.set(key, (map.get(key) ?? 0) + by);
}

function rememberTop(number, score, badgeCount, scoringBadgeCount) {
  topNumbers.push({ number, score, badgeCount, scoringBadgeCount });
  topNumbers.sort((a, b) => b.score - a.score || a.number - b.number);
  if (topNumbers.length > 25) topNumbers.pop();
}

for (let number = 0; number <= MAX; number++) {
  const result = api.analyzeNumber(number);
  const score = result.totalScore;
  const badgeCount = result.badges.length;
  const scoringBadgeCount = result.scoringBadges.length;

  sumScore += score;
  sumScoreSquared += score * score;
  minScore = Math.min(minScore, score);
  maxScore = Math.max(maxScore, score);
  minBadgeCount = Math.min(minBadgeCount, badgeCount);
  maxBadgeCount = Math.max(maxBadgeCount, badgeCount);
  minScoringBadgeCount = Math.min(minScoringBadgeCount, scoringBadgeCount);
  maxScoringBadgeCount = Math.max(maxScoringBadgeCount, scoringBadgeCount);
  if (score === 0) zeroScoreCount++;

  inc(scoreCounts, score);
  inc(badgeCountHistogram, badgeCount);
  inc(scoringBadgeCountHistogram, scoringBadgeCount);
  cardRarityCounts[api.getCardRarityTier(score)]++;
  for (const id of result.badges) inc(badgeHitCounts, id);
  for (const id of result.scoringBadges) inc(badgeScoringCounts, id);
  rememberTop(number, score, badgeCount, scoringBadgeCount);
}

const sortedScores = [...scoreCounts.entries()].sort((a, b) => a[0] - b[0]);
function percentile(p) {
  const target = Math.ceil((p / 100) * total);
  let seen = 0;
  for (const [score, count] of sortedScores) {
    seen += count;
    if (seen >= target) return score;
  }
  return sortedScores.at(-1)[0];
}

function topEntries(map, limit = 20) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id, count]) => ({
      id,
      label: badgeLabels.get(id) ?? id,
      count,
      percent: +(count / total * 100).toFixed(6)
    }));
}

function rareEntries(map, limit = 20) {
  return [...map.entries()]
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id, count]) => ({
      id,
      label: badgeLabels.get(id) ?? id,
      count,
      percent: +(count / total * 100).toFixed(6)
    }));
}

const mean = sumScore / total;
const variance = sumScoreSquared / total - mean * mean;
const stats = {
  range: { min: 0, max: MAX, total },
  score: {
    min: minScore,
    max: maxScore,
    mean: +mean.toFixed(6),
    standardDeviation: +Math.sqrt(Math.max(0, variance)).toFixed(6),
    zeroScoreCount,
    uniqueScoreCount: scoreCounts.size,
    percentiles: {
      p1: percentile(1),
      p5: percentile(5),
      p10: percentile(10),
      p25: percentile(25),
      p50: percentile(50),
      p75: percentile(75),
      p90: percentile(90),
      p95: percentile(95),
      p99: percentile(99),
      p999: percentile(99.9),
      p9999: percentile(99.99)
    }
  },
  cardRarityCounts,
  cardRarityPercents: Object.fromEntries(Object.entries(cardRarityCounts).map(([k, v]) => [k, +(v / total * 100).toFixed(6)])),
  badgeCounts: {
    min: minBadgeCount,
    max: maxBadgeCount,
    histogram: Object.fromEntries([...badgeCountHistogram.entries()].sort((a, b) => a[0] - b[0]))
  },
  scoringBadgeCounts: {
    min: minScoringBadgeCount,
    max: maxScoringBadgeCount,
    histogram: Object.fromEntries([...scoringBadgeCountHistogram.entries()].sort((a, b) => a[0] - b[0]))
  },
  topNumbers,
  mostCommonBadges: topEntries(badgeHitCounts),
  rarestBadges: rareEntries(badgeHitCounts),
  mostCommonScoringBadges: topEntries(badgeScoringCounts),
  rarestScoringBadges: rareEntries(badgeScoringCounts)
};

fs.writeFileSync(new URL("../enumeration_stats.json", import.meta.url), JSON.stringify(stats, null, 2));

console.log(JSON.stringify({
  total,
  minScore,
  maxScore,
  mean: stats.score.mean,
  uniqueScoreCount: scoreCounts.size,
  cardRarityCounts,
  scorePercentiles: stats.score.percentiles,
  topNumbers: topNumbers.slice(0, 10)
}, null, 2));
