import React, { useEffect, useState } from "react";
import axios from "axios";

const TAGS = [
  "Technical", "Non-Technical", "Testing", "Engineering", "Agile", "Meetings",
  "Jira", "Bug", "HR", "Slack", "Email", "Social Media", "Writing", "Planning", 
  "Customer Service", "Education", "Marketing", "Personal", "Creative", "Productivity",
  "Security", "Performance", "Architecture", "DevOps", "Database", "API", "Cloud",
  "Code Review", "Documentation", "Infrastructure", "Design", "Optimization",
  "Unit Tests", "Integration Tests", "Debugging", "Refactoring", "Git", "Version Control",
  "Error Handling", "README", "Code Comments", "Migration", "Configuration", "Logging",
  "Monitoring", "Code Quality", "Troubleshooting", "Reliability", "Setup", "Web Dev"
];

const THEMES = {
  red: {
    name: "Bold Red",
    primary: "red",
    colors: {
      primary: "bg-red-600 hover:bg-red-700 text-white",
      secondary: "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200",
      accent: "text-red-600",
      tag: "bg-red-100 text-red-800 border-red-200",
      tagActive: "bg-red-600 text-white border-red-600",
      tagInactive: "bg-white hover:bg-red-50 text-red-600 border-red-300",
      card: "border-red-200 hover:border-red-300 hover:shadow-red-100",
      cardTitle: "text-red-700",
      link: "text-red-600 hover:text-red-700"
    }
  },
  blue: {
    name: "Ocean Blue",
    primary: "blue",
    colors: {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200",
      accent: "text-blue-600",
      tag: "bg-blue-100 text-blue-800 border-blue-200",
      tagActive: "bg-blue-600 text-white border-blue-600",
      tagInactive: "bg-white hover:bg-blue-50 text-blue-600 border-blue-300",
      card: "border-blue-200 hover:border-blue-300 hover:shadow-blue-100",
      cardTitle: "text-blue-700",
      link: "text-blue-600 hover:text-blue-700"
    }
  },
  green: {
    name: "Forest Green",
    primary: "green",
    colors: {
      primary: "bg-green-600 hover:bg-green-700 text-white",
      secondary: "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200",
      accent: "text-green-600",
      tag: "bg-green-100 text-green-800 border-green-200",
      tagActive: "bg-green-600 text-white border-green-600",
      tagInactive: "bg-white hover:bg-green-50 text-green-600 border-green-300",
      card: "border-green-200 hover:border-green-300 hover:shadow-green-100",
      cardTitle: "text-green-700",
      link: "text-green-600 hover:text-green-700"
    }
  },
  purple: {
    name: "Royal Purple",
    primary: "purple",
    colors: {
      primary: "bg-purple-600 hover:bg-purple-700 text-white",
      secondary: "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200",
      accent: "text-purple-600",
      tag: "bg-purple-100 text-purple-800 border-purple-200",
      tagActive: "bg-purple-600 text-white border-purple-600",
      tagInactive: "bg-white hover:bg-purple-50 text-purple-600 border-purple-300",
      card: "border-purple-200 hover:border-purple-300 hover:shadow-purple-100",
      cardTitle: "text-purple-700",
      link: "text-purple-600 hover:text-purple-700"
    }
  },
  orange: {
    name: "Sunset Orange",
    primary: "orange",
    colors: {
      primary: "bg-orange-600 hover:bg-orange-700 text-white",
      secondary: "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200",
      accent: "text-orange-600",
      tag: "bg-orange-100 text-orange-800 border-orange-200",
      tagActive: "bg-orange-600 text-white border-orange-600",
      tagInactive: "bg-white hover:bg-orange-50 text-orange-600 border-orange-300",
      card: "border-orange-200 hover:border-orange-300 hover:shadow-orange-100",
      cardTitle: "text-orange-700",
      link: "text-orange-600 hover:text-orange-700"
    }
  }
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function TagButton({ tag, active, onClick, theme }) {
  return (
    <button
      className={classNames(
        "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 mx-1 mb-2",
        active
          ? theme.colors.tagActive
          : theme.colors.tagInactive
      )}
      onClick={() => onClick(tag)}
    >
      {tag}
    </button>
  );
}

function PromptCard({ prompt, onEdit, onDelete, onToggleLock, onView, theme }) {
  const handleEdit = () => {
    if (prompt.locked) {
      alert("This prompt is locked. Please unlock it before editing.");
      return;
    }
    onEdit(prompt);
  };

  const handleDelete = () => {
    if (prompt.locked) {
      alert("This prompt is locked. Please unlock it before deleting.");
      return;
    }
    onDelete(prompt);
  };

  return (
    <div 
      className={classNames(
        "group relative rounded-xl border-2 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1",
        theme.colors.card
      )}
      onClick={() => onView(prompt)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className={classNames(
            "text-xl font-bold mb-2 leading-tight",
            theme.colors.cardTitle
          )}>
            {prompt.title}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1">
              {prompt.locked ? (
                <>
                  <span className="text-red-500">🔒</span>
                  <span className="text-red-600 dark:text-red-400 font-medium">Protected</span>
                </>
              ) : (
                <>
                  <span className="text-green-500">🔓</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Editable</span>
                </>
              )}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            className={classNames(
              "p-2 text-sm rounded-lg transition-colors",
              prompt.locked
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
            )}
            onClick={handleDelete}
            title={prompt.locked ? "Unlock before deleting" : "Delete prompt"}
          >
            🗑️
          </button>
          <button
            className={classNames(
              "p-2 text-sm rounded-lg transition-colors",
              prompt.locked
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : theme.colors.secondary
            )}
            onClick={handleEdit}
            title={prompt.locked ? "Unlock before editing" : "Edit prompt"}
          >
            ✏️
          </button>
          <button
            className={classNames(
              "p-2 text-sm rounded-lg transition-colors",
              prompt.locked
                ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
            )}
            onClick={() => onToggleLock(prompt)}
            title={prompt.locked ? "Unlock prompt to enable editing" : "Lock prompt to protect from changes"}
          >
            {prompt.locked ? "🔒" : "🔓"}
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {prompt.body.length > 120 
            ? `${prompt.body.substring(0, 120)}...` 
            : prompt.body
          }
        </div>
        {prompt.body.length > 120 && (
          <button className={classNames("text-sm mt-2 font-medium", theme.colors.link)}>
            Click to read more →
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {(prompt.tags || "").split(",").filter(tag => tag.trim()).slice(0, 3).map((tag) => (
          <span 
            key={tag} 
            className={classNames(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
              theme.colors.tag
            )}
          >
            {tag.trim()}
          </span>
        ))}
        {(prompt.tags || "").split(",").filter(tag => tag.trim()).length > 3 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            +{(prompt.tags || "").split(",").filter(tag => tag.trim()).length - 3} more
          </span>
        )}
      </div>

      {/* Click indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <span>Click to view</span>
          <span className={theme.colors.accent}>→</span>
        </div>
      </div>
    </div>
  );
}

function PromptForm({ prompt, onSave, onCancel, theme }) {
  const [form, setForm] = useState(
    prompt || { title: "", body: "", tags: "", locked: true }
  );
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {prompt ? "Edit Prompt" : "Create New Prompt"}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter prompt title..."
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prompt Content
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter your prompt content..."
                value={form.body}
                rows={6}
                onChange={e => setForm({ ...form, body: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter tags separated by commas..."
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="locked"
                checked={form.locked}
                onChange={e => setForm({ ...form, locked: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <label htmlFor="locked" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                🔒 Lock prompt (prevents editing/deletion until unlocked)
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={onCancel} 
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              className={classNames(
                "px-6 py-2 rounded-lg font-medium transition-colors",
                theme.colors.primary
              )}
              disabled={!form.title || !form.body}
            >
              {prompt ? "Update Prompt" : "Create Prompt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeSelector({ currentTheme, onThemeChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="p-2 rounded-lg text-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        title="Change color theme"
      >
        🎨
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 px-2">Color Theme</div>
            {Object.entries(THEMES).map(([key, theme]) => (
              <button
                key={key}
                className={classNames(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                  currentTheme === key
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
                onClick={() => {
                  onThemeChange(key);
                  setIsOpen(false);
                }}
              >
                <div className={`w-3 h-3 rounded-full bg-${theme.primary}-500`}></div>
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PromptDetailModal({ prompt, onClose, theme }) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt.body);
      alert("Prompt copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      const textArea = document.createElement("textarea");
      textArea.value = prompt.body;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Prompt copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{prompt.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl p-1"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Prompt Content:</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-sm whitespace-pre-line leading-relaxed text-gray-900 dark:text-gray-100">
              {prompt.body}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {(prompt.tags || "").split(",").filter(tag => tag.trim()).map((tag) => (
                <span 
                  key={tag} 
                  className={classNames(
                    "rounded-full px-3 py-1 text-xs font-medium border",
                    theme.colors.tag
                  )}
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {prompt.locked ? (
                <span className="flex items-center gap-1">
                  🔒 <span>Protected</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  🔓 <span>Editable</span>
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={copyToClipboard}
                className={classNames(
                  "px-6 py-2 rounded-lg font-medium transition-colors",
                  theme.colors.primary
                )}
              >
                📋 Copy Prompt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [prompts, setPrompts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem("colorTheme") || "red");
  const [showAllTags, setShowAllTags] = useState(false);

  const theme = THEMES[currentTheme];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("colorTheme", currentTheme);
  }, [currentTheme]);

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  const loadPrompts = async () => {
    try {
        const res = await axios.get("/api/prompts");
        console.log("API DATA:", res.data);
        setPrompts(Array.isArray(res.data) ? res.data : []);
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
        await axios.put(`/api/prompts/${editing.id}`, { ...form });
      } else {
        await axios.post("/api/prompts", form);
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
    if (window.confirm("Delete this prompt?")) {
      try {
        await axios.delete(`/api/prompts/${prompt.id}`);
        loadPrompts();
      } catch (error) {
        console.error("handleDelete ERROR:", error);
        alert("Failed to delete prompt. Check console for details.");
      }
    }
  };

  const handleToggleLock = async (prompt) => {
    try {
      await axios.patch(`/api/prompts/${prompt.id}/lock`, { locked: prompt.locked ? 0 : 1 });
      loadPrompts();
    } catch (error) {
      console.error("handleToggleLock ERROR:", error);
      alert("Failed to toggle lock. Check console for details.");
    }
  };

  const filteredPrompts = prompts.filter((prompt) => {
    // First filter by tag
    const matchesTag = filter === "All" || 
      (prompt.tags || "")
        .split(",")
        .map((t) => t.trim())
        .includes(filter);
    
    // Then filter by search query
    const matchesSearch = searchQuery === "" ||
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prompt.tags || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top row with logo, title and buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <svg 
                width="48" 
                height="12" 
                viewBox="0 0 447 109" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-auto"
                alt="BOLD Logo"
              >
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M219 54.3535C219 84.1769 194.823 108.354 165 108.354C135.177 108.354 111 84.1769 111 54.3535C111 24.5301 135.177 0.353516 165 0.353516C194.823 0.353516 219 24.5301 219 54.3535ZM345 3.35352H396C409.526 3.35352 422.498 8.72672 432.062 18.2911C441.627 27.8554 447 40.8275 447 54.3535C447 67.8796 441.627 80.8516 432.062 90.416C422.498 99.9803 409.526 105.354 396 105.354H345V3.35352ZM282 3.35352H231V105.354H333V54.3535H282V3.35352ZM94.0919 11.2617C99.1554 16.3251 102 23.1927 102 30.3535C101.999 35.3126 100.632 40.1757 98.05 44.4092C95.4675 48.6428 91.7689 52.0834 87.36 54.3535C92.7406 57.1266 97.0333 61.6273 99.5488 67.1331C102.064 72.6388 102.657 78.8301 101.231 84.713C99.8054 90.5958 96.4441 95.8289 91.6871 99.5721C86.9301 103.315 81.0532 105.351 75 105.354H0V3.35352H75C82.1608 3.35352 89.0284 6.19818 94.0919 11.2617Z" 
                  className="fill-red-600 dark:fill-red-400"
                />
              </svg>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Prompt Library v2
                </h1>
                <div className="text-sm text-gray-500 dark:text-gray-400">Modern prompts for engineering teams</div>
              </div>
            </div>
            
            <div className="flex gap-3 items-center">
              <button
                className={classNames(
                  "px-6 py-2 rounded-lg font-medium transition-colors",
                  theme.colors.primary
                )}
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                + Add Prompt
              </button>
              <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
              <button
                className="p-2 rounded-lg text-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Toggle dark mode"
                onClick={() => setDark((d) => !d)}
              >
                {dark ? "🌙" : "☀️"}
              </button>
            </div>
          </div>
          
          {/* Search Bar - Full width row */}
          <div className="w-full max-w-2xl mx-auto bg-yellow-100 border-2 border-red-500 p-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  {filteredPrompts.length} result{filteredPrompts.length !== 1 ? 's' : ''} for "{searchQuery}"
                </span>
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        {/* Tag Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <TagButton tag="All" active={filter === "All"} onClick={setFilter} theme={theme} />
            {(showAllTags ? TAGS : TAGS.slice(0, Math.floor(TAGS.length / 2))).map((tag) => (
              <TagButton key={tag} tag={tag} active={filter === tag} onClick={setFilter} theme={theme} />
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className={classNames(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                theme.colors.secondary
              )}
            >
              {showAllTags ? (
                <>
                  <span>Show Less Tags</span>
                  <span className="text-xs">▲</span>
                </>
              ) : (
                <>
                  <span>Show More Tags ({TAGS.length - Math.floor(TAGS.length / 2)} more)</span>
                  <span className="text-xs">▼</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredPrompts || []).map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={(p) => {
                setEditing(p);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onToggleLock={handleToggleLock}
              onView={(p) => setViewing(p)}
              theme={theme}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No prompts found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? (
                <>No prompts match your search for "{searchQuery}"{filter !== "All" ? ` in the "${filter}" category` : ""}</>
              ) : filter === "All" ? (
                "Get started by creating your first prompt"
              ) : (
                `No prompts found with the "${filter}" tag`
              )}
            </p>
            {searchQuery ? (
              <button
                className={classNames(
                  "px-6 py-2 rounded-lg font-medium transition-colors mr-3",
                  theme.colors.secondary
                )}
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </button>
            ) : null}
            {filter === "All" && !searchQuery && (
              <button
                className={classNames(
                  "px-6 py-2 rounded-lg font-medium transition-colors",
                  theme.colors.primary
                )}
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                Create Your First Prompt
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <PromptForm
          prompt={editing}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          theme={theme}
        />
      )}
      {viewing && (
        <PromptDetailModal
          prompt={viewing}
          onClose={() => setViewing(null)}
          theme={theme}
        />
      )}
    </div>
  );
}