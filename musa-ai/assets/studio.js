// Musa AI — estudio. Imágenes y texto vía Pollinations (gratis, sin key); video vía /api (MuAPI).
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const IMG_BASE = "https://image.pollinations.ai/prompt/";
  const TEXT_BASE = "https://text.pollinations.ai/";
  const QUALITY = "candid instagram photo, photorealistic, natural skin texture, 35mm lens, sharp focus, soft natural light, fully clothed, safe for work";

  const SCENES = [
    ["Gym", "modern gym with weights, sportswear"],
    ["Playa", "tropical beach at golden hour, summer outfit"],
    ["Café", "aesthetic coffee shop, morning light"],
    ["Ciudad de noche", "city street at night with neon lights"],
    ["París", "paris street with eiffel tower in the background"],
    ["Estudio", "professional photo studio, plain backdrop"],
    ["Selfie en auto", "inside a car, daylight, selfie angle"],
    ["Restaurante", "elegant restaurant dinner, warm light"],
    ["Montaña", "mountain hiking trail, outdoor gear"],
    ["Casa", "cozy modern apartment living room"],
    ["Oficina", "modern office with laptop, business casual"],
    ["Evento", "red carpet event, flash photography"]
  ];

  // Filtro de seguridad: sin contenido sexual, sin menores, sin personas reales.
  const BLOCKED = /\b(nud[eoa]s?|naked|desnud[oa]s?|nsfw|porn\w*|sex\w*|xxx|topless|lingerie|lencer[ií]a|onlyfans|erotic\w*|er[oó]tic\w*|hentai|fetish\w*|teen\w*|child\w*|kid|kids|niñ[oa]s?|menor(es)? de edad|underage|loli\w*|schoolgirl|colegiala|celebrity|famos[oa]|deepfake|face ?swap)\b/i;

  // ---------- Estado ----------
  const KEY = "musa-ai-v1";
  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
  };
  const state = Object.assign({ influencers: [], activeId: null, gallery: [], muapiKey: "" }, load() || {});
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* sin almacenamiento: sigue funcionando en memoria */ }
  };
  const uid = () => Math.random().toString(36).slice(2, 10);
  const randSeed = () => Math.floor(Math.random() * 2_000_000_000);
  const active = () => state.influencers.find((i) => i.id === state.activeId) || null;

  const imgUrl = (prompt, w, h, seed) =>
    `${IMG_BASE}${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${seed}&model=flux&nologo=true&safe=true`;

  const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 2800);
  };

  const guard = (...texts) => {
    if (texts.some((t) => t && BLOCKED.test(t))) {
      toast("Solicitud bloqueada: solo personajes ficticios, adultos y contenido seguro para redes.");
      return false;
    }
    return true;
  };

  // ---------- Tabs ----------
  const showTab = (name) => {
    $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    $$(".panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${name}`));
    if (name === "shoot") renderShoot();
    if (name === "video") renderVideoSources();
    if (name === "gallery") renderGallery();
  };
  $$(".tab-btn").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

  // ---------- Tiles ----------
  function tile({ url, type = "image", w = 3, h = 4, label, buttons = [] }) {
    const el = document.createElement("div");
    el.className = "tile";
    el.style.setProperty("--ar", `${w}/${h}`);
    const media = document.createElement("div");
    media.className = "media";
    if (type === "video") {
      const v = document.createElement("video");
      Object.assign(v, { src: url, controls: true, loop: true, playsInline: true, muted: true });
      v.addEventListener("loadeddata", () => el.classList.add("loaded"));
      media.append(v);
    } else {
      const img = new Image();
      img.alt = "Imagen generada";
      img.onload = () => el.classList.add("loaded");
      img.onerror = () => { el.classList.add("loaded"); media.innerHTML = '<p class="muted" style="padding:16px">No se pudo generar. Intenta de nuevo.</p>'; };
      img.src = url;
      media.append(img);
    }
    el.append(media);
    if (label) el.insertAdjacentHTML("beforeend", `<span class="label">${label}</span>`);
    if (buttons.length) {
      const bar = document.createElement("div");
      bar.className = "bar";
      buttons.forEach(([text, fn, primary]) => {
        const b = document.createElement("button");
        b.className = `btn ${primary ? "btn-primary" : ""}`;
        b.textContent = text;
        b.addEventListener("click", (e) => { e.stopPropagation(); fn(b, el); });
        bar.append(b);
      });
      el.append(bar);
    }
    return el;
  }

  async function download(url, name) {
    try {
      const blob = await (await fetch(url)).blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch {
      window.open(url, "_blank", "noopener");
    }
  }

  function addToGallery(item) {
    state.gallery.unshift({ id: uid(), ts: Date.now(), fav: false, ...item });
    state.gallery = state.gallery.slice(0, 300);
    save();
  }

  // ---------- Crear influencer ----------
  $("#c-age").addEventListener("input", (e) => ($("#c-age-val").textContent = e.target.value));

  function identityFromForm() {
    const v = (id) => $(id).value.trim();
    const identity = [
      `${v("#c-age")} year old ${v("#c-ethnicity")} ${v("#c-gender")}`,
      v("#c-hair"), v("#c-eyes"), v("#c-body"), v("#c-extra")
    ].filter(Boolean).join(", ");
    return { identity, niche: v("#c-niche"), name: v("#c-name") || "Mi musa" };
  }

  function renderInfluencers() {
    const list = $("#influencerList");
    list.innerHTML = "";
    state.influencers.forEach((inf) => {
      const c = document.createElement("div");
      c.className = `inf-card ${inf.id === state.activeId ? "active" : ""}`;
      c.innerHTML = `<img alt="${inf.name}" src="${inf.portrait}"><div>${inf.name}</div>`;
      c.title = "Clic para seleccionar · doble clic para borrar";
      c.addEventListener("click", () => { state.activeId = inf.id; save(); renderInfluencers(); });
      c.addEventListener("dblclick", () => {
        if (!confirm(`¿Borrar a ${inf.name}?`)) return;
        state.influencers = state.influencers.filter((i) => i.id !== inf.id);
        if (state.activeId === inf.id) state.activeId = state.influencers[0]?.id || null;
        save(); renderInfluencers();
      });
      list.append(c);
    });
    const a = active();
    $("#activeLabel").textContent = a ? `Influencer activo: ${a.name}` : "Sin influencer seleccionado";
  }

  $("#c-generate").addEventListener("click", () => {
    const f = identityFromForm();
    if (!guard(f.identity, f.name)) return;
    const box = $("#c-results");
    box.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const seed = randSeed();
      const prompt = `portrait photo of a ${f.identity}, ${f.niche} influencer, looking at camera, neutral background, ${QUALITY}`;
      const url = imgUrl(prompt, 768, 1024, seed);
      box.append(tile({
        url, label: `Propuesta ${i + 1}`,
        buttons: [["🔒 Fijar identidad", () => {
          const inf = { id: uid(), name: f.name, identity: f.identity, niche: f.niche, seed, portrait: url };
          state.influencers.push(inf);
          state.activeId = inf.id;
          addToGallery({ type: "image", url, prompt, seed, w: 768, h: 1024, infId: inf.id });
          save(); renderInfluencers();
          toast(`${inf.name} creado. Ve a Sesión de fotos.`);
        }, true]]
      }));
    }
  });

  // ---------- Sesión de fotos ----------
  let scene = SCENES[0];
  SCENES.forEach((s, i) => {
    const b = document.createElement("button");
    b.className = `chip ${i === 0 ? "active" : ""}`;
    b.textContent = s[0];
    b.addEventListener("click", () => {
      scene = s;
      $$("#s-scenes .chip").forEach((c) => c.classList.toggle("active", c === b));
    });
    $("#s-scenes").append(b);
  });

  function renderShoot() {
    const has = !!active();
    $("#shoot-need").hidden = has;
    $("#shoot-form").hidden = !has;
  }

  function imageButtons(item) {
    return [
      ["⬇️", () => download(item.url, `musa-${item.seed}.jpg`)],
      ["✨ HD", () => {
        const scale = Math.min(2, 2048 / Math.max(item.w, item.h));
        const w = Math.round(item.w * scale), h = Math.round(item.h * scale);
        const hd = { ...item, url: imgUrl(item.prompt, w, h, item.seed), w, h, hd: true };
        addToGallery(hd);
        toast("Versión HD generándose. La verás en la Galería.");
      }],
      ["🎬", () => { videoSource = item.url; showTab("video"); }]
    ];
  }

  $("#s-generate").addEventListener("click", () => {
    const inf = active();
    if (!inf) return;
    const extra = $("#s-extra").value.trim();
    if (!guard(extra)) return;
    const [w, h] = $("#s-format").value.split("x").map(Number);
    const count = Number($("#s-count").value);
    const outfit = $("#s-outfit").value;
    const box = $("#s-results");
    box.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const seed = inf.seed + i;
      const prompt = [`photo of the same person: ${inf.identity}`, `${inf.niche} influencer`, outfit, $("#s-pose").value, scene[1], extra, QUALITY]
        .filter(Boolean).join(", ");
      const item = { type: "image", url: imgUrl(prompt, w, h, seed), prompt, seed, w, h, infId: inf.id };
      addToGallery(item);
      box.append(tile({ url: item.url, w, h, buttons: imageButtons(item) }));
    }
  });

  // ---------- Video ----------
  let videoSource = null;
  $("#v-key").value = state.muapiKey || "";
  $("#v-key").addEventListener("change", (e) => { state.muapiKey = e.target.value.trim(); save(); });

  function renderVideoSources() {
    const box = $("#v-sources");
    box.innerHTML = "";
    const imgs = state.gallery.filter((g) => g.type === "image").slice(0, 24);
    if (!imgs.length) {
      box.innerHTML = '<div class="empty" style="grid-column:1/-1">Genera fotos primero para usarlas como base del video.</div>';
      return;
    }
    if (!videoSource || !imgs.some((g) => g.url === videoSource)) videoSource = imgs[0].url;
    imgs.forEach((g) => {
      const t = tile({ url: g.url, w: g.w, h: g.h });
      if (g.url === videoSource) t.classList.add("selected");
      t.style.cursor = "pointer";
      t.addEventListener("click", () => {
        videoSource = g.url;
        $$("#v-sources .tile").forEach((x) => x.classList.toggle("selected", x === t));
      });
      box.append(t);
    });
  }

  $("#v-generate").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const prompt = $("#v-prompt").value.trim();
    if (!videoSource) return toast("Selecciona una foto de origen.");
    if (!prompt) return toast("Describe el movimiento del video.");
    if (!guard(prompt)) return;
    const status = $("#v-status");
    btn.disabled = true;
    status.textContent = "Enviando…";
    try {
      const res = await fetch("api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-muapi-key": state.muapiKey || "" },
        body: JSON.stringify({
          model: $("#v-model").value, prompt, image_url: videoSource,
          duration: Number($("#v-duration").value), aspect_ratio: $("#v-ar").value
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      const started = Date.now();
      while (Date.now() - started < 8 * 60_000) {
        status.textContent = `Generando… ${Math.round((Date.now() - started) / 1000)} s`;
        await new Promise((r) => setTimeout(r, 5000));
        const s = await fetch(`api/status?id=${encodeURIComponent(data.id)}`, { headers: { "x-muapi-key": state.muapiKey || "" } });
        const sd = await s.json().catch(() => ({}));
        if (sd.status === "failed") throw new Error(sd.error || "La generación falló.");
        if (sd.url) {
          const [w, h] = $("#v-ar").value.split(":").map(Number);
          addToGallery({ type: "video", url: sd.url, prompt, w, h });
          $("#v-results").prepend(tile({ url: sd.url, type: "video", w, h, buttons: [["⬇️ Descargar", () => download(sd.url, "musa-video.mp4")]] }));
          status.textContent = "¡Listo! También está en tu Galería.";
          return;
        }
      }
      throw new Error("Tardó demasiado. Revisa tu Galería más tarde.");
    } catch (err) {
      status.textContent = "";
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- Copies ----------
  $("#k-generate").addEventListener("click", async (e) => {
    const topic = $("#k-topic").value.trim();
    if (!topic) return toast("Escribe de qué trata la publicación.");
    if (!guard(topic)) return;
    const inf = active();
    const persona = inf ? `${inf.name}, a ${inf.niche} influencer` : "a lifestyle influencer";
    const prompt = `You are ${persona}. Write a ${$("#k-network").value} post in ${$("#k-lang").value}, tone: ${$("#k-tone").value}. ` +
      `Topic: ${topic}. Give: 1) a scroll-stopping hook line, 2) the caption (max 90 words, with a few emojis), 3) a call to action, 4) 12 relevant hashtags. ` +
      `Keep it safe for work. Plain text, no markdown headings.`;
    const out = $("#k-output");
    const btn = e.currentTarget;
    btn.disabled = true;
    out.textContent = "Escribiendo…";
    try {
      const res = await fetch(TEXT_BASE + encodeURIComponent(prompt) + `?seed=${randSeed()}`);
      if (!res.ok) throw new Error();
      out.textContent = (await res.text()).trim();
    } catch {
      out.textContent = "No se pudo generar el copy. Intenta de nuevo en unos segundos.";
    } finally {
      btn.disabled = false;
    }
  });
  $("#k-copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText($("#k-output").textContent); toast("Copiado."); } catch { toast("No se pudo copiar."); }
  });

  // ---------- Galería ----------
  let filter = "all";
  $$("#g-filter .chip").forEach((c) => c.addEventListener("click", () => {
    filter = c.dataset.f;
    $$("#g-filter .chip").forEach((x) => x.classList.toggle("active", x === c));
    renderGallery();
  }));

  function renderGallery() {
    const box = $("#g-results");
    box.innerHTML = "";
    const items = state.gallery.filter((g) => filter === "all" || (filter === "fav" ? g.fav : g.type === filter));
    if (!items.length) {
      box.innerHTML = '<div class="empty" style="grid-column:1/-1">Aquí aparecerá todo lo que generes.</div>';
      return;
    }
    items.forEach((g) => {
      const buttons = g.type === "image" ? imageButtons(g) : [["⬇️", () => download(g.url, "musa-video.mp4")]];
      buttons.push([g.fav ? "★" : "☆", (b) => { g.fav = !g.fav; b.textContent = g.fav ? "★" : "☆"; save(); }]);
      buttons.push(["🗑", (_, el) => { state.gallery = state.gallery.filter((x) => x.id !== g.id); save(); el.remove(); }]);
      box.append(tile({ url: g.url, type: g.type, w: g.w, h: g.h, label: g.hd ? "HD" : g.type === "video" ? "Video" : "", buttons }));
    });
  }

  renderInfluencers();
})();
