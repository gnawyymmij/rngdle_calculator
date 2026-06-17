import fs from "node:fs";

const stats = JSON.parse(fs.readFileSync(new URL("../enumeration_stats.json", import.meta.url), "utf8"));
const embedded = JSON.stringify(stats).replaceAll("</", "<\\/");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RNGdle Stats</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f6f3ed;
      --panel: #ffffff;
      --ink: #181818;
      --muted: #67615a;
      --line: #d7d0c3;
      --accent: #116a65;
      --accent-2: #9d3f2f;
      --shadow: 0 18px 48px rgba(30, 25, 18, 0.12);
      --trash: #a87931;
      --common: #6b7280;
      --uncommon: #12804a;
      --rare: #2563eb;
      --epic: #7c3aed;
      --anomaly: #ea580c;
      --mythic: #dc2626;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #151714;
        --panel: #20231f;
        --ink: #f3f1ea;
        --muted: #aaa49a;
        --line: #393b34;
        --accent: #62c7ba;
        --accent-2: #df806c;
        --shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
      }
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        linear-gradient(135deg, rgba(17, 106, 101, 0.12), transparent 32%),
        linear-gradient(225deg, rgba(157, 63, 47, 0.10), transparent 30%),
        var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    main {
      width: min(1240px, calc(100% - 32px));
      margin: 0 auto;
      padding: 28px 0 40px;
    }

    header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 18px;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.1rem, 5vw, 5rem);
      line-height: 0.95;
      letter-spacing: 0;
    }

    .subtitle {
      margin: 12px 0 0;
      color: var(--muted);
      line-height: 1.6;
      max-width: 760px;
    }

    .nav {
      display: inline-flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .nav a {
      display: inline-flex;
      align-items: center;
      min-height: 38px;
      padding: 8px 12px;
      border: 1px solid var(--line);
      border-radius: 6px;
      color: var(--ink);
      text-decoration: none;
      background: color-mix(in srgb, var(--panel) 88%, transparent);
      font-weight: 800;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 14px;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: color-mix(in srgb, var(--panel) 94%, transparent);
      box-shadow: var(--shadow);
      padding: 16px;
      min-width: 0;
    }

    .span-12 { grid-column: span 12; }
    .span-8 { grid-column: span 8; }
    .span-6 { grid-column: span 6; }
    .span-4 { grid-column: span 4; }

    h2 {
      margin: 0 0 12px;
      font-size: 0.95rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .kpis {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 10px;
    }

    .kpi {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      min-height: 92px;
      background: color-mix(in srgb, var(--panel) 76%, var(--bg));
    }

    .kpi span {
      display: block;
      color: var(--muted);
      font-size: 0.74rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .kpi strong {
      display: block;
      margin-top: 8px;
      font-size: 1.42rem;
      line-height: 1.1;
      overflow-wrap: anywhere;
    }

    .stack {
      display: flex;
      overflow: hidden;
      height: 42px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
    }

    .stack div {
      min-width: 2px;
    }

    .legend {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px;
      margin-top: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--muted);
      font-size: 0.86rem;
    }

    .swatch {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      background: currentColor;
      flex: 0 0 auto;
    }

    .chart {
      width: 100%;
      min-height: 260px;
    }

    .axis text {
      fill: var(--muted);
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }

    .axis line, .axis path, .grid-line {
      stroke: var(--line);
    }

    .line {
      fill: none;
      stroke: var(--accent);
      stroke-width: 3;
    }

    .dot {
      fill: var(--accent-2);
      stroke: var(--panel);
      stroke-width: 2;
    }

    .bars {
      display: grid;
      gap: 7px;
    }

    .bar-row {
      display: grid;
      grid-template-columns: 58px 1fr 88px;
      gap: 10px;
      align-items: center;
      font-size: 0.88rem;
    }

    .bar-track {
      height: 18px;
      border-radius: 4px;
      background: color-mix(in srgb, var(--line) 45%, transparent);
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    th, td {
      padding: 9px 8px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
    }

    th {
      color: var(--muted);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    td.num, th.num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      border: 1px solid currentColor;
      padding: 2px 7px;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .visit-counter {
      display: inline-flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: color-mix(in srgb, var(--panel) 88%, transparent);
    }

    .visit-counter span {
      color: var(--muted);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .visit-counter img {
      display: block;
      max-width: 100%;
      height: auto;
    }

    .trash { color: var(--trash); }
    .common { color: var(--common); }
    .uncommon { color: var(--uncommon); }
    .rare { color: var(--rare); }
    .epic { color: var(--epic); }
    .anomaly { color: var(--anomaly); }
    .mythic { color: var(--mythic); }

    @media (max-width: 940px) {
      header { align-items: start; flex-direction: column; }
      .span-8, .span-6, .span-4 { grid-column: span 12; }
      .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 560px) {
      main { width: min(100% - 20px, 1240px); }
      .kpis { grid-template-columns: 1fr; }
      .bar-row { grid-template-columns: 42px 1fr 72px; gap: 8px; }
      th:nth-child(4), td:nth-child(4) { display: none; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>RNGdle Stats</h1>
        <p class="subtitle">Full enumeration of every valid roll from 0 to 999,999 using the official rules. All charts are generated from the local <code>enumeration_stats.json</code>; no network access is required.</p>
      </div>
      <nav class="nav">
        <a href="index.html">Calculator</a>
        <a href="official_formula.md">Formula</a>
        <div class="visit-counter">
          <span>Total Visits</span>
          <img src="https://profile-counter.glitch.me/rngdle-calculator/count.svg" alt="Total visits counter" loading="lazy" referrerpolicy="no-referrer">
        </div>
      </nav>
    </header>

    <section class="panel span-12">
      <div id="kpis" class="kpis"></div>
    </section>

    <section class="grid">
      <article class="panel span-8">
        <h2>Card Rarity Distribution</h2>
        <div id="rarityStack" class="stack"></div>
        <div id="rarityLegend" class="legend"></div>
      </article>

      <article class="panel span-4">
        <h2>Top Numbers</h2>
        <div id="topNumbers"></div>
      </article>

      <article class="panel span-8">
        <h2>EP Percentiles</h2>
        <svg id="percentileChart" class="chart" viewBox="0 0 760 280" role="img" aria-label="EP percentile line chart"></svg>
      </article>

      <article class="panel span-4">
        <h2>Badge Count Histogram</h2>
        <div id="badgeHistogram" class="bars"></div>
      </article>

      <article class="panel span-6">
        <h2>Most Common Badges</h2>
        <div id="commonBadges"></div>
      </article>

      <article class="panel span-6">
        <h2>Rarest Badges</h2>
        <div id="rareBadges"></div>
      </article>

      <article class="panel span-6">
        <h2>Most Common Scoring Badges</h2>
        <div id="commonScoringBadges"></div>
      </article>

      <article class="panel span-6">
        <h2>Rarest Scoring Badges</h2>
        <div id="rareScoringBadges"></div>
      </article>
    </section>
  </main>

  <script id="stats-data" type="application/json">${embedded}</script>
  <script>
    const stats = JSON.parse(document.getElementById("stats-data").textContent);
    const fmt = new Intl.NumberFormat("en-US");
    const pct = (value) => Number(value).toFixed(4).replace(/0+$/, "").replace(/\\.$/, "") + "%";
    const rarityOrder = ["trash", "common", "uncommon", "rare", "epic", "anomaly", "mythic"];
    const rarityLabels = {
      trash: "Trash",
      common: "Common",
      uncommon: "Uncommon",
      rare: "Rare",
      epic: "Epic",
      anomaly: "Anomaly",
      mythic: "Mythic"
    };

    function $(id) {
      return document.getElementById(id);
    }

    function renderKpis() {
      const kpis = [
        ["Total Rolls", fmt.format(stats.range.total)],
        ["Mean EP", fmt.format(Math.round(stats.score.mean))],
        ["Median EP", fmt.format(stats.score.percentiles.p50)],
        ["Max EP", fmt.format(stats.score.max)],
        ["Unique EP Scores", fmt.format(stats.score.uniqueScoreCount)],
        ["Std Dev", fmt.format(Math.round(stats.score.standardDeviation))]
      ];
      $("kpis").innerHTML = kpis.map(([label, value]) => '<div class="kpi"><span>' + label + '</span><strong>' + value + '</strong></div>').join("");
    }

    function renderRarity() {
      const total = stats.range.total;
      $("rarityStack").innerHTML = rarityOrder.map((rarity) => {
        const width = stats.cardRarityCounts[rarity] / total * 100;
        return '<div class="' + rarity + '" style="width:' + width + '%; background: currentColor" title="' + rarityLabels[rarity] + ' ' + pct(width) + '"></div>';
      }).join("");
      $("rarityLegend").innerHTML = rarityOrder.map((rarity) => {
        const count = stats.cardRarityCounts[rarity];
        return '<div class="legend-item ' + rarity + '"><span class="swatch"></span><span><strong>' + rarityLabels[rarity] + '</strong> ' + fmt.format(count) + ' · ' + pct(stats.cardRarityPercents[rarity]) + '</span></div>';
      }).join("");
    }

    function renderPercentiles() {
      const svg = $("percentileChart");
      const entries = Object.entries(stats.score.percentiles).map(([key, score]) => ({
        label: key.replace("p", "P").replace("9999", "99.99").replace("999", "99.9"),
        percentile: Number(key.replace("p", "").replace("9999", "99.99").replace("999", "99.9")),
        score
      }));
      const width = 760;
      const height = 280;
      const pad = { left: 72, right: 22, top: 18, bottom: 44 };
      const minLog = Math.log10(Math.max(1, Math.min(...entries.map((d) => d.score))));
      const maxLog = Math.log10(Math.max(...entries.map((d) => d.score)));
      const x = (i) => pad.left + i * ((width - pad.left - pad.right) / (entries.length - 1));
      const y = (score) => {
        const t = (Math.log10(score) - minLog) / (maxLog - minLog);
        return height - pad.bottom - t * (height - pad.top - pad.bottom);
      };
      const points = entries.map((d, i) => [x(i), y(d.score)]);
      const yTicks = [2000, 5000, 10000, 100000, 1000000, 10000000];
      svg.innerHTML = [
        ...yTicks.map((tick) => '<line class="grid-line" x1="' + pad.left + '" x2="' + (width - pad.right) + '" y1="' + y(tick) + '" y2="' + y(tick) + '"></line><text x="' + (pad.left - 10) + '" y="' + (y(tick) + 4) + '" text-anchor="end" class="axis">' + fmt.format(tick) + '</text>'),
        '<polyline class="line" points="' + points.map((p) => p.join(",")).join(" ") + '"></polyline>',
        ...entries.map((d, i) => '<circle class="dot" cx="' + x(i) + '" cy="' + y(d.score) + '" r="5"><title>' + d.label + ': ' + fmt.format(d.score) + ' EP</title></circle>'),
        ...entries.map((d, i) => '<text class="axis" x="' + x(i) + '" y="' + (height - 18) + '" text-anchor="middle">' + d.label + '</text>'),
        '<text class="axis" x="' + pad.left + '" y="14">EP, log scale</text>'
      ].join("");
    }

    function renderBars(id, histogram, limit = Infinity) {
      const entries = Object.entries(histogram).map(([k, v]) => [Number(k), v]).sort((a, b) => a[0] - b[0]).slice(0, limit);
      const max = Math.max(...entries.map((entry) => entry[1]));
      $(id).innerHTML = entries.map(([label, count]) => {
        const width = count / max * 100;
        return '<div class="bar-row"><div>' + label + '</div><div class="bar-track"><div class="bar-fill" style="width:' + width + '%"></div></div><div class="num">' + fmt.format(count) + '</div></div>';
      }).join("");
    }

    function renderTable(id, rows) {
      $(id).innerHTML = '<table><thead><tr><th>Badge</th><th>Id</th><th class="num">Count</th><th class="num">%</th></tr></thead><tbody>' +
        rows.slice(0, 12).map((row) => '<tr><td>' + row.label + '</td><td><code>' + row.id + '</code></td><td class="num">' + fmt.format(row.count) + '</td><td class="num">' + pct(row.percent) + '</td></tr>').join("") +
        '</tbody></table>';
    }

    function renderTopNumbers() {
      $("topNumbers").innerHTML = '<table><thead><tr><th class="num">#</th><th class="num">EP</th><th class="num">Badges</th></tr></thead><tbody>' +
        stats.topNumbers.slice(0, 10).map((row) => '<tr><td class="num">' + fmt.format(row.number) + '</td><td class="num">' + fmt.format(row.score) + '</td><td class="num">' + row.badgeCount + '/' + row.scoringBadgeCount + '</td></tr>').join("") +
        '</tbody></table>';
    }

    renderKpis();
    renderRarity();
    renderPercentiles();
    renderBars("badgeHistogram", stats.badgeCounts.histogram);
    renderTopNumbers();
    renderTable("commonBadges", stats.mostCommonBadges);
    renderTable("rareBadges", stats.rarestBadges);
    renderTable("commonScoringBadges", stats.mostCommonScoringBadges);
    renderTable("rareScoringBadges", stats.rarestScoringBadges);
  </script>
</body>
</html>
`;

fs.writeFileSync(new URL("../stats.html", import.meta.url), html);
console.log("Wrote stats.html");
