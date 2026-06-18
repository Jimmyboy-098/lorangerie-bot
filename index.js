const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const twilio = require('twilio');
const MENU = require('./menu');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// In-memory stores (se reinician al reiniciar el servidor)
const conversations = {};
const reservations = []; // { id, from, name, date, time, guests, utcMs, confirmedAt, calEventId }
const subscribers = new Set(); // números whatsapp:+52...

// --- Google Calendar (opcional — solo activo si GOOGLE_SERVICE_ACCOUNT_JSON está configurado) ---
let calendar = null;
(function initCalendar() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return;
  try {
    const { google } = require('googleapis');
    const creds = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64').toString()
    );
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });
    calendar = google.calendar({ version: 'v3', auth });
    console.log('Google Calendar: conectado ✓');
  } catch (e) {
    console.warn('Google Calendar no pudo inicializarse:', e.message);
  }
})();

// --- Helpers de tiempo ---

// Convierte fecha/hora local de Ciudad Juárez a objeto Date UTC
function juarezToUTC(dateStr, timeStr) {
  // Calcula el offset de Juárez midiendo la diferencia con UTC al mediodía de ese día
  const probe = new Date(`${dateStr}T12:00:00Z`);
  const juarezHour = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Ciudad_Juarez',
      hour: '2-digit',
      hour12: false
    }).format(probe)
  );
  const offsetHours = 12 - juarezHour; // e.g. 6 en verano (UTC-6)
  const local = new Date(`${dateStr}T${timeStr}:00Z`);
  return new Date(local.getTime() + offsetHours * 60 * 60 * 1000);
}

// Fecha de hoy en formato YYYY-MM-DD (hora Juárez)
function todayJuarez() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Ciudad_Juarez' });
}

// --- Validación de capacidad ---

function countOverlapping(dateStr, timeStr) {
  const resUTC = juarezToUTC(dateStr, timeStr).getTime();
  const window = 60 * 60 * 1000; // ventana de ±1 hora = 2 horas totales
  return reservations.filter(r => Math.abs(r.utcMs - resUTC) <= window).length;
}

// --- Google Calendar ---

async function createCalendarEvent(res) {
  if (!calendar) return null;
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const [h, m] = res.time.split(':').map(Number);
    const endH = String(h + 2).padStart(2, '0');
    const endDt = `${res.date}T${endH}:${String(m).padStart(2, '0')}:00`;

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `Reservación: ${res.name} (${res.guests} personas)`,
        description: `Reservado por WhatsApp. Contacto: ${res.from}`,
        start: { dateTime: `${res.date}T${res.time}:00`, timeZone: 'America/Ciudad_Juarez' },
        end:   { dateTime: endDt,                        timeZone: 'America/Ciudad_Juarez' }
      }
    });
    return event.data.id;
  } catch (e) {
    console.error('Error creando evento de calendario:', e.message);
    return null;
  }
}

// --- System Prompt ---

