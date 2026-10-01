// Función serverless de Vercel: recibe la respuesta del formulario y la reenvía al webhook de Make.
// La URL del webhook se toma ÚNICAMENTE de la variable de entorno MAKE_WEBHOOK_URL
// (Vercel > Settings > Environment Variables). No hay URL alternativa en el código.

const FUENTE = 'GRAND_PRIX_SAVE_THE_DATE';
const ESTADOS = ['CONFIRMADO', 'NO_ASISTIRA'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LEN = 200;

function clean(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_LEN) : '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
  if (!MAKE_WEBHOOK_URL) {
    console.error('Falta la variable de entorno MAKE_WEBHOOK_URL');
    return res.status(500).json({ ok: false, error: 'CONFIG_ERROR' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ ok: false });
  }

  const payload = {
    nombre: clean(body.nombre),
    empresa: clean(body.empresa),
    email: clean(body.email),
    estadoRsvp: clean(body.estadoRsvp),
    fuente: FUENTE // siempre este valor, venga lo que venga del navegador
  };

  if (
    !payload.nombre ||
    !payload.empresa ||
    !EMAIL_RE.test(payload.email) ||
    !ESTADOS.includes(payload.estadoRsvp)
  ) {
    return res.status(400).json({ ok: false });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const makeRes = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!makeRes.ok) {
      console.error('Make respondió', makeRes.status);
      return res.status(502).json({ ok: false });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error enviando a Make:', err && err.message);
    return res.status(502).json({ ok: false });
  }
};
