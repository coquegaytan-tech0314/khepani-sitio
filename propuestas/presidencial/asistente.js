/* Pregúntale a Khépani — demostración local.
   PUNTO DE CONEXIÓN: sustituya el cuerpo de responder() dentro de crearMotor
   por una llamada al backend. El contrato está en README.md.
   Hoy no hay red, claves ni modelo externo: solo conocimiento.json. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KhepaniAsistente = api;
  if (typeof document !== "undefined") {
    var boot = function () {
      var el = document.querySelector("[data-khepani-chat]");
      if (el) api.montar(el);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var SALUDOS = [
    "hola",
    "buenos dias",
    "buen dia",
    "buenas tardes",
    "buenas noches",
    "que tal",
    "gracias",
    "muchas gracias",
    "hey"
  ];

  function normalizar(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function distancia(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 99;
    var prev = new Array(b.length + 1);
    var cur = new Array(b.length + 1);
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      cur[0] = i;
      var tmp;
      for (var k = 1; k <= b.length; k++) {
        var cost = a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1;
        cur[k] = Math.min(cur[k - 1] + 1, prev[k] + 1, prev[k - 1] + cost);
      }
      tmp = prev;
      prev = cur;
      cur = tmp;
    }
    return prev[b.length];
  }

  function tokenHits(token, word) {
    if (token === word) return true;
    if (word.length >= 6 && token.indexOf(word) === 0) return true;
    if (token.length >= 6 && word.indexOf(token) === 0 && word.length - token.length <= 3) return true;
    if (token.length >= 6 && word.length >= 6 && distancia(token, word) <= 1) return true;
    return false;
  }

  function detectarTema(q, temas) {
    var tokens = q.split(" ").filter(Boolean);
    var best = null;
    (temas || []).forEach(function (tema) {
      var hit = (tema.words || []).some(function (w) {
        var n = normalizar(w);
        if (!n) return false;
        if (n.indexOf(" ") !== -1) return q.indexOf(n) !== -1;
        return tokens.some(function (t) { return tokenHits(t, n); });
      });
      if (hit && (!best || (tema.priority || 0) > (best.priority || 0))) best = tema;
    });
    return best;
  }

  function puntaje(entrada, q) {
    var score = 0;
    (entrada.keywords || []).forEach(function (raw) {
      var k = normalizar(raw);
      if (!k) return;
      if (k.indexOf(" ") !== -1) {
        if (q.indexOf(k) !== -1) score += 5;
        return;
      }
      q.split(" ").forEach(function (t) {
        if (tokenHits(t, k)) score += 3;
      });
    });
    return score;
  }

  function etiqueta(kb, topics) {
    var id = topics && topics[0];
    var found = (kb.topics || []).filter(function (t) { return t.id === id; })[0];
    return found && found.label ? found.label : "";
  }

  function empaquetar(kb, entrada) {
    var kind = entrada.kind || "ejemplo";
    return {
      id: entrada.id,
      title: entrada.title || "",
      answer: entrada.answer || "",
      kind: kind,
      badge: kind === "ejemplo" ? "Información de ejemplo" : null,
      topics: entrada.topics || [],
      topicLabel: etiqueta(kb, entrada.topics),
      sources: entrada.sources || [],
      offerCita: !!entrada.offerCita,
      nivel: entrada.nivel || ""
    };
  }

  var NIVELES_CITA = ["Primaria", "Secundaria", "Preparatoria"];
  var GRADOS_CITA = {
    Primaria: ["1.º", "2.º", "3.º", "4.º", "5.º", "6.º"],
    Secundaria: ["1.º", "2.º", "3.º"],
    Preparatoria: ["1.er semestre", "2.º semestre", "3.er semestre", "4.º semestre", "5.º semestre", "6.º semestre"]
  };
  var WHATSAPP_CITA = "524451030946";

  function dos(n) { return (n < 10 ? "0" : "") + n; }

  function soloDigitos(s) { return String(s || "").replace(/\D/g, ""); }

  function telefonoValido(s) {
    var d = soloDigitos(s);
    if (d.length === 10) return d;
    if (d.length === 12 && d.indexOf("52") === 0) return d.slice(2);
    if (d.length === 13 && d.indexOf("521") === 0) return d.slice(3);
    if (d.length === 13 && (d.indexOf("044") === 0 || d.indexOf("045") === 0)) return d.slice(3);
    return "";
  }

  function fechaLocal(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!m) return null;
    var y = Number(m[1]);
    var mo = Number(m[2]);
    var da = Number(m[3]);
    var dt = new Date(y, mo - 1, da);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== da) return null;
    return dt;
  }

  function horaValida(hora) {
    var m = /^(\d{2}):(\d{2})$/.exec(String(hora || ""));
    if (!m) return false;
    var mins = Number(m[1]) * 60 + Number(m[2]);
    return mins >= 8 * 60 && mins <= 15 * 60;
  }

  function nombreOk(s) {
    var t = String(s || "").trim();
    if (t.length < 2 || t.length > 80) return false;
    return /[a-záéíóúüñ]/i.test(t);
  }

  function inicioDeDia(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function validarCita(datos, hoy) {
    var d = datos || {};
    var errores = {};
    if (!nombreOk(d.tutor)) errores.tutor = "Escribe el nombre de mamá, papá o tutor.";
    if (!nombreOk(d.alumno)) errores.alumno = "Escribe el nombre del alumno o alumna.";
    if (NIVELES_CITA.indexOf(d.nivel) === -1) errores.nivel = "Elige el nivel de interés.";
    var grados = GRADOS_CITA[d.nivel] || [];
    if (grados.indexOf(d.grado) === -1) errores.grado = "Elige el grado de interés.";
    var dt = fechaLocal(d.dia);
    var base = hoy instanceof Date ? inicioDeDia(hoy) : inicioDeDia(new Date());
    if (!dt) errores.dia = "Elige un día de lunes a viernes.";
    else if (dt.getDay() === 0 || dt.getDay() === 6) errores.dia = "Las citas son de lunes a viernes, de 8:00 a 15:00.";
    else if (dt < base) errores.dia = "Elige un día de hoy en adelante, de lunes a viernes.";
    if (!horaValida(d.hora)) errores.hora = "Elige una hora entre 8:00 y 15:00.";
    else if (dt && dt.getTime() === base.getTime()) {
      var ahora = hoy instanceof Date ? hoy : new Date();
      var hm = /^(\d{2}):(\d{2})$/.exec(String(d.hora || ""));
      var slot = Number(hm[1]) * 60 + Number(hm[2]);
      var mins = ahora.getHours() * 60 + ahora.getMinutes();
      if (slot <= mins) errores.hora = "Esa hora ya pasó. Elige un horario más tarde, entre 8:00 y 15:00, u otro día de lunes a viernes.";
    }
    if (!telefonoValido(d.telefono)) errores.telefono = "Escribe un teléfono de 10 dígitos. Puedes incluir +52.";
    var pregunta = String(d.pregunta || "").trim();
    if (pregunta.length < 3) errores.pregunta = "Escribe la pregunta que quieres resolver en la cita.";
    else if (pregunta.length > 500) errores.pregunta = "La pregunta puede tener hasta 500 caracteres.";
    return { ok: Object.keys(errores).length === 0, errores: errores };
  }

  function formatearCuando(dia, hora) {
    var dt = fechaLocal(dia);
    var bonita = dt
      ? dt.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : String(dia || "");
    return bonita + ", " + String(hora || "");
  }

  function armarMensajeCita(datos) {
    var d = datos || {};
    var tel = telefonoValido(d.telefono);
    var telVista = tel ? tel.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3") : String(d.telefono || "").trim();
    return [
      "Hola, Instituto Khépani. Quisiera agendar una cita.",
      "",
      "Madre, padre o tutor: " + String(d.tutor || "").trim(),
      "Alumna o alumno: " + String(d.alumno || "").trim(),
      "Nivel y grado de interés: " + String(d.nivel || "").trim() + ", " + String(d.grado || "").trim(),
      "Día y hora preferidos: " + formatearCuando(d.dia, d.hora),
      "Teléfono: " + telVista,
      "Pregunta: " + String(d.pregunta || "").trim(),
      "",
      "Gracias. Quedamos atentos a su confirmación."
    ].join("\n");
  }

  function enlaceCita(mensaje, numero) {
    return "https://wa.me/" + (numero || WHATSAPP_CITA) + "?text=" + encodeURIComponent(String(mensaje || ""));
  }

  function detectarNivel(q) {
    var hits = [];
    if (/\bprimaria\b/.test(q)) hits.push("primaria");
    if (/\bsecundaria\b/.test(q)) hits.push("secundaria");
    if (/\b(prepa|preparatoria|bachillerato)\b/.test(q)) hits.push("preparatoria");
    return hits.length === 1 ? hits[0] : "";
  }

  function quiereCita(q) {
    if (/\bcita\b/.test(q) && /\b(agendar|agenda|agendo|agendemos|reservar|sacar|programar|pedir)\b/.test(q)) return true;
    if (q.indexOf("quiero una cita") !== -1 || q.indexOf("hacer una cita") !== -1) return true;
    return false;
  }

  function elegir(lista, q) {
    var nivel = detectarNivel(q);
    var candidatos = lista;
    if (nivel) {
      var finos = lista.filter(function (e) { return e.nivel === nivel; });
      if (finos.length) candidatos = finos;
      else {
        var generales = lista.filter(function (e) { return !e.nivel; });
        if (generales.length) candidatos = generales;
      }
    } else {
      var sinNivel = lista.filter(function (e) { return !e.nivel; });
      if (sinNivel.length) candidatos = sinNivel;
    }
    return candidatos.slice().sort(function (a, b) { return puntaje(b, q) - puntaje(a, q); })[0];
  }

  function crearMotor(kb) {
    var entradas = kb.entries || [];
    var ids = (kb.audiences || []).map(function (a) { return a.id; });

    function audienciaOk(id) {
      return ids.indexOf(id) === -1 ? "padres" : id;
    }

    function saludo(aud, vacio) {
      var texto = (kb.welcome && kb.welcome[aud]) || "Pregunte por inscripciones, vacaciones, días festivos, desfiles o eventos.";
      return {
        id: "saludo",
        title: vacio ? "Escriba una pregunta" : "Hola",
        answer: texto,
        kind: "aviso",
        badge: null,
        topics: [],
        topicLabel: "",
        sources: []
      };
    }

    /* responder(pregunta, audiencia) → { id, title, answer, kind, badge, topicLabel, sources }
       FUTURE LLM: reemplace este cuerpo por fetch al endpoint del README
       y devuelva el mismo objeto. No cambie montar(). */
    function responder(pregunta, audiencia) {
      var aud = audienciaOk(audiencia || "padres");
      var bruto = String(pregunta || "").slice(0, 500);
      var q = normalizar(bruto);
      if (!q) return saludo(aud, true);
      if (SALUDOS.indexOf(q) !== -1) return saludo(aud, false);

      if (quiereCita(q)) {
        return {
          id: "agendar-cita",
          title: "Agendar cita",
          answer: "Con gusto. Te dejo el formulario: nombre de mamá, papá o tutor, nombre del alumno o alumna, nivel y grado, día y hora (lunes a viernes, de 8:00 a 15:00), teléfono y la pregunta que quieres resolver. Al terminarlo se abre WhatsApp con el mensaje listo para el (445) 103-0946. Tú tocas enviar.",
          kind: "aviso",
          badge: null,
          topics: ["cita"],
          topicLabel: "Cita",
          sources: [],
          offerCita: false,
          openCita: true,
          nivel: ""
        };
      }

      var tema = detectarTema(q, kb.topics || []);
      if (tema) {
        var pool = entradas.filter(function (e) {
          return (e.topics || []).indexOf(tema.id) !== -1;
        });
        var propias = pool.filter(function (e) {
          return (e.audiences || []).indexOf(aud) !== -1;
        });
        var lista = propias.length ? propias : pool;
        if (lista.length) return empaquetar(kb, elegir(lista, q));
      }

      var ranked = entradas.map(function (e) {
        var s = puntaje(e, q);
        if ((e.audiences || []).indexOf(aud) === -1) s *= 0.45;
        else s += 2;
        return { e: e, s: s };
      }).sort(function (a, b) { return b.s - a.s; });

      if (ranked.length && ranked[0].s >= 6) return empaquetar(kb, ranked[0].e);

      return {
        id: "sin-coincidencia",
        title: "Puedo orientarte con lo que ya está en la base",
        answer: "No encontré esa pregunta. Puedo orientar sobre inscripciones del ciclo 2026-2027 (requisitos, becas, descuentos y rangos aproximados de colegiatura), vacaciones, días festivos, desfiles y eventos. Las fechas de calendario son información de ejemplo.\n\nAgenda una cita si prefieres atención personalizada, o llama al (445) 103-0946, de lunes a viernes de 8:00 a 15:00, en Libramiento San Miguel (Arcángel) No. 202, La Joyita, Uriangato, Gto.",
        kind: "aviso",
        badge: null,
        topics: [],
        topicLabel: "Orientación",
        sources: [],
        offerCita: true,
        nivel: ""
      };
    }

    return { responder: responder };
  }

  function escapar(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function enriquecer(texto) {
    var safe = escapar(texto);
    safe = safe.replace(
      /([a-z0-9._+-]+@institutokhepani\.com)/g,
      '<a href="mailto:$1">$1</a>'
    );
    safe = safe.replace(
      /\(445\) 103-0946/g,
      '<a href="tel:+524451030946">(445) 103-0946</a>'
    );
    return safe;
  }

  function aParrafos(texto) {
    return String(texto || "")
      .split(/\n\n+/)
      .map(function (p) {
        var lines = p.split("\n");
        var items = lines.length > 0 && lines.every(function (l) { return /^[-•]\s+/.test(l.trim()); });
        if (items) {
          return "<ul>" + lines.map(function (l) {
            return "<li>" + enriquecer(l.replace(/^[-•]\s+/, "")) + "</li>";
          }).join("") + "</ul>";
        }
        return "<p>" + enriquecer(p).replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function montar(root, kbListo) {
    var thread = root.querySelector("[data-thread]");
    var chips = root.querySelector("[data-chips]");
    var audWrap = root.querySelector("[data-audiences]");
    var form = root.querySelector("[data-form]");
    var input = root.querySelector("[data-input]");
    var asking = root.querySelector("[data-asking]");
    var cita = root.querySelector("[data-cita]");
    var citaForm = root.querySelector("[data-cita-form]");
    var citaListo = root.querySelector("[data-cita-listo]");
    var reduce = false;
    try {
      reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (err) { reduce = false; }

    var estado = {
      audiencia: "padres",
      kb: null,
      motor: null,
      ocupado: false,
      huboPregunta: false
    };

    function voz() {
      var aud = (estado.kb.audiences || []).filter(function (a) { return a.id === estado.audiencia; })[0];
      return aud && aud.voice ? aud.voice : "";
    }

    function etiquetaAud(id) {
      var aud = (estado.kb.audiences || []).filter(function (a) { return a.id === id; })[0];
      return aud ? aud.label : id;
    }

    function pintarAudiencias() {
      var auds = estado.kb.audiences || [];
      audWrap.innerHTML = "";
      var botones = [];
      auds.forEach(function (aud, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "aud";
        btn.setAttribute("role", "tab");
        btn.dataset.aud = aud.id;
        btn.textContent = aud.label;
        var on = aud.id === estado.audiencia;
        btn.setAttribute("aria-selected", on ? "true" : "false");
        btn.tabIndex = on ? 0 : -1;
        btn.addEventListener("click", function () { cambiar(aud.id); });
        btn.addEventListener("keydown", function (ev) {
          if (ev.key !== "ArrowRight" && ev.key !== "ArrowDown" && ev.key !== "ArrowLeft" && ev.key !== "ArrowUp") return;
          ev.preventDefault();
          var delta = ev.key === "ArrowRight" || ev.key === "ArrowDown" ? 1 : -1;
          var next = (i + delta + auds.length) % auds.length;
          cambiar(auds[next].id);
          var otra = audWrap.querySelector('[data-aud="' + auds[next].id + '"]');
          if (otra) otra.focus();
        });
        audWrap.appendChild(btn);
        botones.push(btn);
      });
      if (asking) asking.textContent = voz();
      return botones;
    }

    function pintarChips() {
      var lista = (estado.kb.entries || []).filter(function (e) {
        return e.suggest && e.prompt && (e.audiences || []).indexOf(estado.audiencia) !== -1;
      }).sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      chips.innerHTML = "";
      var label = document.createElement("p");
      label.className = "chips-label";
      label.textContent = "Sugerencias";
      var row = document.createElement("div");
      row.className = "chips-row";
      var citaChip = document.createElement("button");
      citaChip.type = "button";
      citaChip.className = "chip chip--cita";
      citaChip.textContent = (estado.kb.cita && estado.kb.cita.chip) || "Agendar cita";
      citaChip.addEventListener("click", function () { enviar(citaChip.textContent); });
      row.appendChild(citaChip);
      lista.forEach(function (e) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "chip";
        b.textContent = e.prompt;
        b.addEventListener("click", function () { enviar(e.prompt); });
        row.appendChild(b);
      });
      chips.appendChild(label);
      chips.appendChild(row);
    }

    function burbuja(clase, quien, htmlInterior) {
      var el = document.createElement("article");
      el.className = "bubble " + clase;
      el.innerHTML = '<p class="who">' + escapar(quien) + "</p>" + htmlInterior;
      thread.appendChild(el);
      thread.scrollTop = thread.scrollHeight;
      return el;
    }

    function agregarUsuario(texto) {
      burbuja("bubble--user", "Tú", aParrafos(texto));
    }

    function nivelEtiqueta(id) {
      if (id === "primaria") return "Primaria";
      if (id === "secundaria") return "Secundaria";
      if (id === "preparatoria") return "Preparatoria";
      return "";
    }

    function agregarBot(res) {
      var extra = "";
      if (res.topicLabel) extra += '<p class="tema">' + escapar(res.topicLabel) + "</p>";
      extra += aParrafos(res.answer);
      if (res.badge) extra += '<p class="badge">' + escapar(res.badge) + "</p>";
      var el = burbuja("bubble--bot", "Khépani", extra);
      if (res.offerCita) {
        var offer = document.createElement("p");
        offer.className = "cita-offer";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn--orange";
        btn.textContent = (estado.kb.cita && estado.kb.cita.button) || "Agenda una cita";
        btn.addEventListener("click", function () {
          abrirCita({ nivel: nivelEtiqueta(res.nivel) });
        });
        offer.appendChild(btn);
        el.appendChild(offer);
      }
      return el;
    }

    function agregarTyping() {
      var el = document.createElement("article");
      el.className = "bubble bubble--bot";
      el.setAttribute("data-typing", "");
      el.innerHTML = '<p class="who">Khépani</p><p class="dots" role="status" aria-label="Buscando la respuesta"><span></span><span></span><span></span></p>';
      thread.appendChild(el);
      thread.scrollTop = thread.scrollHeight;
      return el;
    }

    function decirBienvenida() {
      agregarBot(estado.motor.responder("hola", estado.audiencia));
    }

    function cambiar(id) {
      if (!estado.kb) return;
      var conocida = (estado.kb.audiences || []).some(function (a) { return a.id === id; });
      if (!conocida || id === estado.audiencia) return;
      estado.audiencia = id;
      pintarAudiencias();
      pintarChips();
      if (!estado.huboPregunta) {
        thread.innerHTML = "";
        decirBienvenida();
      } else {
        agregarBot({
          kind: "aviso",
          title: "Audiencia",
          answer: "Sigo en la demostración, ahora con respuestas pensadas para " + etiquetaAud(id) + ".",
          badge: null,
          topicLabel: ""
        });
      }
    }

    function enviar(texto) {
      var t = String(texto || "").trim();
      if (!t || estado.ocupado || !estado.motor) return;
      estado.huboPregunta = true;
      estado.ocupado = true;
      if (input) input.value = "";
      agregarUsuario(t);
      var typing = agregarTyping();
      window.setTimeout(function () {
        var res = estado.motor.responder(t, estado.audiencia);
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        agregarBot(res);
        if (res.openCita) abrirCita();
        estado.ocupado = false;
        var vv = window.visualViewport;
        var limite = (vv ? vv.height : window.innerHeight) - 12;
        var anclado = form && form.querySelector(".composer.is-docked");
        if (form && !anclado && form.getBoundingClientRect().bottom > limite) {
          form.scrollIntoView({ block: "end", behavior: reduce ? "auto" : "smooth" });
        }
      }, reduce ? 0 : 420);
    }

    function arrancar(kb) {
      estado.kb = kb;
      estado.motor = crearMotor(kb);
      pintarAudiencias();
      pintarChips();
      thread.innerHTML = "";
      decirBienvenida();
    }

    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        enviar(input ? input.value : "");
      });
    }

    function avisarCita(abierta) {
      document.body.classList.toggle("cita-open", !!abierta);
      root.classList.toggle("is-cita", !!abierta);
      try { window.dispatchEvent(new Event("resize")); } catch (err) { /* sin resize */ }
    }

    function llenarHoras() {
      if (!citaForm) return;
      var hora = citaForm.querySelector("[name=hora]");
      if (!hora || hora.options.length > 1) return;
      for (var h = 8; h <= 15; h++) {
        [0, 30].forEach(function (min) {
          if (h === 15 && min > 0) return;
          var valor = dos(h) + ":" + dos(min);
          var opt = document.createElement("option");
          opt.value = valor;
          opt.textContent = valor;
          hora.appendChild(opt);
        });
      }
    }

    function llenarGrados(nivel, mantener) {
      if (!citaForm) return;
      var grado = citaForm.querySelector("[name=grado]");
      if (!grado) return;
      var prev = mantener ? grado.value : "";
      var opciones = GRADOS_CITA[nivel] || [];
      grado.innerHTML = "";
      var vacio = document.createElement("option");
      vacio.value = "";
      vacio.textContent = opciones.length ? "Elige el grado" : "Primero elige el nivel";
      grado.appendChild(vacio);
      opciones.forEach(function (g) {
        var opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        grado.appendChild(opt);
      });
      if (prev && opciones.indexOf(prev) !== -1) grado.value = prev;
    }

    function limpiarErrores() {
      if (!citaForm) return;
      var sum = citaForm.querySelector("[data-cita-errores]");
      if (sum) sum.textContent = "";
      Array.prototype.forEach.call(citaForm.querySelectorAll("[data-error-for]"), function (p) { p.textContent = ""; });
      Array.prototype.forEach.call(citaForm.querySelectorAll("[aria-invalid]"), function (el) { el.removeAttribute("aria-invalid"); });
    }

    function mostrarErrores(errores) {
      if (!citaForm) return;
      var keys = Object.keys(errores);
      var sum = citaForm.querySelector("[data-cita-errores]");
      if (sum) sum.textContent = keys.length ? "Revisa los campos marcados para armar la cita." : "";
      keys.forEach(function (k) {
        var p = citaForm.querySelector('[data-error-for="' + k + '"]');
        if (p) p.textContent = errores[k];
        var field = citaForm.querySelector('[name="' + k + '"]');
        if (field) field.setAttribute("aria-invalid", "true");
      });
      var first = citaForm.querySelector("[aria-invalid='true']");
      if (first) first.focus();
    }

    function leerCita() {
      function val(name) {
        var el = citaForm.querySelector('[name="' + name + '"]');
        return el ? el.value : "";
      }
      return {
        tutor: val("tutor"),
        alumno: val("alumno"),
        nivel: val("nivel"),
        grado: val("grado"),
        dia: val("dia"),
        hora: val("hora"),
        telefono: val("telefono"),
        pregunta: val("pregunta")
      };
    }

    function abrirCita(prefill) {
      if (!cita || !citaForm) return;
      llenarHoras();
      cita.hidden = false;
      if (citaListo) citaListo.hidden = true;
      citaForm.hidden = false;
      avisarCita(true);
      if (prefill && prefill.nivel) {
        var sel = citaForm.querySelector("[name=nivel]");
        if (sel && NIVELES_CITA.indexOf(prefill.nivel) !== -1) {
          sel.value = prefill.nivel;
          llenarGrados(prefill.nivel, true);
        }
      }
      var dia = citaForm.querySelector("[name=dia]");
      if (dia) {
        var now = new Date();
        dia.min = now.getFullYear() + "-" + dos(now.getMonth() + 1) + "-" + dos(now.getDate());
      }
      window.setTimeout(function () {
        cita.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
        var first = citaForm.querySelector("[name=tutor]");
        if (first) first.focus();
      }, 40);
    }

    function cerrarCita() {
      if (cita) cita.hidden = true;
      avisarCita(false);
    }

    if (citaForm) {
      llenarHoras();
      llenarGrados("", false);
      var nivelSel = citaForm.querySelector("[name=nivel]");
      if (nivelSel) {
        nivelSel.addEventListener("change", function () { llenarGrados(nivelSel.value, false); });
      }
      citaForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var datos = leerCita();
        var revision = validarCita(datos, new Date());
        limpiarErrores();
        if (!revision.ok) {
          mostrarErrores(revision.errores);
          return;
        }
        var msg = armarMensajeCita(datos);
        var numero = (estado.kb && estado.kb.cita && estado.kb.cita.whatsapp) || WHATSAPP_CITA;
        var url = enlaceCita(msg, numero);
        var pre = root.querySelector("[data-cita-mensaje]");
        var link = root.querySelector("[data-cita-link]");
        var abrir = root.querySelector("[data-cita-abrir]");
        if (pre) pre.textContent = msg;
        if (link) {
          link.href = url;
          link.textContent = url;
        }
        if (abrir) abrir.href = url;
        citaForm.hidden = true;
        if (citaListo) {
          citaListo.hidden = false;
          citaListo.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
        }
        window.open(url, "_blank", "noopener,noreferrer");
      });
      citaForm.addEventListener("focusin", function (ev) {
        var t = ev.target;
        if (!t || !t.scrollIntoView) return;
        window.setTimeout(function () {
          t.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
        }, 280);
      });
    }
    if (cita) {
      var cerrar = cita.querySelector("[data-cita-cerrar]");
      if (cerrar) cerrar.addEventListener("click", cerrarCita);
      var corregir = cita.querySelector("[data-cita-otra]");
      if (corregir) {
        corregir.addEventListener("click", function () {
          if (citaListo) citaListo.hidden = true;
          if (citaForm) {
            citaForm.hidden = false;
            var first = citaForm.querySelector("[name=tutor]");
            if (first) first.focus();
          }
        });
      }
    }

    if (kbListo) {
      arrancar(kbListo);
      return;
    }

    var url = new URL("conocimiento.json", window.location.href);
    fetch(url.href)
      .then(function (r) {
        if (!r.ok) throw new Error("http");
        return r.json();
      })
      .then(arrancar)
      .catch(function () {
        thread.innerHTML = '<p class="chat-error">No se pudo abrir la base de ejemplo (conocimiento.json).</p>';
      });
  }

    return {
      crearMotor: crearMotor,
      montar: montar,
      normalizar: normalizar,
      validarCita: validarCita,
      armarMensajeCita: armarMensajeCita,
      enlaceCita: enlaceCita,
      telefonoValido: telefonoValido,
      GRADOS_CITA: GRADOS_CITA
    };
});