function getSystemPrompt() {
  const now = new Date();
  const juarezHour = parseInt(
    now.toLocaleString('en-US', { timeZone: 'America/Ciudad_Juarez', hour: 'numeric', hour12: false })
  );
  const juarezTime = now.toLocaleString('es-MX', {
    timeZone: 'America/Ciudad_Juarez',
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  // Día de la semana en Juárez (los domingos el local solo abre 9 AM–1 PM y solo desayunos)
  const juarezWeekday = now.toLocaleString('en-US', { timeZone: 'America/Ciudad_Juarez', weekday: 'short' });
  const esDomingo = juarezWeekday === 'Sun';

  let horarioDesayunos;
  if (esDomingo) {
    const abiertoDomingo = juarezHour >= 9 && juarezHour < 13;
    horarioDesayunos = abiertoDomingo
      ? `Hoy es DOMINGO: el restaurante abre solo de 9:00 AM a 1:00 PM y SOLO se sirven DESAYUNOS (los domingos no hay menú de comida fuerte). Los desayunos están disponibles ahora.`
      : `Hoy es DOMINGO: el restaurante abre solo de 9:00 AM a 1:00 PM y SOLO se sirven desayunos. En este momento está CERRADO. Si alguien quiere ordenar o pregunta por comida, explícale amablemente que los domingos solo abrimos de 9:00 AM a 1:00 PM (solo desayunos).`;
  } else {
    const desayunosActivos = juarezHour >= 7 && juarezHour < 14;
    horarioDesayunos = desayunosActivos
      ? `Los DESAYUNOS están disponibles ahora (servicio hasta las 2:00 PM).`
      : `Los DESAYUNOS NO están disponibles en este momento. El servicio de desayunos es de 7:00 AM a 2:00 PM. Si alguien pregunta por algún desayuno, explica amablemente que ya terminó el horario y sugiere opciones del menú de comida.`;
  }

  const today = todayJuarez();

  return `Eres el asistente virtual de L'Orangerie, un restaurante gourmet de estilo francés en Ciudad Juárez, Chihuahua, México.

Tu nombre es "Héloïse". Siempre hablas en español con calidez y profesionalismo.

HORA ACTUAL EN CIUDAD JUÁREZ: ${juarezTime}
FECHA HOY: ${today}
DISPONIBILIDAD: ${horarioDesayunos}

INFORMACIÓN DEL RESTAURANTE:
- Nombre: L'Orangerie — Cafetería, Restaurante y Panadería Gourmet Europea
- Dirección: Blvrd Francisco Villarreal Torres 11204, Local 15, Partido Senecu, 32545 Juárez, Chihuahua
- Horario: Lunes a Sábado de 7:00 AM a 10:00 PM. Domingos de 9:00 AM a 1:00 PM (solo servicio de desayunos)
- Instagram: @lorangeriejrz | Facebook: @lorangerie.juarez
- Especialidades: Pan de masa madre artesanal, pan dulce, cocina francesa y cafés de especialidad

MENÚ COMPLETO (precios en pesos mexicanos):
${MENU}

PROGRAMA DE LEALTAD:
- 1 sello por visita. 10 sellos = beneficio especial (bebida o postre gratis)
- 1 punto por cada $10 gastados
- Registro con nombre y número de teléfono

RESERVACIONES — INSTRUCCIONES CRÍTICAS:
- El restaurante acepta reservaciones de lunes a sábado de 7:00 AM a 10:00 PM, y los domingos de 9:00 AM a 1:00 PM (los domingos solo hay servicio de desayunos)
- NO aceptes reservaciones para domingo fuera de 9:00 AM–1:00 PM ni para platillos que no sean desayunos ese día. Si lo piden, explica amablemente el horario del domingo.
- REGLA: las reservaciones requieren MÍNIMO 2 horas de anticipación a la hora actual
- Cuando tengas TODOS los datos del cliente (nombre, fecha, hora, número de personas), incluye esta línea EXACTAMENTE al final de tu mensaje — sin espacios dentro de los corchetes:
  [RES:{"nombre":"NOMBRE","fecha":"YYYY-MM-DD","hora":"HH:MM","personas":N}]
  Ejemplo: [RES:{"nombre":"Ana López","fecha":"${today}","hora":"20:00","personas":3}]
- Si el cliente dice "mañana", calcula la fecha a partir de hoy (${today})
- Convierte siempre la hora a formato 24h (7:00 PM → 19:00, 7:00 AM → 07:00)
- NUNCA confirmes una reservación sin tener los 4 datos: nombre, fecha, hora y número de personas
- Si el sistema rechaza la reservación, te avisaré con un mensaje entre corchetes como [ERROR: motivo]. En ese caso explica amablemente el problema al cliente y ofrece alternativas.

INSTRUCCIONES GENERALES:
- Cuando alguien diga "hola" o escriba por primera vez, preséntate y muestra este menú:
  "¡Bonjour! Bienvenido a L'Orangerie 🥐 Soy Héloïse, tu asistente virtual.
  1️⃣ Ver el menú  2️⃣ Hacer una reservación  3️⃣ Horarios y ubicación  4️⃣ Programa de lealtad  5️⃣ Hablar con el equipo"
- Respuestas cortas y directas (máximo 3 párrafos)
- Nunca inventes precios o platillos que no estén en el menú`;
}

// --- Broadcast ---

async function sendBroadcast(message) {
  const from = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
  let sent = 0, failed = 0;
  for (const to of subscribers) {
    try {
      await twilioClient.messages.create({ from, to, body: message });
      sent++;
      await new Promise(r => setTimeout(r, 250)); // evitar rate limit de Twilio
    } catch (e) {
      console.error(`Broadcast fallido a ${to}:`, e.message);
      failed++;
    }
  }
  return { sent, failed };
}

// --- Lógica principal de conversación ---

function fixConversation(messages) {
  if (messages.length === 0) return messages;
  const fixed = [messages[0]];
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role !== fixed[fixed.length - 1].role) {
      fixed.push(messages[i]);
    } else {
      fixed[fixed.length - 1] = messages[i];
    }
  }
  return fixed;
}

