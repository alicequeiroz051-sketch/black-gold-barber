/* ==========================================================
   BLACK GOLD BARBER CLUB — comportamento do site
   ========================================================== */

/* ---------- PERSONALIZE AQUI ---------- */
const CONFIG = {
  shopName: "Black Gold Barber Club",
  // ATENÇÃO: número FICTÍCIO (placeholder). Troque pelo WhatsApp real da barbearia,
  // só dígitos, com código do país e DDD. Exemplo: "5581999999999".
  whatsappNumber: "5500000000000",
  phoneDisplay: "(00) 00000-0000",
  social: {
    instagram: "https://www.instagram.com/",   // troque pelo perfil real
    facebook: "https://www.facebook.com/"      // troque pela página real
  },
  hours: { start: "09:00", end: "20:00", intervalMinutes: 30, closedWeekdays: [0, 1] }, // 0 = domingo, 1 = segunda
  barbers: ["Rafael Monteiro", "Diego Alcântara", "Thiago Vasconcelos"],
  anyBarber: "Qualquer profissional",
  // Horários ocupados simulados, só para a demonstração. Use false para desligar.
  simulateBusySlots: true,
  storageKey: "black-gold-demo-bookings"
};
/* -------------------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

document.documentElement.classList.add("js");
if (window.lucide) window.lucide.createIcons();

/* ---------- Imagens com falha: não mostra ícone quebrado ---------- */
$$("img").forEach((img) => {
  const markBroken = () => img.classList.add("is-broken");
  img.addEventListener("error", markBroken);
  if (img.complete && img.naturalWidth === 0) markBroken();
});

/* ---------- Contatos configuráveis ---------- */
$$("[data-config='phone']").forEach((el) => (el.textContent = CONFIG.phoneDisplay));
$$("[data-social]").forEach((el) => (el.href = CONFIG.social[el.dataset.social] || "#"));
const whatsappUrl = (text = "") =>
  `https://wa.me/${CONFIG.whatsappNumber}` + (text ? `?text=${encodeURIComponent(text)}` : "");
$$("[data-whatsapp]").forEach((el) => {
  el.href = whatsappUrl(`Olá! Vim pelo site da ${CONFIG.shopName} (demonstração).`);
});

/* ---------- Menu mobile e cabeçalho ---------- */
const header = $("#header");
const nav = $("#nav");
const burger = $("#burger");

function setMenu(open) {
  nav.classList.toggle("is-open", open);
  header.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}
burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
$$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); }
});
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Entrada suave ao rolar ---------- */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = $$(".section__head, .card, .barber, .gallery__item, blockquote, .values li, .about__text, .map, .price-list li");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => {
    // atraso escalonado entre irmãos (máx. 4 passos), para entrada em sequência
    const i = [...el.parentElement.children].indexOf(el) % 4;
    el.style.setProperty("--d", `${i * 0.08}s`);
    el.classList.add("reveal");
    io.observe(el);
  });
}

/* ---------- Serviços: lista de preços e select do formulário ---------- */
const serviceCards = $$("#services .card");
const serviceSelect = $("#service");
const priceList = $("#price-list");

serviceSelect.add(new Option("Selecione um serviço", ""));
serviceCards.forEach((card) => {
  const { service, price } = card.dataset;
  serviceSelect.add(new Option(`${service} (${price})`, service));
  const li = document.createElement("li");
  li.innerHTML = '<span class="price-list__name"></span><span class="price-list__dots"></span><span class="price-list__price"></span>';
  li.children[0].textContent = service;
  li.children[2].textContent = price;
  priceList.append(li);
});

/* ---------- Agendamento ---------- */
const form = $("#booking-form");
const summary = $("#summary");
const dateInput = $("#date");
const barberSelect = $("#barber");
const slotsBox = $("#slots");
let selectedTime = "";

const pad = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISODate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const formatDateBR = (s) => parseISODate(s).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

dateInput.min = toISODate(new Date());

