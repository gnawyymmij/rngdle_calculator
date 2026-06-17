# RNGdle Calculator

A custom calculator for RNGdle, with a static calculator and stats viewer built from the official frontend rule bundle.

## Pages

- Live site: https://gnawyymmij.github.io/rngdle_calculator/
- `index.html`: calculator for a roll in the valid range `0..999999`
- `stats.html`: visualization of full enumeration statistics

## Local Regeneration

```bash
node tools/enumerate-stats.mjs
node tools/build-stats-page.mjs
```

The site is static and can be hosted directly with GitHub Pages from the repository root.