async function handleMessage(From, userMessage, res) {
  if (!conversations[From]) conversations[From] = [];

  conversations[From].push({ role: 'user', content: userMessage });
  if (conversations[From].length > 10) {
    conversations[From] = conversations[From].slice(-10);
  }

  let botReply;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: getSystemPrompt(),
      messages: fixConversation(conversations[From])
    });
    botReply = response.content[0].text;
    console.log(`Respuesta a ${From}: ${botReply.substring(0, 80)}...`);
  } catch (err) {
    console.error('Error Claude API:', err.message);
    conversations[From] = [];
    botReply = 'Disculpa, tuve un problema. Escribe "hola" para comenzar de nuevo 🙏';
  }

  // Procesar marcador de reservación
  const resMatch = botReply.match(/\[RES:\s*(\{[^[\]]*\})\s*\]/);
  if (resMatch) {
    botReply = botReply.replace(/\n?\[RES:\s*\{[^[\]]*\}\s*\]/g, '').trim();
    try {
      const { nombre, fecha, hora, personas } = JSON.parse(resMatch[1]);
      const resUTC = juarezToUTC(fecha, hora);
      const hoursUntil = (resUTC - new Date()) / (1000 * 60 * 60);

      if (hoursUntil < 2) {
        // Inyectar el rechazo como mensaje de sistema en la conversación y pedir a Claude que lo reformule
        const errorPrompt = `[ERROR: La reservación solicitada (${fecha} a las ${hora}) no cumple con el mínimo de 2 horas de anticipación. Son las ${new Date().toLocaleString('es-MX', { timeZone: 'America/Ciudad_Juarez', hour: '2-digit', minute: '2-digit', hour12: false })} y solo hay ${hoursUntil.toFixed(1)} horas. Explica esto amablemente y pide al cliente que elija otra fecha u hora.]`;
        conversations[From].push({ role: 'user', content: errorPrompt });
        try {
          const retry = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 300,
            system: getSystemPrompt(),
            messages: fixConversation(conversations[From])
          });
          botReply = retry.content[0].text.replace(/\n?\[RES:\s*\{[^[\]]*\}\s*\]/g, '').trim();
          conversations[From].push({ role: 'assistant', content: botReply });
        } catch {
          botReply = `Lo siento, las reservaciones deben hacerse con al menos 2 horas de anticipación. En este momento no es posible para esa hora. ¿Te gustaría elegir otra fecha u horario? 🕐`;
          conversations[From].push({ role: 'assistant', content: botReply });
        }
      } else if (countOverlapping(fecha, hora) >= 10) {
        const errorPrompt = `[ERROR: Ya hay 10 reservaciones para el horario ${hora} del ${fecha}. El cupo está lleno para esa ventana de tiempo. Explica que el horario está lleno y sugiere amablemente media hora antes o después.]`;
        conversations[From].push({ role: 'user', content: errorPrompt });
        try {
          const retry = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 300,
            system: getSystemPrompt(),
            messages: fixConversation(conversations[From])
          });
          botReply = retry.content[0].text.replace(/\n?\[RES:\s*\{[^[\]]*\}\s*\]/g, '').trim();
          conversations[From].push({ role: 'assistant', content: botReply });
        } catch {
          botReply = `Lo siento, ya tenemos el cupo lleno para ese horario. ¿Te gustaría reservar media hora antes o después? Con gusto revisamos disponibilidad. 🗓`;
          conversations[From].push({ role: 'assistant', content: botReply });
        }
      } else {
        // Reservación válida — guardar y crear evento en calendario
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const calEventId = await createCalendarEvent({ name: nombre, date: fecha, time: hora, guests: personas, from: From });
        reservations.push({
          id, from: From, name: nombre, date: fecha, time: hora,
          guests: personas, utcMs: resUTC.getTime(),
          confirmedAt: Date.now(), calEventId
        });
        console.log(`✅ Reservación guardada: ${nombre} | ${fecha} ${hora} | ${personas} pax${calEventId ? ' | 📅 Calendario' : ''}`);
        conversations[From].push({ role: 'assistant', content: botReply });
      }
    } catch (e) {
      console.error('Error procesando marcador de reservación:', e.message);
      conversations[From].push({ role: 'assistant', content: botReply });
    }
  } else {
    conversations[From].push({ role: 'assistant', content: botReply });
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(botReply);
  res.type('text/xml');
  res.send(twiml.toString());
}

