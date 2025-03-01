require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 3000;

// Cargar clave de API desde .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Error: Falta la clave de API en .env");
  process.exit(1);
}

app.use(express.static("public"));
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Ruta para analizar la imagen con Gemini
app.post("/analizar", async (req, res) => {
  try {
    const { image } = req.body;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: "Describe el objeto principal en la imagen en español, con precisión y en una sola frase." },
              { inline_data: { mime_type: "image/png", data: image } }
            ]
          }
        ]
      }
    );

    console.log("Respuesta de Gemini:", JSON.stringify(response.data, null, 2));
    const description = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo describir.";

    res.json({ description });

  } catch (error) {
    console.error("❌ Error en la API de Gemini:", error.response?.data || error.message);
    res.status(500).json({ description: "Error en la API. Revisa la clave o los límites de uso." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