function buildTimes() {
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const times = [];
  for (let m = toMin(CONFIG.hours.start); m < toMin(CONFIG.hours.end); m += CONFIG.hours.intervalMinutes) {
    times.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return times;
}
const TIMES = buildTimes();

/* Armazenamento local (só demonstração, não sincroniza entre aparelhos) */
function loadBookings() {
  try { return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || []; } catch { return []; }
}
function saveBooking(b) {
  try { localStorage.setItem(CONFIG.storageKey, JSON.stringify([...loadBookings(), b])); } catch { /* storage indisponível */ }
}

/* Ocupação simulada, determinística por data/horário/profissional */
function seededBusy(date, time, barber) {
  if (!CONFIG.simulateBusySlots) return false;
  let h = 7;
  for (const ch of `${date}|${time}|${barber}`) h = (h * 31 + ch.charCodeAt(0)) % 1009;
  return h % 100 < 28;
}
function isSlotBusy(date, time, barber) {
  const saved = loadBookings().filter((b) => b.date === date && b.time === time);
  const busyFor = (name) => seededBusy(date, time, name) || saved.some((b) => b.barber === name);
  if (barber !== CONFIG.anyBarber) return busyFor(barber);
  const anyCount = saved.filter((b) => b.barber === CONFIG.anyBarber).length;
  return CONFIG.barbers.filter((n) => !busyFor(n)).length - anyCount <= 0;
}

function renderSlots() {
  selectedTime = "";
  slotsBox.innerHTML = "";
  setError("time", "");
  const date = dateInput.value;
  if (!date) { slotsBox.innerHTML = '<p class="slots__hint">Escolha uma data para ver os horários.</p>'; return; }
  const day = parseISODate(date);
  if (CONFIG.hours.closedWeekdays.includes(day.getDay())) {
    slotsBox.innerHTML = '<p class="slots__hint">A barbearia não abre neste dia. Escolha outra data.</p>';
    return;
  }
  const now = new Date();
  const isToday = date === toISODate(now);
  const barber = barberSelect.value;
  let available = 0;
  TIMES.forEach((time) => {
    const [h, m] = time.split(":").map(Number);
    const past = isToday && (h * 60 + m) <= now.getHours() * 60 + now.getMinutes();
    const busy = past || isSlotBusy(date, time, barber);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot";
    btn.textContent = time;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.disabled = busy;
    if (busy) btn.setAttribute("aria-label", `${time}, indisponível`);
    else available++;
    btn.addEventListener("click", () => {
      $$(".slot", slotsBox).forEach((s) => s.setAttribute("aria-checked", "false"));
      btn.setAttribute("aria-checked", "true");
      selectedTime = time;
      setError("time", "");
    });
    slotsBox.append(btn);
  });
  if (!available) slotsBox.innerHTML = '<p class="slots__hint">Não há horários livres nesta data. Tente outro dia ou outro profissional.</p>';
}

function setError(field, message) {
  const el = $(`#${field}-error`);
  if (!el) return;
  el.textContent = message;
  const wrap = el.closest(".field");
  if (wrap) wrap.classList.toggle("has-error", Boolean(message));
}

/* Máscara simples de telefone: (00) 00000-0000 */
$("#phone").addEventListener("input", (e) => {
  const d = e.target.value.replace(/\D/g, "").slice(0, 11);
  let out = d;
  if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length > 10 ? 7 : 6)}`;
  if (d.length > (d.length > 10 ? 7 : 6)) out += `-${d.slice(d.length > 10 ? 7 : 6)}`;
  e.target.value = out;
});

dateInput.addEventListener("change", renderSlots);
barberSelect.addEventListener("change", renderSlots);

function validate() {
  let first = null;
  const fail = (field, msg, id) => { setError(field, msg); first = first || $(id); };
  const name = $("#name").value.trim();
  const phoneDigits = $("#phone").value.replace(/\D/g, "");
  const date = dateInput.value;

  setError("name", ""); setError("phone", ""); setError("service", ""); setError("date", ""); setError("time", "");
  if (name.length < 3 || !/\s*\S+/.test(name)) fail("name", "Informe seu nome (mínimo 3 letras).", "#name");
  if (phoneDigits.length < 10 || phoneDigits.length > 11) fail("phone", "Informe um telefone com DDD, por exemplo (00) 00000-0000.", "#phone");
  if (!serviceSelect.value) fail("service", "Escolha um serviço.", "#service");
  if (!date) fail("date", "Escolha uma data.", "#date");
  else if (date < toISODate(new Date())) fail("date", "A data não pode ser anterior a hoje.", "#date");
  else if (CONFIG.hours.closedWeekdays.includes(parseISODate(date).getDay())) fail("date", "A barbearia não abre neste dia.", "#date");
  if (!selectedTime && date) fail("time", "Escolha um horário disponível.", ".slot:not(:disabled)");
  if (first) first.focus();
  return !first;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;
  const data = {
    name: $("#name").value.trim(),
    phone: $("#phone").value,
    service: serviceSelect.value,
    barber: barberSelect.value,
    date: dateInput.value,
    time: selectedTime,
    notes: $("#notes").value.trim()
  };
  saveBooking({ date: data.date, time: data.time, barber: data.barber });
  showSummary(data);
});

function showSummary(d) {
  const price = serviceCards.find((c) => c.dataset.service === d.service)?.dataset.price || "";
  const rows = [
    ["Nome", d.name], ["Telefone", d.phone], ["Serviço", `${d.service}${price ? ` (${price})` : ""}`],
    ["Profissional", d.barber], ["Data", formatDateBR(d.date)], ["Horário", d.time]
  ];
  if (d.notes) rows.push(["Observações", d.notes]);
  const list = $("#summary-list");
  list.innerHTML = "";
  rows.forEach(([k, v]) => {
    const dt = document.createElement("dt"); dt.textContent = k;
    const dd = document.createElement("dd"); dd.textContent = v;
    list.append(dt, dd);
  });
  const lines = [
    `Olá! Gostaria de solicitar um agendamento na ${CONFIG.shopName} (site demonstrativo).`, "",
    `*Nome:* ${d.name}`, `*Telefone:* ${d.phone}`, `*Serviço:* ${d.service}`,
    `*Profissional:* ${d.barber}`, `*Data:* ${formatDateBR(d.date)}`, `*Horário:* ${d.time}`
  ];
  if (d.notes) lines.push(`*Observações:* ${d.notes}`);
  $("#whatsapp-send").href = whatsappUrl(lines.join("\n"));
  form.hidden = true;
  $(".demo-note").hidden = true;
  summary.hidden = false;
  summary.focus();
  summary.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
}

$("#new-booking").addEventListener("click", () => {
  form.reset();
  selectedTime = "";
  renderSlots();
  summary.hidden = true;
  form.hidden = false;
  $(".demo-note").hidden = false;
  $("#name").focus();
});

$("#clear-demo").addEventListener("click", () => {
  try { localStorage.removeItem(CONFIG.storageKey); } catch { /* ignora */ }
  renderSlots();
  const hint = $("#time-error");
  hint.textContent = "";
  slotsBox.setAttribute("aria-live", "polite");
});

/* Botão "Agendar este serviço": abre o formulário com o serviço já escolhido */
$$("[data-book]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const service = btn.closest(".card").dataset.service;
    if (form.hidden) $("#new-booking").click();
    serviceSelect.value = service;
    setError("service", "");
    $("#agendar").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => $("#name").focus({ preventScroll: true }), reduceMotion ? 0 : 500);
  });
});

renderSlots();
