"use strict";
/* Convite interativo — tudo roda no navegador. Nenhuma resposta é enviada a servidor. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Estado: guarda todas as respostas durante a navegação ---------- */
const state = {
  date: "", time: "", timeOther: "", saudade: 3,
  plan: "", idea: "", fav1: "", fav2: "",
  acts: [], actOther: "", energy: "", terms: false
};
const ORDER = ["invite", "date", "saudade", "plan", "likes", "profile", "contract", "report"];
let current = "invite";
let reviewing = false;

/* ---------- Navegação entre telas ---------- */
function go(id) {
  $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  current = id;
  const idx = ORDER.indexOf(id);
  const pct = id === "decline" ? 0 : (idx / (ORDER.length - 1)) * 100;
  $("#bar").style.width = pct + "%";
  document.documentElement.style.setProperty("--g", (Math.max(idx, 0) / (ORDER.length - 1)).toFixed(2));
  $("#backBtn").hidden = id === "invite";
  $("#toReportBtn").hidden = !(reviewing && id !== "report");
  if (id === "invite") resetRunners();
  if (id === "report") { reviewing = false; $("#toReportBtn").hidden = true; buildReport(); }
  window.scrollTo(0, 0);
  const h = $("h1, h2", $("#" + id));
  if (h) h.focus({ preventScroll: true });
}
const next = () => go(ORDER[ORDER.indexOf(current) + 1]);
$("#backBtn").onclick = () => go(current === "decline" ? "invite" : ORDER[Math.max(ORDER.indexOf(current) - 1, 0)]);
$("#toReportBtn").onclick = () => go("report");

/* ---------- Tela 1: botões fugitivos (mouse e toque) ---------- */
const taunts = [
  "Tentativa de cancelamento detectada.",
  "O sistema não reconhece essa resposta.",
  "Resposta suspeita. Tente novamente.",
  "Alexia, colabore com a ciência.",
  "Esse botão está fazendo hora extra para fugir de você."
];
let tries = 0;

function flee(btn) {
  const yes = $("#yes").getBoundingClientRect();
  if (!btn.dataset.fled) {
    // Reserva o espaço original para o layout não pular
    const r = btn.getBoundingClientRect();
    btn.parentElement.style.width = r.width + "px";
    btn.parentElement.style.height = r.height + "px";
    btn.style.width = r.width + "px";
    btn.style.position = "fixed";
    btn.style.zIndex = "5";
    btn.dataset.fled = "1";
  }
  const w = btn.offsetWidth, h = btn.offsetHeight;
  let x, y, ok = false;
  for (let i = 0; i < 12 && !ok; i++) { // evita cair em cima do botão "Óbvio"
    x = 8 + Math.random() * Math.max(innerWidth - w - 16, 0);
    y = 64 + Math.random() * Math.max(innerHeight - h - 80, 0);
    ok = x + w < yes.left - 6 || x > yes.right + 6 || y + h < yes.top - 6 || y > yes.bottom + 6;
  }
  btn.style.left = x + "px";
  btn.style.top = y + "px";
  tries++;
  if (tries >= 3) $("#taunt").textContent = taunts[Math.floor(Math.random() * taunts.length)];
}
function resetRunners() {
  tries = 0;
  $("#taunt").textContent = "";
  $$(".run").forEach(b => {
    b.removeAttribute("style");
    delete b.dataset.fled;
    b.parentElement.removeAttribute("style");
  });
}
$$(".run").forEach(b => {
  b.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") flee(b); });
  b.addEventListener("pointerdown", () => flee(b)); // toque: foge antes do clique
  b.addEventListener("click", e => { e.preventDefault(); flee(b); }); // teclado também
});
addEventListener("resize", () => $$(".run[data-fled]").forEach(b => {
  const r = b.getBoundingClientRect();
  if (r.right > innerWidth || r.bottom > innerHeight) flee(b);
}));
$("#yes").onclick = next;

/* ---------- Recusa de verdade (discreta e sem constrangimento) ---------- */
$("#declineLink").onclick = () => go("decline");
$("#undoDecline").onclick = () => go("invite");
$("#copyDecline").onclick = () => {
  const msg = $("#declineMsg").value.trim();
  copyText("Resposta ao convite: dessa vez não vai dar." + (msg ? "\n" + msg : ""), $("#declineStatus"));
};

