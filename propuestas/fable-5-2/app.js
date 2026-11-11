/* Instituto Khépani · propuesta Fable 5.2
   Interacciones de la página. El asistente «Pregúntale a Khépani» vive en
   ../presidencial/asistente.js y ../presidencial/conocimiento.json: aquí solo
   se monta sobre el marcado nuevo. No se cambia su lógica, su contrato ni
   su candado de rangos de precios. La página no guarda nada en el navegador. */
(function () {
  "use strict";

  var doc = document;
  var html = doc.documentElement;
  var WHATSAPP = "https://wa.me/524451030946";
  var BASE_CONOCIMIENTO = "../presidencial/conocimiento.json";

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function dos(n) { return (n < 10 ? "0" : "") + n; }

  var hayIO = "IntersectionObserver" in window;
  if (hayIO) html.classList.add("io");

  var punteroFino = false;
  try { punteroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (err) { punteroFino = false; }

  /* ---------- Encabezado: sombra al dejar la barra superior ---------- */
  var header = $("[data-header]");
  var topbar = $(".topbar");
  if (header && topbar && hayIO) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }).observe(topbar);
  }

  /* ---------- Menú móvil (<dialog>) ---------- */
  var menu = $("#menu");
  var abrirMenu = $("[data-menu-open]");
  var cerrarMenu = $("[data-menu-close]");

  function menuAbierto() { return !!(menu && menu.hasAttribute("open")); }

  function mostrarMenu() {
    if (!menu || menuAbierto()) return;
    if (typeof menu.showModal === "function") menu.showModal();
    else menu.setAttribute("open", "");
    html.classList.add("menu-open");
    if (abrirMenu) abrirMenu.setAttribute("aria-expanded", "true");
  }

  function ocultarMenu() {
    if (!menu || !menuAbierto()) return;
    if (typeof menu.close === "function") menu.close();
    else { menu.removeAttribute("open"); alCerrarMenu(); }
  }

  function alCerrarMenu() {
    html.classList.remove("menu-open");
    if (abrirMenu) abrirMenu.setAttribute("aria-expanded", "false");
  }

  if (menu) {
    if (abrirMenu) abrirMenu.addEventListener("click", mostrarMenu);
    if (cerrarMenu) cerrarMenu.addEventListener("click", ocultarMenu);
    menu.addEventListener("close", alCerrarMenu);
    menu.addEventListener("click", function (ev) {
      if (ev.target.closest && ev.target.closest("a")) ocultarMenu();
    });
    try {
      var escritorio = window.matchMedia("(min-width: 1080px)");
      var alCambiar = function () { if (escritorio.matches) ocultarMenu(); };
      if (escritorio.addEventListener) escritorio.addEventListener("change", alCambiar);
      else if (escritorio.addListener) escritorio.addListener(alCambiar);
    } catch (err) { /* sin matchMedia */ }
  }

  /* ---------- Navegación: sección activa ---------- */
  var enlacesNav = $$(".nav a[href^='#']");
  if (enlacesNav.length && hayIO) {
    var secciones = $$("main > section[id]");
    var visibles = {};
    var marcar = function () {
      var activa = "";
      secciones.forEach(function (s) { if (visibles[s.id]) activa = s.id; });
      enlacesNav.forEach(function (a) {
        if (a.getAttribute("href") === "#" + activa) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    var espia = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visibles[e.target.id] = e.isIntersecting; });
      marcar();
    }, { rootMargin: "-45% 0px -54% 0px" });
    secciones.forEach(function (s) { espia.observe(s); });
  }

  /* ---------- Pestañas de admisiones ---------- */
  var seleccionarNivel = null;
  $$("[data-tabs]").forEach(function (wrap) {
    var tabs = $$("[role='tab']", wrap);
    var paneles = $$("[role='tabpanel']", wrap);
    var indicador = $(".adm__indicator", wrap);
    if (!tabs.length) return;

    function actual() {
      return tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
    }

    function moverIndicador() {
      var t = actual();
      if (!indicador || !t) return;
      indicador.style.width = t.offsetWidth + "px";
      indicador.style.transform = "translateX(" + t.offsetLeft + "px)";
    }

    function seleccionar(tab, enfocar) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      paneles.forEach(function (p) { p.hidden = p.id !== tab.getAttribute("aria-controls"); });
      moverIndicador();
      if (enfocar) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { seleccionar(tab, false); });
      tab.addEventListener("keydown", function (ev) {
        var destino = -1;
        if (ev.key === "ArrowRight" || ev.key === "ArrowDown") destino = (i + 1) % tabs.length;
        else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") destino = (i - 1 + tabs.length) % tabs.length;
        else if (ev.key === "Home") destino = 0;
        else if (ev.key === "End") destino = tabs.length - 1;
        if (destino < 0) return;
        ev.preventDefault();
        seleccionar(tabs[destino], true);
      });
    });

    seleccionar(actual(), false);
    wrap.classList.add("is-ready");
    window.addEventListener("resize", moverIndicador);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(moverIndicador);

    seleccionarNivel = function (id) {
      var tab = tabs.filter(function (t) { return t.dataset.tab === id; })[0];
      if (tab) seleccionar(tab, false);
    };
  });

  $$("[data-tab-target]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (seleccionarNivel) seleccionarNivel(a.dataset.tabTarget);
    });
  });

  /* ---------- Aparición al hacer scroll ---------- */
  var porRevelar = $$("[data-reveal]");
  if (hayIO && porRevelar.length) {
    var revelador = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        revelador.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    porRevelar.forEach(function (el) { revelador.observe(el); });
  }

  /* ---------- Cita: preparación del formulario ---------- */
  var raiz = $("[data-chat-root]");
  var chat = $("[data-chat]");
  var thread = $("[data-thread]");
  var formChat = $("[data-form]");
  var entrada = $("[data-input]");
  var cita = $("[data-cita]");
  var formCita = $("[data-cita-form]");
  var asistenteListo = false;

  if (formChat) {
    formChat.addEventListener("submit", function (ev) { if (!asistenteListo) ev.preventDefault(); });
  }

  if (formCita) {
    formCita.addEventListener("submit", function (ev) { if (!asistenteListo) ev.preventDefault(); });

    var dia = formCita.querySelector("[name=dia]");
    if (dia) {
      var hoy = new Date();
      dia.min = hoy.getFullYear() + "-" + dos(hoy.getMonth() + 1) + "-" + dos(hoy.getDate());
    }

    /* El asistente recentra la página cada vez que un campo recibe el foco.
       En pantallas táctiles ayuda con el teclado abierto y se conserva; con
       ratón marea, así que ahí el aviso de foco se detiene antes de llegarle.
       El navegador sigue llevando la vista al campo cuando hace falta. */
    if (punteroFino) {
      formCita.addEventListener("focusin", function (ev) { ev.stopPropagation(); }, true);
    }
  }

  $$("[data-cita-nivel]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (!formCita) return;
      var listo = $("[data-cita-listo]");
      if (listo && !listo.hidden) {
        listo.hidden = true;
        formCita.hidden = false;
      }
      var nivel = formCita.querySelector("[name=nivel]");
      if (!nivel || nivel.value === a.dataset.citaNivel) return;
      nivel.value = a.dataset.citaNivel;
      nivel.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  /* ---------- Pregúntale a Khépani: montaje ---------- */
  function asistenteNoDisponible() {
    if (chat) chat.classList.add("is-off");
    if (cita) cita.classList.add("is-off");
    if (entrada) entrada.disabled = true;
    if (!thread) return;
    thread.textContent = "";
    var caja = doc.createElement("p");
    caja.className = "chat-error";
    var titulo = doc.createElement("strong");
    titulo.textContent = "El asistente no está disponible en este momento.";
    var texto = doc.createTextNode("Escríbenos por ");
    var enlace = doc.createElement("a");
    enlace.href = WHATSAPP;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    enlace.textContent = "WhatsApp al (445) 103-0946";
    var cierre = doc.createTextNode(", de lunes a viernes de 8:00 a 15:00.");
    caja.appendChild(titulo);
    caja.appendChild(texto);
    caja.appendChild(enlace);
    caja.appendChild(cierre);
    thread.appendChild(caja);
  }

  /* El asistente baja la conversación hasta el final cada vez que contesta.
     Si la respuesta no cabe completa, aquí se regresa a su primer renglón
     (y a la pregunta, cuando es corta) para leerla desde el inicio. */
  function leerDesdeElInicio() {
    if (!("MutationObserver" in window)) return;
    new MutationObserver(function () {
      acomodarRespuesta();
      revisarResto();
    }).observe(thread, { childList: true });
  }

  function acomodarRespuesta() {
    var ultima = thread.lastElementChild;
    if (!ultima || !ultima.classList.contains("bubble--bot") || ultima.hasAttribute("data-typing")) return;
    var inicio = thread.getBoundingClientRect().top - thread.scrollTop;
    /* El margen de arriba es la franja ::before de .thread (styles.css). */
    var margen = parseFloat(getComputedStyle(thread, "::before").height) ||
                 parseFloat(getComputedStyle(thread).paddingTop) || 12;
    var fondo = thread.scrollHeight - thread.clientHeight;
    if (ultima.getBoundingClientRect().top - inicio - margen >= fondo) return;
    var ancla = ultima;
    var pregunta = ultima.previousElementSibling;
    if (pregunta && pregunta.classList.contains("bubble--user") &&
        pregunta.offsetHeight < thread.clientHeight * 0.3) ancla = pregunta;
    thread.scrollTop = Math.max(0, ancla.getBoundingClientRect().top - inicio - margen);
  }

  /* Aviso «Ver más»: aparece cuando la conversación sigue debajo de lo que se
     alcanza a ver y, al tocarlo, avanza casi una pantalla. Se esconde de
     inmediato al llegar al final; para aparecer espera a que la conversación
     deje de moverse, así no parpadea con cada mensaje nuevo. */
  var mas = $("[data-more]");
  var esperaMas = 0;
  function resto() {
    return thread.scrollHeight - thread.scrollTop - thread.clientHeight;
  }
  /* Con 20 px o menos ya solo falta el margen de abajo del último mensaje. */
  function quedaResto() {
    return resto() > 20;
  }
  function revisarResto() {
    if (!mas || !thread) return;
    window.clearTimeout(esperaMas);
    if (!quedaResto()) {
      if (mas.hidden) return;
      /* Si el aviso tenía el foco, pasa a la conversación para seguir con el teclado. */
      if (mas.contains(doc.activeElement)) {
        try { thread.focus({ preventScroll: true }); } catch (err) { thread.focus(); }
      }
      mas.hidden = true;
      return;
    }
    if (!mas.hidden) return;
    esperaMas = window.setTimeout(function () {
      if (quedaResto()) mas.hidden = false;
    }, 220);
  }
  if (mas && thread) {
    thread.addEventListener("scroll", revisarResto, { passive: true });
    window.addEventListener("resize", revisarResto);
    mas.addEventListener("click", function () {
      var paso = Math.round(thread.clientHeight * 0.8);
      var falta = resto();
      /* Si después del paso quedaría un pedacito, llega de una vez al final. */
      thread.scrollTop += (falta - paso < thread.clientHeight * 0.15) ? falta : paso;
    });
    /* Lo que queda detrás del aviso casi no se ve; ahí no se aceptan toques,
       para no abrir un enlace o un botón sin querer. */
    thread.addEventListener("click", function (ev) {
      if (mas.hidden || !ev.clientY) return;
      if (ev.clientY > thread.getBoundingClientRect().bottom - 44) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    }, true);
  }

  function montarAsistente() {
    if (!raiz || !thread) return;
    var api = window.KhepaniAsistente;
    if (!api || typeof api.montar !== "function" || typeof window.fetch !== "function") {
      asistenteNoDisponible();
      return;
    }
    fetch(BASE_CONOCIMIENTO, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("http");
        return r.json();
      })
      .then(function (kb) {
        leerDesdeElInicio();
        api.montar(raiz, kb);
        asistenteListo = true;
        html.classList.add("chat-ready");
      })
      .catch(asistenteNoDisponible);
  }
  montarAsistente();

  /* Con teclado, la sugerencia enfocada se acomoda al inicio de la fila: el
     navegador no la mueve cuando ya asoma un poco y quedaría a medias. Con el
     dedo o el ratón no se mueve nada. */
  var sugerencias = $("[data-chips]");
  if (sugerencias) {
    sugerencias.addEventListener("focusin", function (ev) {
      var chip = ev.target;
      if (!chip || !chip.classList || !chip.classList.contains("chip")) return;
      var fila = chip.parentElement;
      if (!fila || fila.scrollWidth <= fila.clientWidth) return;
      try { if (!chip.matches(":focus-visible")) return; } catch (err) { return; }
      var borde = parseFloat(getComputedStyle(fila).paddingLeft) || 0;
      var c = chip.getBoundingClientRect();
      var f = fila.getBoundingClientRect();
      if (c.left >= f.left + borde - 1 && c.right <= f.right - borde + 1) return;
      fila.scrollLeft += c.left - f.left - borde;
    });
  }

  /* Enlaces del pie que abren el asistente con la audiencia elegida. */
  $$("[data-aud-link]").forEach(function (a) {
    a.addEventListener("click", function () {
      var boton = $(".aud[data-aud='" + a.dataset.audLink + "']");
      if (boton) boton.click();
    });
  });

  /* ---------- Botón flotante: se oculta sobre el asistente y la cita ---------- */
  var fab = $("[data-fab]");
  if (fab && hayIO) {
    var tapado = [];
    var vigia = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = tapado.indexOf(e.target);
        if (e.isIntersecting && i === -1) tapado.push(e.target);
        if (!e.isIntersecting && i !== -1) tapado.splice(i, 1);
      });
      fab.classList.toggle("is-hidden", tapado.length > 0);
    }, { rootMargin: "-84px 0px -6% 0px" });
    [chat, cita].forEach(function (el) { if (el) vigia.observe(el); });
  }

  /* ---------- Aplicación instalable ---------- */
  var local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if ("serviceWorker" in navigator && (location.protocol === "https:" || local)) {
    window.addEventListener("load", function () {
      /* En un marco aislado (sandbox) leer navigator.serviceWorker lanza un error. */
      try {
        navigator.serviceWorker.register("sw.js").catch(function () { /* sin modo sin conexión */ });
      } catch (err) { /* sin modo sin conexión */ }
    });
  }
})();
