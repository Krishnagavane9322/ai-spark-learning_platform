import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Loader2, Copy, Check } from "lucide-react";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "SQL", "HTML/CSS"];

export default function CodeAssistant() {
  const [code, setCode] = useState("");
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const ask = async () => {
    if (!question.trim() && !code.trim()) return;
    setLoading(true); setError(""); setResponse("");
    try {
      const data = await api.classroomCode({ code, question, language });
      setResponse(data.response);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6 space-y-4">
        <h2 className="text-base font-bold text-sky-400 flex items-center gap-2"><Code2 size={16} /> Code Assistant</h2>

        {/* Language selector */}
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button key={l} onClick={() => setLanguage(l)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${language === l ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "border border-border/50 hover:border-sky-500/30 text-muted-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Question */}
        <input value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="What do you want to do? (e.g. Debug this code, Write a function to sort an array, Explain this code)"
          className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-all" />

        {/* Code input */}
        <div className="relative">
          <div className="absolute top-3 left-4 text-xs text-muted-foreground font-mono">{language}</div>
          <textarea value={code} onChange={e => setCode(e.target.value)} rows={6}
            placeholder={`// Paste your ${language} code here (optional)...`}
            className="w-full bg-zinc-900/60 border border-border/50 rounded-xl px-4 pt-8 pb-4 text-sm font-mono resize-none focus:outline-none focus:border-sky-500/50 transition-all text-green-300 placeholder:text-muted-foreground/40" />
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={ask}
          disabled={loading || (!question.trim() && !code.trim())}
          className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-semibold disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Code2 size={16} /> Ask Code Assistant</>}
        </motion.button>
        {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>}
      </motion.div>

      <AnimatePresence>
        {response && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-sky-500/20 bg-card/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <h3 className="text-sm font-bold text-sky-400">Response</h3>
              </div>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/50 hover:bg-muted/40 text-muted-foreground transition-all">
                {copied ? <><Check size={12} className="text-emerald-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
            <div className="prose prose-sm prose-invert max-w-none [&>pre]:bg-zinc-900/80 [&>pre]:rounded-xl [&>pre]:p-4 [&>pre]:overflow-x-auto [&>code]:text-sky-300 [&>p]:mb-3 text-sm">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
