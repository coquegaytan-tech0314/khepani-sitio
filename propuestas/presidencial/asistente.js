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
      sources: entrada.sources || []
    };
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

      var tema = detectarTema(q, kb.topics || []);
      if (tema) {
        var pool = entradas.filter(function (e) {
          return (e.topics || []).indexOf(tema.id) !== -1;
        });
        var propias = pool.filter(function (e) {
          return (e.audiences || []).indexOf(aud) !== -1;
        });
        var lista = propias.length ? propias : pool;
        if (lista.length) {
          lista = lista.slice().sort(function (a, b) { return puntaje(b, q) - puntaje(a, q); });
          return empaquetar(kb, lista[0]);
        }
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
        title: "Puedo orientar con lo que hay en la demostración",
        answer: "No encontré esa pregunta en la base local. En esta demostración puedo orientar sobre inscripciones y documentos, vacaciones, días festivos, desfiles y eventos escolares.\n\nPara un dato oficial de hoy: (445) 103-0946, contacto@institutokhepani.com, lunes a viernes de 8:00 a 15:00, Libramiento San Miguel No. 202, La Joyita, Uriangato, Gto.",
        kind: "aviso",
        badge: null,
        topics: [],
        topicLabel: "Orientación",
        sources: []
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
      label.textContent = "Preguntas de muestra";
      var row = document.createElement("div");
      row.className = "chips-row";
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

    function agregarBot(res) {
      var extra = "";
      if (res.topicLabel) extra += '<p class="tema">' + escapar(res.topicLabel) + "</p>";
      extra += aParrafos(res.answer);
      if (res.badge) extra += '<p class="badge">' + escapar(res.badge) + "</p>";
      burbuja("bubble--bot", "Khépani", extra);
    }

    function agregarTyping() {
      var el = document.createElement("article");
      el.className = "bubble bubble--bot";
      el.setAttribute("data-typing", "");
      el.innerHTML = '<p class="who">Khépani</p><p class="dots" role="status" aria-label="Buscando en la base de ejemplo"><span></span><span></span><span></span></p>';
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
        estado.ocupado = false;
        if (form && form.getBoundingClientRect().bottom > window.innerHeight - 12) {
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

  return { crearMotor: crearMotor, montar: montar, normalizar: normalizar };
});
