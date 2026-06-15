import fs from "node:fs";
import vm from "node:vm";

const bundlePath = new URL("../vendor/rngdle-main.js", import.meta.url);
const bundle = fs.readFileSync(bundlePath, "utf8");

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

const defs = load(67711).BADGE_DEFINITIONS;
const scoring = load(10584).SCORED_BADGES;
const api = load(5641);
const scoreById = new Map(scoring.map((badge) => [badge.id, badge]));

const exported = defs.map((def) => {
  const scored = scoreById.get(def.id);
  const score = scored?.score ?? 0;
  return {
    id: def.id,
    label: def.label,
    description: def.description,
    emoji: def.emoji,
    family: def.family ?? null,
    score,
    probability: scored?.probability ?? null,
    badgeRarity: api.getBadgeRarityTier(score),
    tests: {
      match: def.tests?.match ?? [],
      reject: def.tests?.reject ?? []
    }
  };
});

const out = {
  source: "https://www.rngdle.com/_next/static/chunks/6d375db2482ce7e8.js",
  extractedAt: new Date().toISOString(),
  badgeCount: defs.length,
  scoredBadgeCount: scoring.length,
  scorePercentileCount: Object.keys(load(10584).SCORE_PERCENTILES).length,
  badgeRarityThresholds: api.BADGE_RARITY_THRESHOLDS,
  cardPercentileThresholds: api.CARD_PERCENTILE_THRESHOLDS,
  calculation: {
    analyze: "Run every BADGE_DEFINITIONS[i].check(number, number.toString()).",
    scoring: "Sum scores for badges not in a family, plus only the highest score badge per family.",
    cardRarity: "Look up totalScore in SCORE_PERCENTILES, then compare against card percentile thresholds."
  },
  badges: exported
};

fs.writeFileSync(new URL("../official_rules.json", import.meta.url), JSON.stringify(out, null, 2));

if (process.argv[2]) {
  const n = Number(process.argv[2]);
  console.log(JSON.stringify(api.composeRollResult(n), null, 2));
} else {
  console.log(`Exported ${defs.length} badges to official_rules.json`);
}
