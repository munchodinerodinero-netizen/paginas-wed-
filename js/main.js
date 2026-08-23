/**
 * main.js
 * Lógica del sitio: inyecta los datos de CONFIG en el DOM, maneja
 * el menú móvil y arma el envío de la cotización por WhatsApp.
 * No necesita edición al clonar la plantilla — todo lo variable
 * vive en js/config.js.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    injectBusinessData();
    setupMobileNav();
    setupYear();
    setupQuoteForm();
  });

  /** Rellena todos los elementos marcados con data-cfg="campo" */
  function injectBusinessData() {
    document.querySelectorAll("[data-cfg]").forEach((el) => {
      const key = el.getAttribute("data-cfg");
      const value = key.split(".").reduce((acc, k) => (acc ? acc[k] : ""), CONFIG);
      if (value == null) return;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.value = value;
      } else {
        el.textContent = value;
      }
    });

    // Enlaces de teléfono: <a data-cfg-tel>
    document.querySelectorAll("[data-cfg-tel]").forEach((el) => {
      el.href = `tel:${CONFIG.phoneLink}`;
    });

    // Enlaces de correo: <a data-cfg-mail>
    document.querySelectorAll("[data-cfg-mail]").forEach((el) => {
      el.href = `mailto:${CONFIG.email}`;
    });

    // Enlaces genéricos de WhatsApp: <a data-cfg-whatsapp="mensaje opcional">
    document.querySelectorAll("[data-cfg-whatsapp]").forEach((el) => {
      const customMsg = el.getAttribute("data-cfg-whatsapp");
      el.href = CONFIG.whatsappLink(customMsg || undefined);
      el.target = "_blank";
      el.rel = "noopener";
    });

    // Redes sociales: oculta el ícono si no hay URL configurada
    document.querySelectorAll("[data-cfg-social]").forEach((el) => {
      const network = el.getAttribute("data-cfg-social");
      const url = CONFIG.social[network];
      if (url) {
        el.href = url;
      } else {
        el.style.display = "none";
      }
    });
  }

  /** Menú hamburguesa para móvil */
  function setupMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-mobile");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Cierra el menú al elegir un enlace
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupYear() {
    const el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /**
   * El formulario de cotización no requiere backend: arma un mensaje
   * de WhatsApp con los datos capturados y lo abre en una pestaña
   * nueva hacia el número configurado en CONFIG.whatsappNumber.
   * Para un cliente real que quiera guardar leads en un correo o CRM,
   * este es el punto donde se conectaría un endpoint propio.
   */
  function setupQuoteForm() {
    const form = document.querySelector("#quote-form");
    const successBox = document.querySelector("#quote-success");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const nombre = data.get("nombre");
      const telefono = data.get("telefono");
      const servicio = data.get("servicio");
      const mensaje = data.get("mensaje") || "Sin detalles adicionales.";

      const textoWhatsapp =
        `Hola, soy ${nombre}. 👋\n` +
        `Quiero una cotización de: ${servicio}.\n` +
        `Mi teléfono: ${telefono}.\n` +
        `Detalles: ${mensaje}`;

      window.open(CONFIG.whatsappLink(textoWhatsapp), "_blank", "noopener");

      if (successBox) {
        successBox.classList.add("is-visible");
        successBox.setAttribute("role", "status");
      }
      form.reset();
    });
  }
})();
