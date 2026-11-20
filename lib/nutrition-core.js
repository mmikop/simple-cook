/* Nutrition calculation core. Pure application logic: no AI, no invented values. Missing data stays null (never 0). */
(function (root, factory) { if (typeof module === "object" && module.exports) module.exports = factory(); else root.SC_NUTR = factory(); })(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const NUTRIENTS = [["kcal", "kcal"], ["protein", "g"], ["carbs", "g"], ["fat", "g"], ["satfat", "g"], ["fiber", "g"], ["sugar", "g"], ["sodium", "mg"], ["unsatfat", "g"], ["addedsugar", "g"], ["cholesterol", "mg"], ["potassium", "mg"], ["magnesium", "mg"], ["iron", "mg"], ["calcium", "mg"], ["vitc", "mg"]];
  const DV = { kcal: 2000, protein: 50, carbs: 275, fat: 78, satfat: 20, unsatfat: 20, fiber: 28, sugar: 50, addedsugar: 50, sodium: 2300, cholesterol: 300, potassium: 4700, magnesium: 420, iron: 18, calcium: 1300, vitc: 90 };   // daily reference values (2,000 kcal diet)
  const pct = (k, v) => (v === null || v === undefined || !DV[k] ? null : Math.round((v / DV[k]) * 100));
  const UNIT_G = { g: 1, kg: 1000, oz: 28.349523125, lb: 453.59237 };   // ml/cups are NOT converted: that needs food-specific density data
  const toGrams = (v, u) => (typeof v === "number" && isFinite(v) && v > 0 && UNIT_G[u] ? v * UNIT_G[u] : null);
  const num = (x) => (typeof x === "number" && isFinite(x) && x >= 0 ? x : null);
  // per100: nutrients per 100 g from a real source. Returns amounts for `grams`, null where the source has no value.
  function component(per100, grams) {
    const g = num(grams), o = {}; NUTRIENTS.forEach(([k]) => { const p = per100 ? num(per100[k]) : null; o[k] = p === null || g === null ? null : (p * g) / 100; }); return o;
  }
  // components: [{ id, grams, per100 }]. A nutrient total is `complete` only if every counted component has that value.
  function meal(components) {
    const counted = components.filter((c) => num(c.grams) !== null && c.per100), skipped = components.filter((c) => !counted.includes(c)).map((c) => c.id);
    const total = {}; NUTRIENTS.forEach(([k]) => {
      const vals = counted.map((c) => ({ id: c.id, v: component(c.per100, c.grams)[k] })), have = vals.filter((x) => x.v !== null);
      total[k] = { value: have.length ? have.reduce((a, x) => a + x.v, 0) : null, complete: counted.length > 0 && have.length === counted.length && !skipped.length, missingFrom: vals.filter((x) => x.v === null).map((x) => x.id) };
    });
    return { total, grams: counted.reduce((a, c) => a + c.grams, 0), skipped };
  }
  const INT = ["kcal", "sodium", "cholesterol", "potassium", "magnesium", "calcium"];
  const round = (k, v) => (v === null ? null : INT.includes(k) ? Math.round(v) : Math.round(v * 10) / 10);
  const scale = (n, f) => (n === null ? null : n * f);          // servings: every nutrient is recomputed from the same per-100 g data
  function macroShares(t) {   // share of energy from the three macros (4/4/9 kcal/g); only when all three are complete
    if (!["protein", "carbs", "fat"].every((k) => t[k].complete)) return null;
    const p = t.protein.value * 4, c = t.carbs.value * 4, f = t.fat.value * 9, s = p + c + f; if (!s) return null;
    return { protein: Math.round((p / s) * 100), carbs: Math.round((c / s) * 100), fat: Math.round((f / s) * 100) };
  }
  const atwater = (p) => (num(p.protein) !== null && num(p.carbs) !== null && num(p.fat) !== null ? 4 * p.protein + 4 * p.carbs + 9 * p.fat : null);
  const consistent = (p) => { const a = atwater(p); return a === null || num(p.kcal) === null || a === 0 ? null : Math.abs(a - p.kcal) / Math.max(a, p.kcal) <= 0.25; };
  // Estimate quality: documented, evidence-based, never from the AI's dish-name confidence alone.
  //  identity: 'confirmed' (user) | 'ai'; portion: 'user' | 'source' (a USDA household portion x count) | 'none'; nutrition: 'label' (user-entered) | 'selected' (user picked a source entry) | 'auto' | 'none'
  function quality(c) {
    if (c.portion === "none" || c.nutrition === "none") return "insufficient";
    if (c.identity !== "confirmed" || c.nutrition === "auto") return "lower";
    return c.nutrition === "label" && c.portion === "user" ? "higher" : "moderate";   // photos never reveal oil, sauce or recipe, so 'higher' needs a label + a weighed/entered portion
  }
  const ORDER = ["insufficient", "lower", "moderate", "higher"], overall = (qs) => (qs.length ? qs.reduce((a, b) => (ORDER.indexOf(b) < ORDER.indexOf(a) ? b : a)) : "insufficient");
  // Health score 1-10 from one serving's values (plain numbers, null counts as 0). Transparent rules, measured per 100 kcal so big and small meals compare fairly.
  const POS = ["unsatfat", "fiber", "protein", "potassium", "magnesium", "iron"], NEG = ["satfat", "addedsugar", "sugar", "sodium", "cholesterol"];
  function healthScore(v) {
    const g = (k) => (num(v[k]) === null ? 0 : v[k]), kc = g("kcal");
    if (kc < 30) return null;
    const d = (k) => (g(k) / kc) * 100, cap = (x, m) => Math.max(0, Math.min(m, x));
    const fat = g("unsatfat") + g("satfat"), unsatShare = fat > 0 ? g("unsatfat") / fat : 0;
    const micro = (pct("potassium", g("potassium")) + pct("magnesium", g("magnesium")) + pct("iron", g("iron"))) / 3 / Math.max(kc / DV.kcal * 100, 10);
    let s = 5.5 + cap(d("protein") / 8, 1.5) + cap(d("fiber") / 1.5, 1.5) + (unsatShare >= 0.6 ? 1 : unsatShare >= 0.4 ? 0.5 : 0) + cap(micro, 1)
      - cap(d("satfat") / 1.2, 2) - cap(d("sodium") / 150, 2) - cap(d("addedsugar") / 3, 2) - cap(d("sugar") / 6, 1) - cap(d("cholesterol") / 60, 1);
    const row = (k) => ({ k, value: g(k), pct: pct(k, g(k)) });
    return { score: Math.max(1, Math.min(10, Math.round(s))), pos: POS.map(row), neg: NEG.map(row) };
  }
  return { NUTRIENTS, DV, pct, healthScore, toGrams, component, meal, round, scale, macroShares, atwater, consistent, quality, overall };
});
