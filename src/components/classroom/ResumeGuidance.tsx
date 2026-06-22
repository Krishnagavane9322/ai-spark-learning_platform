import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Scientist", "ML Engineer", "DevOps Engineer", "UI/UX Designer", "Product Manager"];
const LEVELS = ["Student / No Experience", "Junior (0-2 years)", "Mid-level (2-5 years)", "Senior (5+ years)"];

export default function ResumeGuidance() {
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState(LEVELS[0]);
  const [goals, setGoals] = useState("");
  const [guidance, setGuidance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!targetRole.trim()) return;
    setLoading(true); setError(""); setGuidance("");
    try {
      const data = await api.classroomResume({ targetRole, currentSkills, experienceLevel, goals });
      setGuidance(data.guidance);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto space-y-6 w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-5">
        <h2 className="text-base font-bold text-rose-400 flex items-center gap-2"><Briefcase size={16} /> Resume & Career Guidance</h2>

        {/* Role input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Target Role *</label>
          <input value={targetRole} onChange={e => setTargetRole(e.target.value)}
            placeholder="e.g. Frontend Developer, Data Scientist"
            className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all" />
          <div className="flex flex-wrap gap-2 mt-2">
            {ROLES.map(r => (
              <button key={r} onClick={() => setTargetRole(r)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${targetRole === r ? "bg-rose-500 text-white" : "border border-border/50 hover:border-rose-500/30 text-muted-foreground"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Experience level */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Experience Level</label>
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setExperienceLevel(l)}
                className={`text-xs px-4 py-2.5 rounded-xl text-left transition-all ${experienceLevel === l ? "bg-rose-500/15 border border-rose-500/40 text-rose-300" : "border border-border/40 hover:border-rose-500/20 text-muted-foreground"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Current skills */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Current Skills (optional)</label>
          <input value={currentSkills} onChange={e => setCurrentSkills(e.target.value)}
            placeholder="e.g. JavaScript, React, Python, SQL"
            className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all" />
        </div>

        {/* Goals */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Career Goals (optional)</label>
          <input value={goals} onChange={e => setGoals(e.target.value)}
            placeholder="e.g. Get hired at a startup, transition from backend to ML"
            className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all" />
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generate}
          disabled={loading || !targetRole.trim()}
          className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating roadmap...</> : <><Briefcase size={16} /> Get Career Guidance</>}
        </motion.button>
        {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>}
      </motion.div>

      <AnimatePresence>
        {guidance && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-rose-500/20 bg-card/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <h3 className="text-sm font-bold text-rose-400">Your Career Roadmap</h3>
            </div>
            <div className="prose prose-sm prose-invert max-w-none [&>h2]:text-rose-300 [&>h3]:text-rose-300 [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 text-sm">
              <ReactMarkdown>{guidance}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
