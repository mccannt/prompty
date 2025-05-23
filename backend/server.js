import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());

let db;
const start = async () => {
  db = await open({ filename: "./db.sqlite", driver: sqlite3.Database });

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
    await db.run(
      "INSERT INTO prompts (title, body, tags, locked) VALUES (?, ?, ?, ?)",
      [
        "Create a Unit Test",
        "Write a unit test for the following function. Use Jest.\n\nfunction add(a, b) { return a + b; }",
        "Technical,Testing,Engineering",
        1
      ]
    );
    await db.run(
      "INSERT INTO prompts (title, body, tags, locked) VALUES (?, ?, ?, ?)",
      [
        "Draft a Sprint Retrospective Summary",
        "Summarize the following sprint retrospective into three key action items and a short summary paragraph.",
        "Non-Technical,Agile,Meetings",
        0
      ]
    );
    await db.run(
      "INSERT INTO prompts (title, body, tags, locked) VALUES (?, ?, ?, ?)",
      [
        "Jira Bug Report Template",
        "Create a Jira bug report template for the following defect.\nSteps to Reproduce:\nExpected Result:\nActual Result:\nEnvironment:",
        "Technical,Jira,Bug",
        1
      ]
    );
    await db.run(
      "INSERT INTO prompts (title, body, tags, locked) VALUES (?, ?, ?, ?)",
      [
        "Team Announcement",
        "Draft a brief Slack announcement for the team regarding the new remote work policy. Tone: friendly and concise.",
        "Non-Technical,HR,Slack",
        0
      ]
    );
  }
};

await start();

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
