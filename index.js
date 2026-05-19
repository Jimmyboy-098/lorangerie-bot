const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const twilio = require('twilio');
const MENU = require('./menu');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Conversation memory per customer (resets if server restarts — fine for MVP)
const conversations = {};

const SYSTEM_PROMPT = `Eres el asistente virtual de L'Orangerie, un restaurante gourmet de estilo francés en Ciudad Juárez, Chihuahua, México.

Tu nombre es "Héloïse" y representas a L'Orangerie con calidez, profesionalismo y sofisticación. Siempre hablas en español.

INFORMACIÓN DEL RESTAURANTE:
- Nombre: L'Orangerie — Cafetería, Restaurante y Panadería Gourmet Europea
- Dirección: Blvrd Francisco Villarreal Torres 11204, Local 15, Partido Senecu, 32545 Juárez, Chihuahua
- Horario: Lunes a Sábado de 7:00 AM a 10:00 PM
- Instagram: @lorangeriejrz
- Facebook: @lorangerie.juarez
- Especialidades: Pan de masa madre artesanal, pan dulce, cocina francesa y cafés de especialidad

MENÚ COMPLETO CON PRECIOS (en pesos mexicanos):
${MENU}

PROGRAMA DE LEALTAD L'ORANGERIE REWARDS:
- Los clientes acumulan 1 sello digital por cada visita al restaurante
- Al completar 10 sellos reciben un beneficio especial (bebida gratis o postre)
- También acumulan puntos por consumo: 1 punto por cada $10 gastados
- Para registrarse solo necesitan su nombre y número de teléfono

CÓMO ATENDER AL CLIENTE:
1. Primera vez: saluda con "¡Bonjour!" y preséntate brevemente, ofrece el menú de opciones
2. Menú y precios: responde con entusiasmo, destaca los platillos especiales
3. Reservaciones: pide fecha, hora, número de personas y nombre. Confirma y di que el equipo estará listo
4. Ubicación y horarios: da la información completa y ofrece el link de Maps
5. Disponibilidad de mesas: para disponibilidad en tiempo real, indica que pueden llamar o que el equipo confirmará
6. Quejas o problemas: muestra empatía y ofrece comunicar con el gerente
7. Programa de lealtad: explica los beneficios y anima a registrarse

MENÚ DE BIENVENIDA (úsalo cuando alguien escribe por primera vez o dice "hola"):
¡Bonjour! Bienvenido a L'Orangerie 🥐

Soy Héloïse, tu asistente virtual. Estoy aquí para ayudarte con lo que necesites.

¿En qué te puedo ayudar hoy?

1️⃣ Ver el menú
2️⃣ Hacer una reservación
3️⃣ Horarios y ubicación
4️⃣ Programa de lealtad L'Orangerie Rewards
5️⃣ Hablar con alguien del equipo

Escribe el número de tu opción o cuéntame directamente qué necesitas 😊

REGLAS IMPORTANTES:
- Mantén respuestas concisas y amigables (máximo 3-4 párrafos por mensaje)
- Usa emojis con moderación para dar calidez sin perder elegancia
- Si no sabes algo específico, ofrece comunicar con el equipo
- Para disponibilidad exacta de mesas, siempre sugiere confirmar por teléfono o que el equipo revisará
- Nunca inventes información sobre el menú o precios
- Si piden algo que no está en el menú, discúlpate amablemente y sugiere alternativas`;

// Notify restaurant of new reservation via WhatsApp
async function notifyRestaurant(reservationDetails) {
  if (!process.env.RESTAURANT_WHATSAPP_NUMBER || !process.env.TWILIO_WHATSAPP_NUMBER) return;

  try {
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${process.env.RESTAURANT_WHATSAPP_NUMBER}`,
      body: `🗓️ *NUEVA RESERVACIÓN*\n\n${reservationDetails}\n\n_Mensaje automático de L'Orangerie Bot_`
    });
  } catch (err) {
    console.error('Error notifying restaurant:', err.message);
  }
}

app.post('/webhook', async (req, res) => {
  const { From, Body } = req.body;

  if (!From || !Body) {
    return res.status(400).send('Bad request');
  }

  const userMessage = Body.trim();
  const customerId = From;

  if (!conversations[customerId]) {
    conversations[customerId] = [];
  }

  conversations[customerId].push({
    role: 'user',
    content: userMessage
  });

  // Keep last 20 messages for context
  if (conversations[customerId].length > 20) {
    conversations[customerId] = conversations[customerId].slice(-20);
  }

  let botReply;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: conversations[customerId]
    });

    botReply = response.content[0].text;

    // Detect if a reservation was just confirmed and notify the restaurant
    const hasReservation = botReply.toLowerCase().includes('reservación confirmada') ||
                           botReply.toLowerCase().includes('reservación está confirmada') ||
                           botReply.toLowerCase().includes('tu reservación');

    if (hasReservation) {
      await notifyRestaurant(`Cliente: ${From}\nMensaje: ${userMessage}\n\nRespuesta bot:\n${botReply}`);
    }

  } catch (err) {
    console.error('Error with Claude API:', err.message);
    botReply = 'Disculpa, tuve un problema técnico. Por favor intenta de nuevo en un momento 🙏';
  }

  conversations[customerId].push({
    role: 'assistant',
    content: botReply
  });

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(botReply);

  res.type('text/xml');
  res.send(twiml.toString());
});

app.get('/', (req, res) => {
  res.send(`
    <h2>🥐 L'Orangerie Bot</h2>
    <p>El asistente virtual está activo y funcionando correctamente.</p>
    <p><strong>Estado:</strong> ✅ En línea</p>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`L'Orangerie Bot corriendo en el puerto ${PORT}`);
});
