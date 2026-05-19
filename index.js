const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const twilio = require('twilio');
const MENU = require('./menu');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const conversations = {};

const SYSTEM_PROMPT = `Eres el asistente virtual de L'Orangerie, un restaurante gourmet de estilo francés en Ciudad Juárez, Chihuahua, México.

Tu nombre es "Héloïse". Siempre hablas en español con calidez y profesionalismo.

INFORMACIÓN DEL RESTAURANTE:
- Nombre: L'Orangerie — Cafetería, Restaurante y Panadería Gourmet Europea
- Dirección: Blvrd Francisco Villarreal Torres 11204, Local 15, Partido Senecu, 32545 Juárez, Chihuahua
- Horario: Lunes a Sábado de 7:00 AM a 10:00 PM
- Instagram: @lorangeriejrz | Facebook: @lorangerie.juarez
- Especialidades: Pan de masa madre artesanal, pan dulce, cocina francesa y cafés de especialidad

MENÚ COMPLETO (precios en pesos mexicanos):
${MENU}

PROGRAMA DE LEALTAD:
- 1 sello por visita. 10 sellos = beneficio especial (bebida o postre gratis)
- 1 punto por cada $10 gastados
- Registro con nombre y número de teléfono

INSTRUCCIONES:
- Cuando alguien diga "hola" o escriba por primera vez, preséntate y muestra este menú:
  "¡Bonjour! Bienvenido a L'Orangerie 🥐 Soy Héloïse, tu asistente virtual.
  1️⃣ Ver el menú  2️⃣ Hacer una reservación  3️⃣ Horarios y ubicación  4️⃣ Programa de lealtad  5️⃣ Hablar con el equipo"
- Respuestas cortas y directas (máximo 3 párrafos)
- Para reservaciones: pide fecha, hora, personas y nombre
- Para disponibilidad de mesas: indica que el equipo confirmará
- Nunca inventes precios o platillos que no estén en el menú`;

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

app.post('/webhook', async (req, res) => {
  const { From, Body } = req.body;
  console.log(`Mensaje de ${From}: ${Body}`);

  // Responder a Twilio inmediatamente para evitar timeouts
  res.type('text/xml');
  res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');

  if (!From || !Body) return;

  const userMessage = Body.trim();

  if (!conversations[From]) conversations[From] = [];

  conversations[From].push({ role: 'user', content: userMessage });

  if (conversations[From].length > 10) {
    conversations[From] = conversations[From].slice(-10);
  }

  const cleanMessages = fixConversation(conversations[From]);

  let botReply;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: cleanMessages
    });

    botReply = response.content[0].text;
    console.log(`Respuesta para ${From}: ${botReply.substring(0, 100)}...`);

  } catch (err) {
    console.error('Error Claude API:', err.message);
    conversations[From] = [];
    botReply = 'Disculpa, tuve un problema técnico. Escribe "hola" para comenzar de nuevo 🙏';
  }

  conversations[From].push({ role: 'assistant', content: botReply });

  // Enviar respuesta como mensaje saliente
  try {
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: From,
      body: botReply
    });
    console.log(`Mensaje enviado exitosamente a ${From}`);
  } catch (err) {
    console.error('Error enviando mensaje:', err.message);
  }
});

app.get('/', (req, res) => {
  res.send(`<h2>🥐 L'Orangerie Bot</h2><p>✅ En línea y funcionando.</p>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`L'Orangerie Bot corriendo en el puerto ${PORT}`));

