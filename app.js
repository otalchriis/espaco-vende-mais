const photos = [
  {file:"front.webp",label:"Frente e lateral",alt:"Frente e lateral do Gol, mostrando marcas no capô e para-choque; placa ocultada",slug:"front"},
  {file:"side.webp",label:"Perfil completo",alt:"Perfil lateral do Gol vermelho",slug:"side"},
  {file:"rear.webp",label:"Traseira e lateral",alt:"Traseira e lateral com desgaste visível na tampa e na pintura; placa ocultada",slug:"rear"},
  {file:"engine.webp",label:"Compartimento do motor",alt:"Motor e componentes sob o capô; placa ocultada",slug:"engine"},
  {file:"roof.webp",label:"Teto e pintura",alt:"Parte superior do carro com desgaste da pintura",slug:"roof"},
  {file:"paint-rear.webp",label:"Pintura na traseira",alt:"Detalhe real de desgaste da pintura na parte traseira",slug:"paint_rear"},
  {file:"rear-detail.webp",label:"Detalhe da traseira",alt:"Detalhe da lanterna e funilaria traseira",slug:"rear_detail"},
  {file:"roof-detail.webp",label:"Detalhe do teto",alt:"Falhas da pintura no teto",slug:"roof_detail"},
  {file:"front-detail.webp",label:"Detalhe da dianteira",alt:"Marca na pintura próxima ao farol dianteiro",slug:"front_detail"}
];

const main = document.getElementById("gallery-main");
const label = document.getElementById("gallery-label");
const counter = document.getElementById("gallery-count");
const thumbs = document.getElementById("gallery-thumbs");
let active = 0;
const track = (name, params = {}) => {
  if (window.siteAnalyticsReady && typeof window.gtag === "function") {
    window.gtag("event", name, { item_name: "gol_cl_1997", ...params });
  }
};
function showPhoto(index, source = "thumbnail") {
  active = (index + photos.length) % photos.length;
  const photo = photos[active];
  main.src = "./assets/" + photo.file;
  main.alt = photo.alt;
  label.textContent = photo.label;
  counter.textContent = String(active + 1).padStart(2, "0") + " / " + String(photos.length).padStart(2, "0");
  thumbs.querySelectorAll("button").forEach((button, i) => button.setAttribute("aria-current", String(i === active)));
  track("photo_" + photo.slug, {photo_name: photo.slug, gallery_action: source});
}
photos.forEach((photo, i) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "thumb";
  button.setAttribute("aria-label", "Mostrar foto: " + photo.label);
  button.setAttribute("aria-current", String(i === 0));
  const img = document.createElement("img");
  img.src = "./assets/" + photo.file;
  img.alt = "";
  img.loading = "lazy";
  button.append(img);
  button.addEventListener("click", () => showPhoto(i));
  thumbs.append(button);
});
document.querySelector(".gallery-arrow.prev").addEventListener("click", () => showPhoto(active - 1, "arrow"));
document.querySelector(".gallery-arrow.next").addEventListener("click", () => showPhoto(active + 1, "arrow"));
document.addEventListener("keydown", (event) => {
  if (location.hash === "#fotos" || document.activeElement.closest?.(".gallery")) {
    if (event.key === "ArrowLeft") showPhoto(active - 1, "keyboard");
    if (event.key === "ArrowRight") showPhoto(active + 1, "keyboard");
  }
});

document.querySelectorAll("[data-track]").forEach((element) => {
  element.addEventListener("click", () => {
    const name = element.dataset.track;
    const placement = name.startsWith("whatsapp_") ? name.slice(9) : name;
    track(name, {placement});
    if (name.startsWith("whatsapp_")) track("whatsapp_click", {placement});
  });
});
document.querySelectorAll('a[href^="#"]').forEach((element) => {
  element.addEventListener("click", () => track("nav_" + element.hash.slice(1)));
});
document.querySelectorAll("video[data-media]").forEach((video) => {
  let started = false;
  video.addEventListener("play", () => {
    if (!started) {
      track("video_" + video.dataset.media + "_play", {video_name: video.dataset.media});
      started = true;
    }
  });
  video.addEventListener("ended", () => {
    track("video_" + video.dataset.media + "_end", {video_name: video.dataset.media});
    started = false;
  });
});
document.querySelectorAll(".faq-list details").forEach((detail, i) => {
  detail.addEventListener("toggle", () => {
    if (detail.open) track("faq_" + (i + 1) + "_open", {faq_number: i + 1});
  });
});
function recordSection(section) {
  if (!window.siteAnalyticsReady || section.dataset.seen) return;
  section.dataset.seen = "true";
  track("section_" + section.dataset.section, {section_name: section.dataset.section});
  observer.unobserve(section);
}
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) recordSection(entry.target);
  });
}, {threshold: 0.35});
document.querySelectorAll("[data-section]").forEach((section) => observer.observe(section));

const gaId = window.SITE_CONFIG?.gaMeasurementId?.trim();
const cookieBanner = document.getElementById("cookie-banner");
if (/^G-[A-Z0-9]+$/.test(gaId || "")) {
  const choice = localStorage.getItem("ga_choice");
  function startAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", gaId, {send_page_view: true});
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
    document.head.append(script);
    window.siteAnalyticsReady = true;
    window.gtag("event", "view_item", {
      currency: "BRL",
      value: 8500,
      items: [{item_id: "gol_cl_1997", item_name: "Gol CL 1.6 MI 1997", price: 8500}]
    });
    document.querySelectorAll("[data-section]").forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) recordSection(section);
    });
  }
  if (choice === "accepted") startAnalytics();
  else if (choice !== "rejected") cookieBanner.hidden = false;
  document.getElementById("cookie-accept").addEventListener("click", () => {
    localStorage.setItem("ga_choice", "accepted");
    cookieBanner.hidden = true;
    startAnalytics();
  });
  document.getElementById("cookie-reject").addEventListener("click", () => {
    localStorage.setItem("ga_choice", "rejected");
    cookieBanner.hidden = true;
  });
}