/* ---------- Utilitário: seleção por chips ---------- */
function chips(sel, { multi = false, get, set }) {
  const box = $(sel);
  const paint = () => {
    const v = get();
    $$(".chip", box).forEach(c => c.setAttribute("aria-pressed", multi ? v.includes(c.dataset.v) : v === c.dataset.v));
  };
  box.addEventListener("click", e => {
    const c = e.target.closest(".chip");
    if (!c) return;
    set(c.dataset.v);
    paint();
  });
  return paint;
}

/* ---------- Tela 2: data e horário ---------- */
const paintDate = chips("#dateChips", { get: () => state.date, set: v => state.date = v });
const paintTime = chips("#timeChips", {
  get: () => state.time,
  set: v => { state.time = v; syncTimeOther(); }
});
function syncTimeOther() { $("#timeOtherWrap").hidden = state.time !== "Outro horário"; }
$("#timeOther").oninput = e => state.timeOther = e.target.value;
$("#dateNext").onclick = () => {
  const err = $("#dateErr");
  if (!state.date) return err.textContent = "Escolha uma data para continuar.";
  if (!state.time) return err.textContent = "Escolha um horário para continuar.";
  if (state.time === "Outro horário" && !state.timeOther.trim()) return err.textContent = "Digite o horário que você prefere.";
  err.textContent = "";
  next();
};

/* ---------- Tela 3: medidor de saudade ---------- */
const levels = [
  ["Saudade inexistente", "Dados insuficientes para justificar qualquer encontro."],
  ["Uma saudade discreta", "Uma saudade que pode ser disfarçada em público."],
  ["Saudade moderada", "Situação sob controle, mas com indícios preocupantes."],
  ["Saudade considerável", "O sistema detectou saudade acima da média."],
  ["Saudade absurda", "ALERTA: níveis de saudade incompatíveis com a manutenção da dignidade."]
];
function paintSaudade() {
  const [name, msg] = levels[state.saudade - 1];
  $("#saudadeRange").value = state.saudade;
  $("#lvlName").textContent = `Nível ${state.saudade}: ${name}`;
  $("#lvlMsg").textContent = msg;
}
$("#saudadeRange").oninput = e => { state.saudade = +e.target.value; paintSaudade(); };
$("#saudadeNext").onclick = next;

/* ---------- Tela 4: estratégia ---------- */
function paintPlan() {
  $$("[data-plan]").forEach(c => c.setAttribute("aria-pressed", c.dataset.plan === state.plan));
  $("#ideaWrap").hidden = state.plan !== "pitacos";
}
$$("[data-plan]").forEach(c => c.onclick = () => { state.plan = c.dataset.plan; $("#planErr").textContent = ""; paintPlan(); });
$("#idea").oninput = e => state.idea = e.target.value;
$("#planNext").onclick = () => state.plan ? next() : $("#planErr").textContent = "Escolha uma das opções para continuar.";

/* ---------- Tela 5: duas coisas favoritas (resposta totalmente livre) ---------- */
$("#fav1").oninput = e => state.fav1 = e.target.value;
$("#fav2").oninput = e => state.fav2 = e.target.value;
$("#likesNext").onclick = next;

/* ---------- Tela 6: perfil do rolê ---------- */
const paintActs = chips("#actChips", {
  multi: true,
  get: () => state.acts,
  set: v => {
    state.acts = state.acts.includes(v) ? state.acts.filter(a => a !== v) : [...state.acts, v];
    syncActOther();
  }
});
const paintEnergy = chips("#energyChips", { get: () => state.energy, set: v => state.energy = v });
function syncActOther() { $("#actOtherWrap").hidden = !state.acts.includes("Tenho outra ideia"); }
$("#actOther").oninput = e => state.actOther = e.target.value;
$("#profileNext").onclick = next;

/* ---------- Tela 7: contrato ---------- */
$("#terms").onchange = e => { state.terms = e.target.checked; if (state.terms) $("#termsErr").textContent = ""; };
$("#signBtn").onclick = () => {
  if (!state.terms) return $("#termsErr").textContent = "Marque a caixa de aceite para assinar.";
  const s = $("#signed");
  s.classList.remove("show"); void s.offsetWidth; s.classList.add("show");
  setTimeout(next, reduceMotion ? 100 : 1100);
};

