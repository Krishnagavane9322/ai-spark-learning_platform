import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Loader2, Send } from "lucide-react";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";

const QUICK_QUESTIONS = [
  "What is the minimum attendance required?",
  "How do I calculate my attendance percentage?",
  "I have 60% attendance. Can I still appear for exams?",
  "What happens if I miss a mid-term exam?",
  "How many classes can I miss per semester?",
];

export default function AttendanceBot() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ask = async (q?: string) => {
    const query = (q || question).trim();
    if (!query) return;
    if (q) setQuestion(q);
    setLoading(true); setError(""); setAnswer("");
    try {
      const data = await api.classroomAttendance(query);
      setAnswer(data.answer);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto space-y-6 w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 space-y-4">
        <h2 className="text-base font-bold text-orange-400 flex items-center gap-2">
          <CalendarCheck size={16} /> Attendance & Academic Q&A Bot
        </h2>
        <p className="text-xs text-muted-foreground">Ask anything about attendance rules, grade calculations, exam policies, and academic regulations.</p>

        {/* Quick questions */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Quick Questions</p>
          <div className="flex flex-col gap-2">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => ask(q)}
                className="text-left text-xs px-4 py-2.5 rounded-xl border border-orange-500/15 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/30 text-orange-200/80 transition-all">
                → {q}
              </button>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <div className="flex gap-2">
          <input value={question} onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && ask()}
            placeholder="Or type your own question..."
            className="flex-1 bg-card border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-all" />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => ask()}
            disabled={loading || !question.trim()}
            className="px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all shrink-0">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </motion.button>
        </div>
        {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>}
      </motion.div>

      <AnimatePresence>
        {answer && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-orange-500/20 bg-card/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheck size={16} className="text-orange-400" />
              <h3 className="text-sm font-bold text-orange-400">Answer</h3>
            </div>
            <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-3 [&>ul]:mb-3 [&>strong]:text-orange-300 text-sm">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
