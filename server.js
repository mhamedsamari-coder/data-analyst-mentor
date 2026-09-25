require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

// Node 18+ a `fetch` intégré nativement. Sur une version plus ancienne (ex: Node 16),
// on utilise le paquet node-fetch comme filet de sécurité.
if (typeof fetch === "undefined") {
  global.fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
// openai/gpt-oss-120b est un bon compromis qualité/débit sur le tier gratuit Groq.
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// ---------- Base de données (Postgres) ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL manquant : les données ne seront pas sauvegardées entre sessions.");
    return;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log("Base de données prête.");
}
initDb().catch((err) => console.error("Erreur d'initialisation de la base:", err));

app.get("/api/data/:userId", async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json({ data: {} });
    const { userId } = req.params;
    const result = await pool.query("SELECT data FROM user_data WHERE user_id = $1", [userId]);
    res.json({ data: result.rows[0]?.data || {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur de lecture de la base de données." });
  }
});

app.post("/api/data/:userId", async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json({ ok: true, persisted: false });
    const { userId } = req.params;
    const { data } = req.body || {};
    await pool.query(
      `INSERT INTO user_data (user_id, data, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = now()`,
      [userId, data || {}]
    );
    res.json({ ok: true, persisted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur d'écriture dans la base de données." });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({
        error: "GROQ_API_KEY manquant sur le serveur. Ajoute-le dans le fichier .env",
      });
    }
    const { system, user } = req.body || {};
    if (!user) {
      return res.status(400).json({ error: "Message utilisateur manquant." });
    }

    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: user });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1800,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Erreur API Groq: ${errText}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mentor Data Analyst en écoute sur http://localhost:${PORT}`);
});
