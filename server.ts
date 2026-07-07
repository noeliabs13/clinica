import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client safely
let ai: any = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("WARNING: GEMINI_API_KEY is not configured or has placeholder value.");
  }
} catch (error) {
  console.error("Failed to initialize GoogleGenAI:", error);
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "noeliabs-92d99" });
});

// Gemini Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  if (!ai) {
    return res.json({
      text: "Hola, soy el asistente virtual de la Clínica Premium. Lo siento, pero el servicio de IA no está configurado correctamente en este momento (Falta configurar GEMINI_API_KEY). ¿Puedo ayudarte con alguna información general de la clínica?"
    });
  }

  try {
    // Format messages for @google/genai
    // System instruction:
    const systemInstruction = 
      "Actúas como un asistente virtual altamente calificado de la Clínica Premium (clínica médica privada de lujo). " +
      "Tu objetivo es ayudar a los pacientes brindándoles orientación cálida, profesional y premium. " +
      "Nuestras especialidades principales son Cardiología (Dra. Elena Valdés), Neurocirugía (Dr. Julian Marcos) y Dermatología (Dra. Sofía Rivas). " +
      "Puedes orientarles sobre síntomas de forma informativa, pero siempre recuerda de manera sutil que tu consejo es informativo y deben consultar a uno de nuestros especialistas. " +
      "También puedes explicarles cómo agendar, reprogramar o cancelar citas en su panel privado. " +
      "Habla siempre en español con un tono respetuoso, sofisticado, impecable y empático.";

    // Translate our ChatMessage list to Gemini contents format
    // Contents format: [{ role: 'user'|'model', parts: [{ text: '...' }] }]
    const contents = messages.map((msg: any) => {
      return {
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      };
    });

    // Generate content using gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "Disculpe, no he podido procesar su solicitud. ¿Podría repetirla?";
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Error processing your request", 
      details: error.message || String(error)
    });
  }
});

// Vite middleware for development, or static file serving for production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static build serving configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();
