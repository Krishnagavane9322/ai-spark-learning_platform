import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Loader2, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";

const EXAMPLES = ["Recursion", "How the internet works", "Machine Learning", "Quantum Computing"];

export default function ExplainTopic() {
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openLayer, setOpenLayer] = useState<number | null>(0);

  const explain = async (t?: string) => {
    const q = (t || topic).trim();
    if (!q) return;
    if (t) setTopic(t);
    setLoading(true); setError(""); setExplanation(""); setOpenLayer(0);
    try {
      const data = await api.classroomExplain(q);
      setExplanation(data.explanation);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const layers = [
    { title: "🧒 Simple (5-year-old)", color: "amber", key: "Layer 1" },
    { title: "🧑 Teen Level",           color: "orange", key: "Layer 2" },
    { title: "🎓 Full Detail",          color: "rose",   key: "Layer 3" },
  ].map((l, i) => {
    const regex = new RegExp(`\\*\\*${l.key}[^*]*\\*\\*([\\s\\S]*?)(?=\\*\\*Layer ${i + 2}|$)`);
    const match = explanation.match(regex);
    return { ...l, content: match ? match[1].trim() : "" };
  });

  const clr = { amber: "border-amber-500/30 bg-amber-500/5 text-amber-400", orange: "border-orange-500/30 bg-orange-500/5 text-orange-400", rose: "border-rose-500/30 bg-rose-500/5 text-rose-400" };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-4">
        <h2 className="text-base font-bold text-amber-400 flex items-center gap-2"><Lightbulb size={16} /> Explain Any Topic Simply</h2>
        <div className="flex gap-2">
          <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && explain()}
            placeholder="e.g. Recursion, Blockchain, DNA replication"
            className="flex-1 bg-card border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-all" />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => explain()}
            disabled={loading || !topic.trim()}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Lightbulb size={15} />}
            {loading ? "Explaining..." : "Explain"}
          </motion.button>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => explain(ex)} className="text-xs px-3 py-1.5 rounded-lg border border-amber-500/20 hover:bg-amber-500/10 text-amber-300 transition-all">{ex}</button>
          ))}
        </div>
        {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>}
      </motion.div>

      <AnimatePresence>
        {explanation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {layers.map((layer, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border overflow-hidden ${clr[layer.color as keyof typeof clr].split(" ").slice(0,2).join(" ")}`}>
                <button onClick={() => setOpenLayer(openLayer === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4">
                  <span className={`text-sm font-bold ${clr[layer.color as keyof typeof clr].split(" ")[2]}`}>{layer.title}</span>
                  <motion.div animate={{ rotate: openLayer === i ? 180 : 0 }}><ChevronDown size={16} /></motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openLayer === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-4 prose prose-sm prose-invert max-w-none text-sm text-foreground/90">
                      <ReactMarkdown>{layer.content || explanation}</ReactMarkdown>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
