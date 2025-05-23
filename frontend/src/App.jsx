import React, { useEffect, useState } from "react";
import axios from "axios";

const TAGS = [
  "Technical", "Non-Technical", "Testing", "Engineering", "Agile", "Meetings",
  "Jira", "Bug", "HR", "Slack"
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function TagButton({ tag, active, onClick }) {
  return (
    <button
      className={classNames(
        "px-3 py-1 rounded-full border text-xs font-medium mx-1 mb-2",
        active
          ? "bg-violet-600 text-white border-violet-600"
          : "bg-transparent dark:bg-gray-800 text-violet-600 border-violet-600"
      )}
      onClick={() => onClick(tag)}
    >
      {tag}
    </button>
  );
}

function PromptCard({ prompt, onEdit, onDelete, onToggleLock }) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-800 p-4 shadow-md flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{prompt.title}</h3>
        <div className="flex items-center gap-2">
          <button
            className={classNames(
              "px-2 py-1 text-xs rounded",
              prompt.locked
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500"
                : "bg-red-100 dark:bg-red-800 text-red-600"
            )}
            disabled={prompt.locked}
            onClick={() => onDelete(prompt)}
            title={prompt.locked ? "Unlock before deleting" : "Delete"}
          >
            🗑
          </button>
          <button
            className={classNames(
              "px-2 py-1 text-xs rounded",
              "bg-violet-100 dark:bg-violet-700 text-violet-700 dark:text-violet-200"
            )}
            onClick={() => onEdit(prompt)}
          >
            ✏️
          </button>
          <button
            className={classNames(
              "px-2 py-1 text-xs rounded",
              prompt.locked
                ? "bg-yellow-400 dark:bg-yellow-600 text-white"
                : "bg-gray-200 dark:bg-gray-600 text-gray-900"
            )}
            onClick={() => onToggleLock(prompt)}
          >
            {prompt.locked ? "🔒" : "🔓"}
          </button>
        </div>
      </div>
      <div className="text-sm whitespace-pre-line">{prompt.body}</div>
      <div className="flex flex-wrap gap-1 mt-2">
        {prompt.tags.split(",").map((tag) => (
          <span key={tag} className="bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-200 rounded-full px-2 py-0.5 text-xs">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function PromptForm({ prompt, onSave, onCancel }) {
  const [form, setForm] = useState(
    prompt || { title: "", body: "", tags: "", locked: false }
  );
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-10">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="font-semibold text-lg mb-3">
          {prompt ? "Edit Prompt" : "New Prompt"}
        </h2>
        <input
          className="mb-2 p-2 w-full rounded border bg-gray-50 dark:bg-gray-900"
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="mb-2 p-2 w-full rounded border bg-gray-50 dark:bg-gray-900"
          placeholder="Prompt Body"
          value={form.body}
          rows={4}
          onChange={e => setForm({ ...form, body: e.target.value })}
        />
        <input
          className="mb-2 p-2 w-full rounded border bg-gray-50 dark:bg-gray-900"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 rounded bg-violet-600 text-white"
            disabled={!form.title || !form.body}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [prompts, setPrompts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("All");
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

//   const loadPrompts = async () => {
//     const res = await axios.get("http://localhost:5001/api/prompts");
//     setPrompts(res.data);
//   };

  const loadPrompts = async () => {
    try {
        const res = await axios.get("http://localhost:5001/api/prompts");
        console.log("API DATA:", res.data);
        setPrompts(res.data);
    } catch (error) {
        console.error("API ERROR:", error);
        setPrompts([]);
    }
};



  useEffect(() => {
    loadPrompts();
  }, []);

  const handleSave = async (form) => {
  try {
    if (editing) {
      await axios.put(`http://localhost:5001/api/prompts/${editing.id}`, { ...form });
    } else {
      await axios.post("http://localhost:5001/api/prompts", form);
    }
    setShowForm(false);
    setEditing(null);
    loadPrompts();
  } catch (error) {
    console.error("handleSave ERROR:", error);
    alert("Failed to save prompt. Check console for details.");
  }
};


  const handleDelete = async (prompt) => {
  if (prompt.locked) {
    alert("Prompt is locked. Unlock before deleting.");
    return;
  }
  if (window.confirm("Delete this prompt?")) {
    try {
      await axios.delete(`http://localhost:5001/api/prompts/${prompt.id}`);
      loadPrompts();
    } catch (error) {
      console.error("handleDelete ERROR:", error);
      alert("Failed to delete prompt. Check console for details.");
    }
  }
};


  const handleToggleLock = async (prompt) => {
  try {
    await axios.patch(`http://localhost:5001/api/prompts/${prompt.id}/lock`, { locked: prompt.locked ? 0 : 1 });
    loadPrompts();
  } catch (error) {
    console.error("handleToggleLock ERROR:", error);
    alert("Failed to toggle lock. Check console for details.");
  }
};


  const filteredPrompts =
    filter === "All"
      ? prompts
      : prompts.filter((p) =>
          p.tags
            .split(",")
            .map((t) => t.trim())
            .includes(filter)
        );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-violet-700 dark:text-violet-300">
            Prompt Library
          </h1>
          <div className="text-xs text-gray-400">Modern prompts for engineering teams</div>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className="px-3 py-2 rounded bg-violet-600 text-white font-semibold"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Add Prompt
          </button>
          <button
            className="p-2 rounded-full text-xl"
            title="Toggle dark mode"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? "🌙" : "☀️"}
          </button>
        </div>
      </header>
      <section className="p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <TagButton tag="All" active={filter === "All"} onClick={setFilter} />
          {TAGS.map((tag) => (
            <TagButton key={tag} tag={tag} active={filter === tag} onClick={setFilter} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={(p) => {
                setEditing(p);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onToggleLock={handleToggleLock}
            />
          ))}
        </div>
      </section>
      {showForm && (
        <PromptForm
          prompt={editing}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}