/* ---------- Tela 8: relatório ---------- */
const timeLabel = () => state.time === "Outro horário" ? `Outro horário: ${state.timeOther}` : state.time;
function reportRows() {
  const acts = state.acts.map(a => a === "Tenho outra ideia" && state.actOther.trim() ? `Outra ideia: ${state.actOther.trim()}` : a);
  return [
    ["Data escolhida", state.date || "—"],
    ["Horário escolhido", timeLabel() || "—"],
    ["Nível de saudade", `${state.saudade}/5 — ${levels[state.saudade - 1][0]}`],
    ["Estratégia", state.plan === "surpresa" ? "Prefere surpresa (confia no responsável)" : state.plan === "pitacos" ? "Quer dar pitacos" : "—"],
    ["Ideia de rolê", state.idea.trim() || "Nenhuma informada"],
    ["Duas coisas favoritas", [state.fav1.trim(), state.fav2.trim()].filter(Boolean).join(" e ") || "Não informadas (sujeito a auditoria)"],
    ["Preferências de atividades", acts.join("; ") || "Não informadas"],
    ["Nível de disposição", state.energy || "Não informado"],
    ["Termos humorísticos", state.terms ? "Aceitos (entendimento parcial)" : "Pendentes"]
  ];
}
// Índice fictício: soma simples e humorística das respostas
function viability() {
  const energyScore = { "Estou pronta para viver.": 10, "Depende do horário.": 6, "Preciso de incentivos.": 5, "Se for para sair, que seja por um bom motivo.": 6, "Preferia receber o rolê em casa.": 4 };
  let v = 52 + state.saudade * 5 + (energyScore[state.energy] || 3);
  v += Math.min(state.acts.length, 3) * 2 + (state.fav1.trim() && state.fav2.trim() ? 3 : 0) + (state.terms ? 2 : 0);
  return Math.min(v, 99);
}
function viabilityMsg(v) {
  if (v >= 92) return "O sistema detectou potencial para um fim de semana memorável.";
  if (v >= 84) return "A operação está promissora. Recomenda-se manter a calma e escolher um lugar.";
  if (v >= 76) return "O projeto apresenta boas perspectivas, mas depende da confirmação humana.";
  return "O comitê aprovou a continuidade das negociações.";
}
function buildReport() {
  const grid = $("#reportGrid");
  grid.textContent = "";
  reportRows().forEach(([k, v]) => {
    const d = document.createElement("dl"); d.className = "rcard";
    const dt = document.createElement("dt"); dt.textContent = k;
    const dd = document.createElement("dd"); dd.textContent = v;
    d.append(dt, dd); grid.append(d);
  });
  const v = viability();
  $("#idxMsg").textContent = viabilityMsg(v);
  $("#idxFill").style.width = "0";
  requestAnimationFrame(() => requestAnimationFrame(() => $("#idxFill").style.width = v + "%"));
  const out = $("#idxNum");
  if (reduceMotion) return out.textContent = v;
  const t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / 1000, 1);
    out.textContent = Math.round(v * p);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
function reportText() {
  return ["RELATÓRIO CONFIDENCIAL — OPERAÇÃO FIM DE SEMANA", "Participante: Alexia", ""]
    .concat(reportRows().map(([k, v]) => `${k}: ${v}`))
    .concat(["", `Índice de viabilidade do rolê: ${viability()}% (fictício)`, viabilityMsg(viability())]).join("\n");
}

/* Copiar com tratamento de erro: se falhar, mostra o texto para copiar à mão */
async function copyText(text, statusEl) {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.append(ta); ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (!ok) throw new Error("copy failed");
    }
    statusEl.textContent = "Copiado! Agora é só colar e enviar para mim, se quiser.";
  } catch (err) {
    statusEl.textContent = "Não consegui copiar automaticamente. Selecione o texto abaixo e copie manualmente.";
    const fb = $("#fallbackText");
    fb.value = text; fb.hidden = false; fb.focus(); fb.select();
  }
}
$("#copyBtn").onclick = () => copyText(reportText(), $("#copyStatus"));
$("#reviewBtn").onclick = () => { reviewing = true; $("#fallbackText").hidden = true; go("date"); }; // as respostas ficam salvas no objeto state

/* ---------- Brilhos flutuantes (decorativos) ---------- */
(function sparkles() {
  const box = $("#sparkles");
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.textContent = i % 3 === 0 ? "✦" : i % 3 === 1 ? "✧" : "❦";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = 100 + Math.random() * 20 + "%";
    s.style.fontSize = 10 + Math.random() * 16 + "px";
    s.style.animationDuration = 22 + Math.random() * 30 + "s";
    s.style.animationDelay = -Math.random() * 40 + "s";
    box.append(s);
  }
})();

/* ---------- Início ---------- */
paintDate(); paintTime(); paintActs(); paintEnergy(); paintSaudade(); paintPlan(); syncTimeOther(); syncActOther();
go("invite");
