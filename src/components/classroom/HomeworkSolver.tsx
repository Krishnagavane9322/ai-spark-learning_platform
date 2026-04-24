import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "Programming", "History", "Economics", "General"];

export default function HomeworkSolver() {
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("General");
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const solve = async () => {
    if (!question.trim()) return;
    setLoading(true); setError(""); setSolution("");
    try {
      const data = await api.classroomHomework(question, subject);
      setSolution(data.solution);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
        <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2"><BookOpen size={16} /> Homework Solver</h2>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setSubject(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${subject === s ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "border border-border/50 hover:border-emerald-500/30 text-muted-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
        <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={4}
          placeholder="Paste your homework question here... (e.g. Solve: 2x + 5 = 15 or explain the causes of World War I)"
          className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-emerald-500/50 transition-all" />
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={solve}
          disabled={loading || !question.trim()}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Solving step by step...</> : <><BookOpen size={16} /> Solve My Homework</>}
        </motion.button>
        {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>}
      </motion.div>

      <AnimatePresence>
        {solution && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-500/20 bg-card/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-emerald-400">Solution</h3>
            </div>
            <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-3 [&>h3]:text-emerald-300 [&>h3]:font-semibold [&>pre]:bg-muted/40 [&>pre]:rounded-xl [&>pre]:p-4 [&>code]:text-emerald-300 text-sm">
              <ReactMarkdown>{solution}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
