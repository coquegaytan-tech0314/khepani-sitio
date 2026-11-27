/* Instituto Khépani · propuesta Fable 5.2
 *
 * Actualizar cada ciclo escolar aquí.
 *
 * Esta es la única fuente de los datos que cambian de un ciclo a otro:
 * el nombre del ciclo, los costos de Primaria, Secundaria y Preparatoria,
 * la promoción de Primaria y Secundaria, la convocatoria de becas de
 * Preparatoria y los campos de la ficha de pre-inscripción. El HTML ya
 * trae estos mismos valores escritos, para que la sección se vea aunque
 * no cargue JavaScript. Al cargar, este archivo los vuelve a pintar en
 * la sección de inscripciones y en las tablas de Admisiones, para que
 * no se desfasen.
 *
 * La hoja de costos de Preparatoria imprime la mensualidad como
 * «$3,07000». Aquí se publica como $3,070.
 */
(function (global) {
  "use strict";

  var INSCRIPCIONES = {
    ciclo: "2026-2027",
    cicloLabel: "2026–2027",
    niveles: {
      primaria: {
        nombre: "Primaria",
        cct: "11PPR1068V",
        inscripcion: "$4,400",
        colegiatura: "$3,590",
        libros: "$7,000 a $8,000",
        librosAproximado: true,
        librosLeyenda: "Precio aproximado"
      },
      secundaria: {
        nombre: "Secundaria",
        cct: "11PES0464H",
        inscripcion: "$4,450",
        colegiatura: "$3,700"
      },
      preparatoria: {
        nombre: "Preparatoria",
        cct: "11PBH0047S",
        acuerdo: "Inc. SEG Acuerdo 048/2017",
        inscripcion: "$3,250",
        inscripcionLabel: "Inscripción semestral + seguro de accidentes personales escolar",
        colegiatura: "$3,070",
        colegiaturaNota: "× 6 (julio–diciembre)",
        libros: "$2,800",
        librosNota: "aprox.",
        uniforme: "$2,500",
        uniformeLabel: "Uniforme (1 diario + 1 deportes)",
        descuento: "10% de descuento en colegiatura por pago semestral",
        descuentoNota: "No aplican dos descuentos a la vez."
      }
    },
    promo: "20% de descuento pagando en efectivo en noviembre y diciembre",
    promoCorto: "20%",
    promoAlcance: "Aplica solo en Primaria y Secundaria",
    becasPrepa: {
      convocatoria: "La convocatoria de solicitud de beca será el 27 de febrero, con pago previo de inscripción y seguro de accidentes personales escolar, en el área de administración. Promedio mínimo 8.5.",
      nota: "Sin los requisitos no se renovará ninguna beca.",
      requisitos: [
        "Copia del recibo de inscripción del periodo escolar actual o del periodo escolar inmediato",
        "Constancia de no adeudo de materias",
        "Copia de comprobante de domicilio reciente (agua, electricidad, teléfono, predial, etc.)",
        "Copia de comprobante de ingresos económicos familiares recientes (talón de cheques de nómina, estado de cuenta, declaración de impuestos, constancia de salario del patrón, etc.)",
        "Copia de identificación oficial vigente con fotografía",
        "Carta motivo de solicitud de beca"
      ]
    },
    preinscripcion: {
      campos: [
        "nivel",
        "nombre del alumno",
        "fecha de nacimiento",
        "padres y ocupación",
        "teléfonos",
        "domicilio",
        "grado que solicita",
        "escuela de procedencia",
        "correo",
        "transporte",
        "promedio"
      ]
    },
    whatsapp: {
      display: "(445) 103-0946",
      href: "https://wa.me/524451030946?text=Hola%2C%20quiero%20informes%20de%20inscripciones%20ciclo%202026-2027%2C%20Instituto%20Kh%C3%A9pani%20Uriangato.",
      fichaHref: "https://wa.me/524451030946?text=Hola%2C%20quiero%20solicitar%20una%20ficha%20de%20pre-inscripci%C3%B3n%20ciclo%202026-2027%2C%20Instituto%20Kh%C3%A9pani%20Uriangato."
    },
    direccion: "Libramiento San Miguel no. 202"
  };

  function texto(el, valor) {
    if (el && valor != null && valor !== "") el.textContent = valor;
  }

  function escapar(valor) {
    return String(valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function camposPreinscripcion(data) {
    var campos = data.preinscripcion && data.preinscripcion.campos;
    if (!campos || !campos.length) return "";
    if (campos.length === 1) return campos[0];
    return campos.slice(0, -1).join(", ") + " y " + campos[campos.length - 1];
  }

  function valorPorRuta(data, ruta) {
    var partes = (ruta || "").split(".");
    var actual = data;
    var i;
    for (i = 0; i < partes.length; i += 1) {
      if (actual == null) return null;
      actual = actual[partes[i]];
    }
    return actual;
  }

  function aplicar() {
    var data = global.KHEPANI_INSCRIPCIONES;
    if (!data) return;

    document.querySelectorAll("[data-insc]").forEach(function (el) {
      var clave = el.getAttribute("data-insc");
      if (clave === "ciclo") texto(el, data.ciclo);
      else if (clave === "ciclo-label") texto(el, data.cicloLabel);
      else if (clave === "promo") texto(el, data.promo);
      else if (clave === "promo-corto") texto(el, data.promoCorto);
      else if (clave === "promo-alcance") texto(el, data.promoAlcance);
      else if (clave === "direccion") texto(el, data.direccion);
      else if (clave === "whatsapp" && data.whatsapp) texto(el, data.whatsapp.display);
      else if (clave === "becas-prepa-convocatoria" && data.becasPrepa) texto(el, data.becasPrepa.convocatoria);
      else if (clave === "becas-prepa-nota" && data.becasPrepa) texto(el, data.becasPrepa.nota);
      else if (clave === "preinscripcion-campos") texto(el, camposPreinscripcion(data));
    });

    document.querySelectorAll("[data-insc-href]").forEach(function (el) {
      var clave = el.getAttribute("data-insc-href");
      if (clave === "whatsapp" && data.whatsapp && data.whatsapp.href) {
        el.setAttribute("href", data.whatsapp.href);
      } else if (clave === "whatsapp-ficha" && data.whatsapp && data.whatsapp.fichaHref) {
        el.setAttribute("href", data.whatsapp.fichaHref);
      }
    });

    document.querySelectorAll("[data-insc-list]").forEach(function (el) {
      var items = valorPorRuta(data, el.getAttribute("data-insc-list"));
      if (!items || !items.length) return;
      el.innerHTML = items.map(function (item) {
        return "<li>" + escapar(item) + "</li>";
      }).join("");
    });

    var niveles = data.niveles || {};
    Object.keys(niveles).forEach(function (id) {
      var nivel = niveles[id];
      document.querySelectorAll('[data-insc-nivel="' + id + '"]').forEach(function (bloque) {
        bloque.querySelectorAll("[data-insc-field]").forEach(function (el) {
          var campo = el.getAttribute("data-insc-field");
          if (campo && nivel[campo] != null) texto(el, nivel[campo]);
        });
        bloque.querySelectorAll("[data-insc-approx]").forEach(function (el) {
          var campo = el.getAttribute("data-insc-approx");
          el.hidden = !(campo && nivel[campo + "Aproximado"] === true);
        });
      });
    });
  }

  global.KHEPANI_INSCRIPCIONES = INSCRIPCIONES;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aplicar);
  } else {
    aplicar();
  }
})(window);