// --- Webhook de Twilio ---

app.post('/webhook', async (req, res) => {
  const { From, Body } = req.body;
  if (!From || !Body) return res.status(400).send('Bad request');

  const userMessage = Body.trim();
  console.log(`📩 Mensaje de ${From}: ${userMessage}`);

  // Registrar suscriptor
  subscribers.add(From);

  // Comandos de administrador (desde el número de Jaime)
  const adminWA = process.env.ADMIN_WHATSAPP ? `whatsapp:${process.env.ADMIN_WHATSAPP}` : null;
  if (adminWA && From === adminWA) {
    const cmd = userMessage.toLowerCase();

    if (cmd.startsWith('/broadcast ')) {
      const msg = userMessage.slice('/broadcast '.length).trim();
      const results = await sendBroadcast(msg);
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(`✅ Enviado a ${results.sent} clientes. Fallidos: ${results.failed}.`);
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    if (cmd === '/reservaciones') {
      const today = todayJuarez();
      const todayRes = reservations
        .filter(r => r.date === today)
        .sort((a, b) => a.time.localeCompare(b.time));
      const twiml = new twilio.twiml.MessagingResponse();
      if (todayRes.length === 0) {
        twiml.message(`No hay reservaciones para hoy (${today}).`);
      } else {
        const list = todayRes.map(r => `• ${r.time} — ${r.name} (${r.guests} pax)`).join('\n');
        twiml.message(`Reservaciones del ${today}:\n${list}\n\nTotal: ${todayRes.length}`);
      }
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    if (cmd === '/suscriptores') {
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(`Suscriptores activos: ${subscribers.size}`);
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    if (cmd === '/ayuda') {
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(
        `Comandos disponibles:\n` +
        `/broadcast <mensaje> — Enviar mensaje a todos los clientes\n` +
        `/reservaciones — Ver reservaciones de hoy\n` +
        `/suscriptores — Ver total de suscriptores\n` +
        `/ayuda — Ver esta lista`
      );
      res.type('text/xml');
      return res.send(twiml.toString());
    }
  }

  await handleMessage(From, userMessage, res);
});

// --- Endpoints de administración (HTTP) ---

function requireToken(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

// POST /admin/broadcast — enviar mensaje a todos los suscriptores
// Body: { "message": "Hoy 20% de descuento en postres 🍮" }
// Header: x-admin-token: TU_TOKEN
app.post('/admin/broadcast', requireToken, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Se requiere el campo "message"' });
  const results = await sendBroadcast(message);
  res.json({ ok: true, ...results, totalSubscribers: subscribers.size });
});

// GET /admin/reservations?date=YYYY-MM-DD
app.get('/admin/reservations', requireToken, (req, res) => {
  const date = req.query.date || todayJuarez();
  const day = reservations
    .filter(r => r.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
  res.json({ date, count: day.length, reservations: day });
});

// --- Health check ---

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: "L'Orangerie Bot",
    subscribers: subscribers.size,
    reservations: reservations.length,
    calendar: calendar ? 'conectado' : 'no configurado'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`L'Orangerie Bot corriendo en el puerto ${PORT}`));
