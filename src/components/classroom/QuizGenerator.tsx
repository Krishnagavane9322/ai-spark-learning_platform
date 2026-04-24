import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Loader2, RotateCcw, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};
type Quiz = { topic: string; questions: QuizQuestion[] };

const DIFFICULTIES = ["easy", "medium", "hard"];

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(""); setQuiz(null); setAnswers({}); setSubmitted(false);
    try {
      const data = await api.classroomQuiz(topic, difficulty);
      setQuiz(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const score = quiz
    ? quiz.questions.filter(q => answers[q.id] === q.correct).length
    : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Generator Form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 space-y-4">
        <h2 className="text-base font-bold text-violet-400 flex items-center gap-2">
          <Zap size={16} /> Generate a Quiz
        </h2>
        <input
          value={topic} onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          placeholder="Enter a topic (e.g. React Hooks, Binary Search, Photosynthesis)"
          className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">Difficulty:</span>
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                difficulty === d
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                  : "border border-border/50 hover:border-violet-500/40 text-muted-foreground"
              }`}>{d}</button>
          ))}
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={generate} disabled={loading || !topic.trim()}
            className="ml-auto px-5 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-sm font-semibold disabled:opacity-40 transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Generating...</> : <><Zap size={15} /> Generate Quiz</>}
          </motion.button>
        </div>
        {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>}
      </motion.div>

      {/* Quiz */}
      <AnimatePresence>
        {quiz && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Quiz: <span className="text-violet-400">{quiz.topic}</span></h3>
              {submitted && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${score >= 4 ? "text-emerald-400" : score >= 3 ? "text-amber-400" : "text-rose-400"}`}>
                    {score}/{quiz.questions.length} correct
                  </span>
                  <button onClick={() => { setQuiz(null); setTopic(""); setSubmitted(false); setAnswers({}); }}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border/50 hover:bg-muted/40 text-muted-foreground transition-all">
                    <RotateCcw size={12} /> New Quiz
                  </button>
                </div>
              )}
            </div>

            {quiz.questions.map((q, qi) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.07 }}
                className="rounded-2xl border border-border/50 bg-card/60 p-5 space-y-3">
                <p className="text-sm font-semibold">{qi + 1}. {q.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => {
                    const chosen = answers[q.id] === oi;
                    const isCorrect = oi === q.correct;
                    const showResult = submitted;
                    return (
                      <button key={oi} disabled={submitted || answers[q.id] !== undefined}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                        className={`text-left text-xs px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                          showResult
                            ? isCorrect ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                              : chosen ? "border-rose-500/50 bg-rose-500/10 text-rose-300"
                              : "border-border/30 text-muted-foreground"
                            : chosen ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                            : "border-border/40 hover:border-violet-500/30 hover:bg-violet-500/5"
                        }`}>
                        {showResult && isCorrect && <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />}
                        {showResult && chosen && !isCorrect && <XCircle size={13} className="text-rose-400 shrink-0" />}
                        <span className="font-medium mr-1">{String.fromCharCode(65 + oi)}.</span> {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground bg-muted/20 px-3 py-2 rounded-xl border border-border/30">
                    💡 {q.explanation}
                  </motion.div>
                )}
              </motion.div>
            ))}

            {!submitted && Object.keys(answers).length === quiz.questions.length && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setSubmitted(true)}
                className="w-full py-3 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all"
              >
                Submit Answers <ChevronRight size={16} />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
