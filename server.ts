import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client (server-side only, safe from browser exposure)
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
} catch (error) {
  console.error("Failed to initialize Gemini client:", error);
}

// Store simulated emails in memory for dashboard audit/logs
const sentEmails: Array<{
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: "sent" | "failed";
}> = [];

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API: Use Gemini to summarize financial data, stock, or driver performance
app.post("/api/gemini/summarize", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Gemini AI assistant is not initialized. Please verify your GEMINI_API_KEY in Secrets.",
    });
  }

  const { type, data } = req.body;
  
  let prompt = "";
  if (type === "financial") {
    prompt = `Eres un asesor financiero experto para "SuperEconomico", un supermercado 100% digital (dark store / sin tienda física) que opera únicamente mediante app móvil.
Analiza los siguientes datos financieros y operativos del último mes:
${JSON.stringify(data)}

Por favor, genera un informe ejecutivo en español, profesional y directo. Debe incluir:
1. Resumen ejecutivo de ventas y rentabilidad.
2. Análisis de costos (combustible de reparto, inventario perecedero, mermas de dark store).
3. Tres recomendaciones estratégicas clave para optimizar la logística de última milla (último kilómetro) y reducir costos operativos.
Devuelve el informe en formato Markdown claro. No uses lenguaje autocomplaciente ni excesivamente técnico, sé directo y pragmático.`;
  } else if (type === "tickets") {
    prompt = `Eres el Gerente de Operaciones y Atención al Cliente de "SuperEconomico".
Analiza los siguientes tickets de soporte activos y reclamos de entregas:
${JSON.stringify(data)}

Genera un breve reporte en español que incluya:
1. Diagnóstico de los problemas principales (ej. retrasos de choferes, productos dañados, faltantes de inventario).
2. Propuesta de resolución inmediata para los casos más críticos.
3. Un plan de acción preventivo para los repartidores en ruta.
Devuelve el reporte en Markdown limpio.`;
  } else {
    prompt = `Eres el asistente inteligente de SuperEconomico. Analiza la siguiente información logística de entrega a domicilio y brinda un resumen ejecutivo en español:
${JSON.stringify(data)}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Gemini summarize error:", error);
    res.status(500).json({ error: error.message || "Failed to generate summary with Gemini." });
  }
});

// API: Use Gemini to draft an email (refund, notification, driver notice, report sharing)
app.post("/api/gemini/draft-email", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Gemini AI assistant is not initialized. Please verify your GEMINI_API_KEY in Secrets.",
    });
  }

  const { recipientType, purpose, extraDetails } = req.body;

  const prompt = `Eres el encargado de comunicación corporativa de "SuperEconomico" (supermercado digital de reparto a domicilio).
Escribe un borrador de correo electrónico profesional, claro y empático en español.

- Destinatario: ${recipientType === "customer" ? "Cliente de la App" : "Chofer / Repartidor"}
- Propósito del correo: ${purpose}
- Detalles adicionales: ${extraDetails || "Ninguno"}

El correo debe tener un asunto profesional y un cuerpo con formato limpio, incluyendo saludos adecuados, la explicación transparente de la situación (con soluciones claras si es un problema de entrega o reembolso), y una firma corporativa elegante.
Devuelve el resultado como un objeto JSON con las propiedades "subject" (string) y "body" (string en texto plano pero bien estructurado con saltos de línea). No rodees el JSON con bloques de código markdown, entrega el JSON directamente.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (response.text) {
      try {
        const emailDraft = JSON.parse(response.text.trim());
        res.json(emailDraft);
      } catch (jsonErr) {
        // Fallback if parsing fails
        res.json({
          subject: `Actualización de SuperEconomico - ${purpose}`,
          body: response.text,
        });
      }
    } else {
      throw new Error("Empty response from Gemini.");
    }
  } catch (error: any) {
    console.error("Gemini draft email error:", error);
    res.status(500).json({ error: error.message || "Failed to draft email with Gemini." });
  }
});

// API: Send email (simulation)
app.post("/api/emails/send", (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: "Missing required email fields (to, subject, body)" });
  }

  // Generate simulated SMTP details
  const emailId = "mail_" + Math.random().toString(36).substring(2, 9);
  const newEmail = {
    id: emailId,
    to,
    subject,
    body,
    sentAt: new Date().toISOString(),
    status: "sent" as const,
  };

  sentEmails.push(newEmail);

  res.json({
    success: true,
    message: "Email sent successfully (Simulated SMTP)",
    email: newEmail,
    smtpLog: `[SMTP Client] Connecting to mail.supereconomico.com:587...
[SMTP Client] TLS Handshake Successful.
[SMTP Client] AUTH LOGIN Success.
[SMTP Client] MAIL FROM: <noreply@supereconomico.com>
[SMTP Client] RCPT TO: <${to}>
[SMTP Client] DATA block accepted. Message-ID: <${emailId}@supereconomico.com>
[SMTP Client] 250 OK: Message accepted for delivery.`,
  });
});

// API: Get email delivery log
app.get("/api/emails/logs", (req, res) => {
  res.json({ logs: sentEmails });
});

// Setup Vite Dev server or Serve Static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for SPA routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SuperEconomico Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
