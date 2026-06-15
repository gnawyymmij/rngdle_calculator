# RNGdle Official Calculation Notes

Extracted from `vendor/rngdle-main.js`, copied from the current official RNGdle frontend chunk.

## Modules

- `47558`: numeric helper functions such as prime, palindrome, Fibonacci, square, digit runs, sequences.
- `67711`: `BADGE_DEFINITIONS`, 203 badge rules. Each rule has `id`, `label`, `description`, `emoji`, optional `family`, `check(number, string)`, and tests.
- `10584`: `SCORED_BADGES` and `SCORE_PERCENTILES`.
- `5641`: public API used by the app: `analyzeNumber`, `composeRollResult`, rarity helpers, percentile lookup.

## Badge EP

Each badge has an official `score` in `SCORED_BADGES`. The UI calls this EP.

Badge rarity is derived from score:

```js
score < 1_000       => common
score < 10_000      => uncommon
score < 100_000     => rare
score < 1_000_000   => epic
score < 10_000_000  => anomaly
otherwise           => mythic
```

## Total EP

`analyzeNumber(number)`:

1. Convert the number to a string.
2. Run every badge rule: `rule.check(number, numberString)`.
3. Keep all matched badge ids in `badges`.
4. For total score, family badges are deduplicated:
   - badges without `family` always score
   - for each `family`, only the highest-score matched badge scores
5. Sum official `score` values for the resulting `scoringBadges`.

## Card Rarity

Card rarity uses total EP percentile, not raw EP thresholds.

```js
percentile = SCORE_PERCENTILES[totalScore.toString()] ?? 0

percentile < 1   => trash
percentile < 50  => common
percentile < 75  => uncommon
percentile < 90  => rare
percentile < 95  => epic
percentile < 99  => anomaly
otherwise        => mythic
```

`SCORE_PERCENTILES` currently contains 53,819 score-to-percentile entries.

## Local Files

- `vendor/rngdle-main.js`: official frontend chunk used by the calculator.
- `tools/extract-official.mjs`: loader/exporter for the official modules.
- `official_rules.json`: generated full badge metadata, scores, probabilities, families, and test examples.
