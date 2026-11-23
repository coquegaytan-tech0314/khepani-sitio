/* Instituto Khépani · propuesta Fable 5.2
 *
 * Actualizar cada ciclo escolar aquí.
 *
 * Esta es la única fuente de los datos que cambian de un ciclo a otro:
 * el nombre del ciclo, la inscripción y la colegiatura de Primaria y
 * Secundaria, y el texto de la promoción. El HTML ya trae estos mismos
 * valores escritos, para que la sección se vea aunque no cargue JavaScript.
 * Al cargar, este archivo los vuelve a pintar en la sección de inscripciones
 * y en las tablas de Admisiones, para que no se desfasen.
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
        colegiatura: "$3,590"
      },
      secundaria: {
        nombre: "Secundaria",
        cct: "11PES0464H",
        inscripcion: "$4,450",
        colegiatura: "$3,700"
      }
    },
    promo: "20% de descuento pagando en efectivo en noviembre y diciembre",
    promoCorto: "20%",
    whatsapp: {
      display: "(445) 103-0946",
      href: "https://wa.me/524451030946?text=Hola%2C%20quiero%20informes%20de%20inscripciones%20ciclo%202026-2027%2C%20Instituto%20Kh%C3%A9pani%20Uriangato."
    },
    direccion: "Libramiento San Miguel no. 202"
  };

  function texto(el, valor) {
    if (el && valor != null && valor !== "") el.textContent = valor;
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
      else if (clave === "direccion") texto(el, data.direccion);
      else if (clave === "whatsapp" && data.whatsapp) texto(el, data.whatsapp.display);
    });

    document.querySelectorAll("[data-insc-href='whatsapp']").forEach(function (el) {
      if (data.whatsapp && data.whatsapp.href) el.setAttribute("href", data.whatsapp.href);
    });

    var niveles = data.niveles || {};
    Object.keys(niveles).forEach(function (id) {
      var nivel = niveles[id];
      document.querySelectorAll('[data-insc-nivel="' + id + '"]').forEach(function (bloque) {
        bloque.querySelectorAll("[data-insc-field]").forEach(function (el) {
          var campo = el.getAttribute("data-insc-field");
          if (campo && nivel[campo] != null) texto(el, nivel[campo]);
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
