/* SIMPLE COOK — AI Food Scanner (route #/food). The AI estimates each food's portion and nutrition from the photo; the user can correct any weight and every number recalculates. Totals, daily values and the health score are computed in lib/nutrition-core.js. */
(function () {
  "use strict";
  const SC = window.SC, N = window.SC_NUTR, W = window.SC_WORLD, S = window.SC_SCAN, World = SC.World;
  if (!N || !World) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const L = {
    en: { h: "What's on Your Plate?", sub: "Scan your meal and get its estimated portions, calories, carbs and health score.", cam: "Open Camera", up: "Upload Food Photo", tips: "Good light, whole plate visible, top-down view. Add a side view if the portion is deep.", why: "Photos are sent to an AI service only after you press Analyse. Simple Cook does not store them.", noteLbl: "Anything the photo can't show? (optional)", notePh: "e.g. cooked with 1 tbsp olive oil", an: "Analyse meal", manual: "Add foods manually",
      mname: "Meal", nutTitle: "Nutrition", nutSub: "Per serving nutritional contribution to daily values", of: "of", health: "Health Score", low: "Low", medium: "Medium", high: "High", hinfo: "A score from 1 to 10 for one serving. It rewards protein, fiber, unsaturated fat and minerals, and subtracts saturated fat, sodium, sugars and cholesterol, compared with the calories. It is a guide, not medical advice.", pos: "Nutrients with positive impact", neg: "Nutrients with negative impact", netc: "Net Carbs", fibr: "Fiber",
      plate: "Your plate", plateHint: "The AI estimated each portion from the photo. If you know a real weight, type it and everything updates.", w: "Weight (g)", hid: "Hidden oil or sauce possible", rm: "Remove", add: "Add food", addph: "Add a food (e.g. cooked white rice)", est: "Estimating…", empty: "No foods yet. Add a food below.", servings: "Servings", servHint: "Share the plate between this many people", again: "Scan another meal", micro: "Vitamins & minerals", dvnote: "Daily values use a 2,000 kcal diet.",
      aiconf: "AI confidence", conf: { high: "high", medium: "medium", low: "low" }, estimate: "AI estimate", qs: "Questions that would change the result:", recipe: "Possible Simple Cook recipe match (your preparation may differ)", disc: "Estimates based on the photo and typical nutrition data. Actual values may differ, especially for hidden oil, sauces and sugar. Not medical advice. For allergies, always check ingredient labels.",
      nobk: "Photo analysis needs the live server and a login.", noai: "Photo analysis is not switched on for this site yet (the owner must add an AI key).", login: "Log in to analyse photos.", fail: "Analysis failed. Retry or add foods manually.", quota: "Daily photo limit reached.", bad: "Use JPEG, PNG or WebP under 10 MB.", denied: "Camera permission denied. Upload a photo instead.", nocam: "No camera available. Upload a photo instead.", insecure: "The camera needs a secure (HTTPS) page. Upload a photo instead.", cap: "Capture", close: "Close", busy: "Analysing…",
      n: { kcal: "Calories", protein: "Protein", carbs: "Carbs", fat: "Fat", satfat: "Saturated Fat", unsatfat: "Unsaturated Fat", fiber: "Fiber", sugar: "Sugars", addedsugar: "Added Sugars", sodium: "Sodium", cholesterol: "Cholesterol", potassium: "Potassium", magnesium: "Magnesium", iron: "Iron", calcium: "Calcium", vitc: "Vitamin C" } },
    fr: { h: "Qu'y a-t-il dans votre assiette ?", sub: "Scannez votre repas et obtenez les portions estimées, les calories, les glucides et le score santé.", cam: "Ouvrir la caméra", up: "Importer une photo", tips: "Bonne lumière, assiette entière visible, vue du dessus. Ajoutez une vue de côté si la portion est épaisse.", why: "Les photos ne sont envoyées à un service d'IA qu'après avoir appuyé sur Analyser. Simple Cook ne les conserve pas.", noteLbl: "Un détail que la photo ne montre pas ? (facultatif)", notePh: "ex. cuit avec 1 c. à soupe d'huile d'olive", an: "Analyser le repas", manual: "Ajouter des aliments",
      mname: "Repas", nutTitle: "Nutrition", nutSub: "Contribution nutritionnelle par portion aux valeurs quotidiennes", of: "sur", health: "Score santé", low: "Faible", medium: "Moyen", high: "Élevé", hinfo: "Un score de 1 à 10 pour une portion. Il récompense les protéines, les fibres, les graisses insaturées et les minéraux, et retire des points pour les graisses saturées, le sodium, les sucres et le cholestérol, par rapport aux calories. C'est un repère, pas un avis médical.", pos: "Nutriments à impact positif", neg: "Nutriments à impact négatif", netc: "Glucides nets", fibr: "Fibres",
      plate: "Votre assiette", plateHint: "L'IA a estimé chaque portion à partir de la photo. Si vous connaissez le vrai poids, saisissez-le et tout se met à jour.", w: "Poids (g)", hid: "Huile ou sauce cachée possible", rm: "Retirer", add: "Ajouter", addph: "Ajouter un aliment (ex. riz blanc cuit)", est: "Estimation…", empty: "Aucun aliment. Ajoutez-en un ci-dessous.", servings: "Portions", servHint: "Partagez l'assiette entre ce nombre de personnes", again: "Scanner un autre repas", micro: "Vitamines et minéraux", dvnote: "Valeurs quotidiennes basées sur 2 000 kcal.",
      aiconf: "Confiance de l'IA", conf: { high: "élevée", medium: "moyenne", low: "faible" }, estimate: "Estimation par IA", qs: "Questions qui changeraient le résultat :", recipe: "Recette Simple Cook possible (votre préparation peut différer)", disc: "Estimations fondées sur la photo et des données nutritionnelles typiques. Les valeurs réelles peuvent différer, surtout pour l'huile, les sauces et le sucre cachés. Pas un avis médical. En cas d'allergie, vérifiez toujours les étiquettes.",
      nobk: "L'analyse de photos nécessite le serveur en ligne et une connexion.", noai: "L'analyse de photos n'est pas encore activée sur ce site (le propriétaire doit ajouter une clé IA).", login: "Connectez-vous pour analyser des photos.", fail: "Échec de l'analyse. Réessayez ou ajoutez manuellement.", quota: "Limite quotidienne atteinte.", bad: "JPEG, PNG ou WebP de moins de 10 Mo.", denied: "Accès caméra refusé. Importez une photo.", nocam: "Aucune caméra. Importez une photo.", insecure: "La caméra nécessite HTTPS. Importez une photo.", cap: "Capturer", close: "Fermer", busy: "Analyse…",
      n: { kcal: "Calories", protein: "Protéines", carbs: "Glucides", fat: "Lipides", satfat: "Graisses saturées", unsatfat: "Graisses insaturées", fiber: "Fibres", sugar: "Sucres", addedsugar: "Sucres ajoutés", sodium: "Sodium", cholesterol: "Cholestérol", potassium: "Potassium", magnesium: "Magnésium", iron: "Fer", calcium: "Calcium", vitc: "Vitamine C" } },
    ar: { h: "ماذا يوجد في طبقك؟", sub: "امسح وجبتك واحصل على الكميات التقديرية والسعرات والكربوهيدرات والتقييم الصحي.", cam: "فتح الكاميرا", up: "رفع صورة الطعام", tips: "إضاءة جيدة، الطبق كاملًا ظاهر، من الأعلى. أضف صورة جانبية إذا كان الطبق عميقًا.", why: "تُرسل الصور إلى خدمة ذكاء اصطناعي فقط بعد الضغط على تحليل ولا يحتفظ بها Simple Cook.", noteLbl: "هل هناك ما لا تُظهره الصورة؟ (اختياري)", notePh: "مثال: طُبخ بملعقة كبيرة من زيت الزيتون", an: "تحليل الوجبة", manual: "إضافة أطعمة يدويًا",
      mname: "الوجبة", nutTitle: "التغذية", nutSub: "مساهمة الحصة الواحدة في القيم اليومية", of: "من", health: "التقييم الصحي", low: "منخفض", medium: "متوسط", high: "مرتفع", hinfo: "تقييم من 1 إلى 10 للحصة الواحدة. يكافئ البروتين والألياف والدهون غير المشبعة والمعادن، ويخصم الدهون المشبعة والصوديوم والسكريات والكوليسترول مقارنة بالسعرات. هو دليل وليس نصيحة طبية.", pos: "عناصر ذات أثر إيجابي", neg: "عناصر ذات أثر سلبي", netc: "صافي الكربوهيدرات", fibr: "الألياف",
      plate: "طبقك", plateHint: "قدّر الذكاء الاصطناعي كل كمية من الصورة. إذا كنت تعرف الوزن الحقيقي فاكتبه وسيتحدّث كل شيء.", w: "الوزن (غ)", hid: "قد يوجد زيت أو صلصة غير ظاهرة", rm: "إزالة", add: "إضافة", addph: "أضف طعامًا (مثل أرز أبيض مطبوخ)", est: "جارٍ التقدير…", empty: "لا توجد أطعمة بعد. أضف طعامًا أدناه.", servings: "الحصص", servHint: "قسّم الطبق على هذا العدد من الأشخاص", again: "امسح وجبة أخرى", micro: "الفيتامينات والمعادن", dvnote: "القيم اليومية مبنية على نظام 2000 سعرة.",
      aiconf: "ثقة الذكاء الاصطناعي", conf: { high: "عالية", medium: "متوسطة", low: "منخفضة" }, estimate: "تقدير بالذكاء الاصطناعي", qs: "أسئلة قد تغيّر النتيجة:", recipe: "وصفة محتملة في Simple Cook (قد يختلف تحضيرك)", disc: "تقديرات مبنية على الصورة وبيانات غذائية نموذجية. قد تختلف القيم الفعلية خاصة للزيت والصلصات والسكر غير الظاهرة. ليست نصيحة طبية. للحساسية تحقق دائمًا من الملصقات.",
      nobk: "يتطلب تحليل الصور الخادم المباشر وتسجيل الدخول.", noai: "تحليل الصور غير مفعّل بعد في هذا الموقع (على المالك إضافة مفتاح الذكاء الاصطناعي).", login: "سجّل الدخول لتحليل الصور.", fail: "فشل التحليل. أعد المحاولة أو أضف يدويًا.", quota: "بلغت الحد اليومي.", bad: "JPEG أو PNG أو WebP أقل من 10 ميغابايت.", denied: "تم رفض إذن الكاميرا. ارفع صورة.", nocam: "لا توجد كاميرا. ارفع صورة.", insecure: "تتطلب الكاميرا HTTPS. ارفع صورة.", cap: "التقاط", close: "إغلاق", busy: "جارٍ التحليل…",
      n: { kcal: "السعرات", protein: "البروتين", carbs: "الكربوهيدرات", fat: "الدهون", satfat: "الدهون المشبعة", unsatfat: "الدهون غير المشبعة", fiber: "الألياف", sugar: "السكريات", addedsugar: "السكريات المضافة", sodium: "الصوديوم", cholesterol: "الكوليسترول", potassium: "البوتاسيوم", magnesium: "المغنيسيوم", iron: "الحديد", calcium: "الكالسيوم", vitc: "فيتامين C" } },
  };
  const lang = () => World.lang(), t = () => L[lang()] || L.en;
  const st = { step: "home", imgs: [], photo: "", note: "", meal: "", cuisine: "", aiConf: "", comps: [], questions: [], servings: 1, msg: "", busy: "", stream: null, lf: null };
  const UNIT = { kcal: "kcal", protein: "g", carbs: "g", fat: "g", satfat: "g", unsatfat: "g", fiber: "g", sugar: "g", addedsugar: "g", sodium: "mg", cholesterol: "mg", potassium: "mg", magnesium: "mg", iron: "mg", calcium: "mg", vitc: "mg" };
  const COLOR = { kcal: "var(--coral)", protein: "#2f7d5b", carbs: "#d98a1f", fat: "#7a4fc2" };
  let root = null, uid = 0;
  const stop = () => { if (st.stream) { st.stream.getTracks().forEach((x) => x.stop()); st.stream = null; } };
  const dropPhoto = () => { if (st.photo) { URL.revokeObjectURL(st.photo); st.photo = ""; } };
  const fmt = (k, v) => (v === null || v === undefined ? "—" : N.round(k, v).toLocaleString("en"));
  const mk = (o) => Object.assign({ id: "c" + ++uid, name: "", prep: "", portion: "", grams: null, per100: null, conf: "medium", hidden: false, x: null, y: null }, o);
  const fromServer = (c) => mk({ name: c.name, prep: c.prep || "", portion: c.portion || "", grams: c.grams, per100: c.per100, conf: c.confidence, hidden: c.hidden, x: c.x == null ? null : c.x, y: c.y == null ? null : c.y });

  function mount() { const r = $("#fs-root"); if (!r || r.dataset.on) return; r.dataset.on = "1"; root = r; root.addEventListener("focusin", (e) => { const el = e.target, a = ["data-g"].find((x) => el.hasAttribute && el.hasAttribute(x)); st.lf = a ? { a, v: el.getAttribute(a) } : null; }); Object.assign(st, { step: "home", imgs: [], photo: "", note: "", meal: "", comps: [], questions: [], servings: 1, msg: "", busy: "" }); SC.cleanups.push(() => { stop(); dropPhoto(); }); draw(); }
  function draw() { if (!root) return; root.dir = lang() === "ar" ? "rtl" : "ltr"; root.innerHTML = `<div class="sn fs ${st.step === "results" ? "fs-wide" : ""}">${{ home, camera, results }[st.step](t())}</div>`; bind(); }
  const msg = () => (st.msg ? `<p class="sn-msg" role="alert">${esc(st.msg)}</p>` : "");

  const home = (x) => `<h1>${x.h}</h1><p>${x.sub}</p><p class="sn-small">${x.tips}</p><p class="sn-small">${x.why}</p>${msg()}
    <div class="sn-row"><button class="btn btn-primary" id="fs-cam">📷 ${x.cam}</button><label class="btn">🖼️ ${x.up}<input type="file" id="fs-file" accept="image/jpeg,image/png,image/webp" hidden></label></div>
    ${st.imgs.length ? `<div class="sn-thumbs">${st.imgs.map((m, i) => `<figure><img src="${m.url}" alt="Meal photo ${i + 1}"><button data-rmi="${i}" aria-label="${x.rm}">✕</button></figure>`).join("")}</div>
      <label class="fs-note">${x.noteLbl}<input id="fs-note" maxlength="200" placeholder="${esc(x.notePh)}" value="${esc(st.note)}"></label>
      <button class="btn btn-primary" id="fs-an" ${st.busy ? "disabled" : ""}>${st.busy || x.an}</button>` : ""}
    <p><button class="btn btn-sm" id="fs-man">${x.manual} →</button></p>`;
  const camera = (x) => `<div class="sn-cam"><video id="fs-v" autoplay playsinline muted></video><div class="sn-row"><button class="btn btn-primary" id="fs-cap">● ${x.cap}</button><button class="btn" id="fs-x">${x.close}</button></div></div>`;

  const ring = (k, pctv, val, name, of) => { const r = 42, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, pctv)); return `<div class="fsr-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${r}" class="trk"/><circle cx="50" cy="50" r="${r}" class="arc" style="stroke:${COLOR[k]};stroke-dasharray:${(c * p / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 50 50)"/></svg><div class="fsr-rv"><b>${val}</b><small>${UNIT[k]}</small><span>${pctv}%</span></div><h4>${name}</h4><p>${of}</p></div>`; };
  const bar = (pctv, color) => `<div class="fsr-trk"><i style="width:${Math.max(0, Math.min(100, pctv))}%;background:${color}"></i></div>`;

  function results(x) {
    const comps = st.comps, sv = Math.max(st.servings, 0.25), M = N.meal(comps.map((c) => ({ id: c.id, grams: c.grams, per100: c.per100 })));
    const V = {}; N.NUTRIENTS.forEach(([k]) => { V[k] = M.total[k].value === null ? null : M.total[k].value / sv; });
    const has = comps.length > 0 && V.kcal !== null, P = (k) => N.pct(k, V[k]), val = (k) => fmt(k, V[k]);
    const rec = W && S && st.meal ? W.recipes.find((r) => { const a = S.norm(st.meal), b = S.norm(r.name); return a && b && (a.includes(b) || b.includes(a)); }) : null;
    const head = `<h1>${esc(st.meal || x.mname)}</h1><p class="sn-small">${st.cuisine ? esc(st.cuisine) + " · " : ""}<span class="fsr-badge">${x.estimate}</span>${st.aiConf ? ` <span class="fsr-badge">${x.aiconf}: ${x.conf[st.aiConf] || ""}</span>` : ""}</p>${msg()}
      <div class="sn-row"><button class="btn" id="fs-new">📷 ${x.again}</button><label class="fsr-serv" title="${esc(x.servHint)}">${x.servings} <input type="number" id="fs-sv" min="0.25" step="0.25" value="${st.servings}"></label></div>`;
    const pin = (c, i) => (c.x == null ? "" : `<span class="fsr-pin" style="left:${c.x}%;top:${c.y}%">${i + 1}</span>`);
    const row = (c, i) => { const comp = N.component(c.per100, c.grams);
      return `<li class="fsr-food"><span class="fsr-n">${i + 1}</span><div class="fsr-fi"><b>${esc(c.name)}</b>${c.prep ? ` <small>(${esc(c.prep)})</small>` : ""}<small class="fsr-por">${esc(c.portion)}${c.hidden ? ` · ⚠ ${x.hid}` : ""}</small></div>
        <label class="fsr-g"><span class="sr-only">${x.w}</span><input type="number" min="1" step="1" data-g="${c.id}" value="${c.grams == null ? "" : Math.round(c.grams)}" aria-label="${x.w}"> g</label><span class="fsr-k">${fmt("kcal", comp.kcal)} <small>kcal</small></span><button class="fsr-rm" data-del="${c.id}" aria-label="${x.rm}: ${esc(c.name)}">✕</button></li>`; };
    const plate = `<section class="fsr-card fsr-plate"><h2>${x.plate}</h2><p class="sn-small">${x.plateHint}</p><div class="fsr-pl">${st.photo ? `<div class="fsr-photo" dir="ltr"><img src="${st.photo}" alt="${esc(st.meal || x.mname)}">${comps.map(pin).join("")}</div>` : ""}
      <div class="fsr-fl">${comps.length ? `<ul>${comps.map(row).join("")}</ul>` : `<p class="sn-small">${x.empty}</p>`}
      <div class="sn-add"><input id="fs-in" placeholder="${esc(x.addph)}" maxlength="60" aria-label="${x.add}"><button class="btn btn-sm" id="fs-addb" ${st.busy ? "disabled" : ""}>${st.busy || "＋ " + x.add}</button></div></div></div></section>`;
    if (!has) return head + plate + `<p class="sn-small">${x.disc}</p>`;
    const H = N.healthScore(Object.assign({}, V)), net = Math.max(0, (V.carbs || 0) - (V.fiber || 0)), netPct = V.carbs ? Math.round((net / V.carbs) * 100) : 100;
    const dash = `<section class="fsr-card"><h2>${x.nutTitle}</h2><p class="sn-small">${x.nutSub}</p><div class="fsr-rings">${["kcal", "protein", "carbs", "fat"].map((k) => ring(k, P(k), val(k), x.n[k], `${x.of} ${N.DV[k].toLocaleString("en")}${k === "kcal" ? "" : "g"}`)).join("")}</div>
      <div class="fsr-net" role="img" aria-label="${x.netc} ${fmt("carbs", net)}g, ${x.fibr} ${fmt("fiber", V.fiber || 0)}g"><div><i style="width:${netPct}%"></i></div><p><span><u></u>${x.netc} <b>${fmt("carbs", net)}g</b></span><span><u class="fb"></u>${x.fibr} <b>${fmt("fiber", V.fiber || 0)}g</b></span></p></div></section>`;
    const nrow = (r, color) => `<div class="fsr-nr"><p><span>${x.n[r.k]} <small>${fmt(r.k, r.value)}${UNIT[r.k]}</small></span><b>${r.pct}%</b></p>${bar(r.pct, color)}</div>`;
    const score = H ? H.score : 0, lvl = score >= 8 ? "var(--basil)" : score >= 5 ? "var(--butter)" : "var(--danger)";
    const hs = H ? `<section class="fsr-card"><h2>${x.health} <details class="fsr-info"><summary aria-label="info">i</summary><p>${x.hinfo}</p></details></h2>
      <div class="fsr-hs"><div class="fsr-seg" role="img" aria-label="${score}/10">${Array.from({ length: 10 }, (_, i) => `<i style="${i < score ? "background:" + lvl : ""}"></i>`).join("")}</div><b class="fsr-sc">${score}<small>/10</small></b></div><div class="fsr-lv"><span>${x.low}</span><span>${x.medium}</span><span>${x.high}</span></div>
      <div class="fsr-cols"><div><h3>${x.pos}</h3>${H.pos.map((r) => nrow(r, "var(--basil)")).join("")}</div><div><h3>${x.neg}</h3>${H.neg.map((r) => nrow(r, "var(--danger)")).join("")}</div></div></section>` : "";
    const MICRO = ["vitc", "calcium", "potassium", "magnesium", "iron", "fiber"].map((k) => ({ k, v: V[k], p: P(k) })).filter((m) => m.p !== null).sort((a, b) => b.p - a.p);
    const mic = MICRO.length ? `<section class="fsr-card"><h2>${x.micro}</h2><div class="fsr-mic">${MICRO.map((m) => `<div class="fsr-mr"><span>${x.n[m.k]} <small>${fmt(m.k, m.v)}${UNIT[m.k]}</small></span>${bar(m.p, "var(--coral)")}<b>${m.p}%</b></div>`).join("")}</div><p class="sn-small">${x.dvnote}</p></section>` : "";
    return head + `<div class="fsr-top">${dash}${hs}</div>` + plate + mic + (st.questions.length ? `<p class="sn-small"><b>${x.qs}</b><br>${st.questions.map(esc).join("<br>")}</p>` : "") +
      (rec ? `<p><a class="btn btn-sm" href="#/recipe/${encodeURIComponent(rec.slug)}">${x.recipe}: ${esc(World.recipeName(rec, lang()))}</a></p>` : "") + `<p class="sn-small">${x.disc}</p>`;
  }

  const defer = () => setTimeout(() => { const f = st.lf; draw(); if (f) { const e = root && root.querySelector(`[${f.a}="${f.v}"]`); if (e) e.focus(); } }, 0);
  function bind() {
    const on = (id, fn) => { const e = $(id, root); if (e) e.onclick = fn; };
    on("#fs-cam", openCam); on("#fs-x", () => { stop(); st.step = "home"; draw(); }); on("#fs-cap", capture); on("#fs-an", analyse);
    on("#fs-man", () => { dropPhoto(); Object.assign(st, { step: "results", meal: "", cuisine: "", aiConf: "", comps: [], questions: [], servings: 1, msg: "" }); draw(); });
    on("#fs-new", () => { dropPhoto(); Object.assign(st, { step: "home", imgs: [], note: "", meal: "", comps: [], questions: [], servings: 1, msg: "" }); draw(); });
    on("#fs-addb", addFood); const inp = $("#fs-in", root); if (inp) inp.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); addFood(); } };
    const f = $("#fs-file", root); if (f) f.onchange = (e) => addFile(e.target.files[0]);
    const nt = $("#fs-note", root); if (nt) nt.oninput = (e) => { st.note = e.target.value; };
    root.querySelectorAll("[data-rmi]").forEach((b) => (b.onclick = () => { URL.revokeObjectURL(st.imgs[+b.dataset.rmi].url); st.imgs.splice(+b.dataset.rmi, 1); draw(); }));
    root.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => { st.comps = st.comps.filter((c) => c.id !== b.dataset.del); draw(); }));
    root.querySelectorAll("[data-g]").forEach((i) => (i.onchange = () => { const c = st.comps.find((k) => k.id === i.dataset.g), v = parseFloat(i.value); if (c && v > 0 && v <= 5000) c.grams = v; defer(); }));
    const sv = $("#fs-sv", root); if (sv) sv.onchange = (e) => { st.servings = Math.max(0.25, parseFloat(e.target.value) || 1); draw(); };
    const v = $("#fs-v", root); if (v && st.stream) v.srcObject = st.stream;
  }
  const backend = () => { const d = SC.dm; return d && d.invoke ? d : null; };
  const errText = (r, x) => { const s = r.error && r.error.context && r.error.context.status, m = (r.error && r.error.message) || ""; return s === 429 ? x.quota : s === 503 ? x.noai : s === 401 ? x.login : /^(provider_error|analysis_failed)/.test(m) ? x.fail + " [" + m.slice(0, 160) + "]" : x.fail; };
  async function addFood() {
    const x = t(), d = backend(), inp = $("#fs-in", root), v = inp ? inp.value.trim() : ""; if (!v) return; st.msg = "";
    if (!d) { st.msg = x.nobk; return draw(); } if (!d.me()) { st.msg = x.login; return draw(); }
    st.busy = x.est; draw();
    try { const r = await d.invoke("estimate-foods", { foods: [{ name: v }] }); if (r.error) st.msg = errText(r, x); else { const c = ((r.data && r.data.components) || [])[0]; if (c) st.comps.push(fromServer(c)); else st.msg = x.fail; } } catch (e) { st.msg = x.fail; }
    st.busy = ""; draw();
  }
  async function openCam() {
    const x = t(); st.msg = ""; if (!window.isSecureContext || !navigator.mediaDevices) { st.msg = window.isSecureContext ? x.nocam : x.insecure; return draw(); }
    try { st.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false }); st.step = "camera"; draw(); } catch (e) { st.msg = e.name === "NotAllowedError" ? x.denied : x.nocam; st.step = "home"; draw(); }
  }
  function capture() { const v = $("#fs-v", root); if (!v || !v.videoWidth) return; const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d").drawImage(v, 0, 0); c.toBlob((b) => { stop(); if (b) st.imgs = [{ blob: b, url: URL.createObjectURL(b) }]; st.step = "home"; draw(); }, "image/jpeg", 0.9); }
  async function addFile(f) { st.msg = ""; if (!f) return; if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 10485760) { st.msg = t().bad; return draw(); } try { (await createImageBitmap(f)).close(); st.imgs = [{ blob: f, url: URL.createObjectURL(f) }]; } catch (e) { st.msg = t().bad; } draw(); }
  async function toJpeg(blob) { const bm = await createImageBitmap(blob), k = Math.min(1, 1280 / Math.max(bm.width, bm.height)), c = document.createElement("canvas"); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k); c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height); const d = c.toDataURL("image/jpeg", 0.8); return d.slice(d.indexOf(",") + 1); }
  async function analyse() {
    const x = t(), d = backend(); st.msg = ""; if (!d) { st.msg = x.nobk; return draw(); } if (!d.me()) { st.msg = x.login; return draw(); }
    st.busy = x.busy; draw();
    try {
      const images = []; for (const m of st.imgs) images.push({ mime: "image/jpeg", data: await toJpeg(m.blob) });
      const r = await d.invoke("analyze-meal", { images, note: st.note.trim() });
      if (r.error) { st.msg = errText(r, x); st.busy = ""; return draw(); }
      const j = r.data || {}; if (!j.components || !j.components.length) { st.msg = x.fail; st.busy = ""; return draw(); }
      st.meal = (j.meal && j.meal.name) || ""; st.cuisine = (j.meal && j.meal.cuisine) || ""; st.aiConf = (j.meal && j.meal.confidence) || ""; st.questions = j.questions || [];
      st.comps = j.components.map(fromServer); st.servings = 1;
      dropPhoto(); st.photo = st.imgs[0].url; st.imgs = []; st.busy = ""; st.step = "results"; draw();   // the photo stays in this browser tab only (for the pins) and is released when you leave
    } catch (e) { st.msg = x.fail; st.busy = ""; draw(); }
  }
  new MutationObserver(mount).observe(document.getElementById("app"), { childList: true, subtree: true }); mount();
})();
