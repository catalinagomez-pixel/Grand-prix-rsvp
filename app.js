// Private Executive Dinner · RSVP
// Envía la respuesta a /api/rsvp (función de Vercel), que la reenvía al webhook de Make.
(function () {
  'use strict';

  var FUENTE = 'GRAND_PRIX_SAVE_THE_DATE';
  var ENDPOINT = '/api/rsvp';
  var TIMEOUT_MS = 15000;

  var form = document.getElementById('rsvp-form');
  var btn = document.getElementById('submit');
  var formError = document.getElementById('form-error');
  var BTN_TEXT = btn.textContent;

  var fields = {
    nombre: document.getElementById('nombre'),
    empresa: document.getElementById('empresa'),
    email: document.getElementById('email')
  };
  var choice = form.querySelector('.choice');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(id, msg) {
    var el = document.getElementById(id + '-error');
    if (el) el.textContent = msg || '';
  }

  function validate() {
    var ok = true;
    var first = null;

    ['nombre', 'empresa', 'email'].forEach(function (key) {
      var input = fields[key];
      var value = input.value.trim();
      var msg = '';
      if (!value) msg = 'Este campo es obligatorio.';
      else if (key === 'email' && !EMAIL_RE.test(value)) msg = 'Ingresa un correo electrónico válido.';
      setError(key, msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) { ok = false; if (!first) first = input; }
    });

    var selected = form.querySelector('input[name="estadoRsvp"]:checked');
    if (!selected) {
      setError('estado', 'Selecciona una opción.');
      choice.setAttribute('data-invalid', 'true');
      ok = false;
      if (!first) first = form.querySelector('input[name="estadoRsvp"]');
    } else {
      setError('estado', '');
      choice.removeAttribute('data-invalid');
    }

    if (first) first.focus();
    return ok;
  }

  // Limpia el error de un campo cuando la persona lo corrige
  Object.keys(fields).forEach(function (key) {
    fields[key].addEventListener('input', function () {
      if (fields[key].getAttribute('aria-invalid') === 'true') {
        setError(key, '');
        fields[key].setAttribute('aria-invalid', 'false');
      }
    });
  });
  form.querySelectorAll('input[name="estadoRsvp"]').forEach(function (r) {
    r.addEventListener('change', function () {
      setError('estado', '');
      choice.removeAttribute('data-invalid');
    });
  });

  function setLoading(loading) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Guardando tu respuesta…' : BTN_TEXT;
    btn.setAttribute('aria-busy', loading ? 'true' : 'false');
  }

  function showFinal(estado) {
    document.getElementById('view-form').hidden = true;
    var view = document.getElementById(estado === 'CONFIRMADO' ? 'view-yes' : 'view-no');
    view.hidden = false;
    window.scrollTo(0, 0);
    var title = view.querySelector('.title');
    if (title) title.focus();
  }

  var sending = false;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    formError.hidden = true;
    if (!validate()) return;

    var payload = {
      nombre: fields.nombre.value.trim(),
      empresa: fields.empresa.value.trim(),
      email: fields.email.value.trim(),
      estadoRsvp: form.querySelector('input[name="estadoRsvp"]:checked').value,
      fuente: FUENTE
    };

    sending = true;
    setLoading(true);

    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, TIMEOUT_MS) : null;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showFinal(payload.estadoRsvp);
      })
      .catch(function () {
        // No se borra nada de lo que la persona escribió
        formError.hidden = false;
        setLoading(false);
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        sending = false;
      });
  });
})();
