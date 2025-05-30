import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { COMPREHENSIVE_PROMPTS } from "./comprehensive-prompts.js";

const app = express();
app.use(cors());
app.use(express.json());

let db;
const start = async () => {
  db = await open({ filename: "./data/db.sqlite", driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      tags TEXT,
      locked INTEGER DEFAULT 0
    );
  `);

  // Seed if empty
  const row = await db.get("SELECT COUNT(*) as count FROM prompts");
  if (row.count === 0) {
    console.log("Seeding database with comprehensive prompts...");
    for (const prompt of COMPREHENSIVE_PROMPTS) {
      await db.run(
        "INSERT INTO prompts (title, body, tags, locked) VALUES (?, ?, ?, ?)",
        [prompt.title, prompt.body, prompt.tags, prompt.locked]
      );
    }
    console.log(`Seeded ${COMPREHENSIVE_PROMPTS.length} prompts successfully!`);
  }
};

await start();

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API routes
app.get("/api/prompts", async (req, res) => {
  const rows = await db.all("SELECT * FROM prompts");
  res.json(rows);
});

app.post("/api/prompts", async (req, res) => {
  const { title, body, tags, locked } = req.body;
  const result = await db.run(
    "INSERT INTO prompts (title, body, tags, locked) VALUES (?, ?, ?, ?)",
    [title, body, tags, locked ? 1 : 0]
  );
  res.json({ id: result.lastID });
});

app.put("/api/prompts/:id", async (req, res) => {
  const { id } = req.params;
  const { title, body, tags, locked } = req.body;
  await db.run(
    "UPDATE prompts SET title=?, body=?, tags=?, locked=? WHERE id=?",
    [title, body, tags, locked ? 1 : 0, id]
  );
  res.sendStatus(204);
});

app.delete("/api/prompts/:id", async (req, res) => {
  const prompt = await db.get("SELECT * FROM prompts WHERE id=?", [req.params.id]);
  if (prompt.locked) {
    return res.status(403).json({ error: "Prompt is locked. Unlock before deleting." });
  }
  await db.run("DELETE FROM prompts WHERE id=?", [req.params.id]);
  res.sendStatus(204);
});

app.patch("/api/prompts/:id/lock", async (req, res) => {
  const { locked } = req.body;
  await db.run("UPDATE prompts SET locked=? WHERE id=?", [locked ? 1 : 0, req.params.id]);
  res.sendStatus(204);
});

app.listen(5000, "0.0.0.0", () => console.log("Backend running on http://0.0.0.0:5000"));
