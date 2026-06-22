import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Loader2, Clock, BookOpen, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";

const INTERESTS = ["Web Development", "AI & Machine Learning", "Mobile Development", "UI/UX Design", "Cloud & DevOps", "Data Science", "Cybersecurity", "Blockchain"];
const LEVELS    = ["Beginner", "Intermediate", "Advanced"];
const TIMES     = ["5 hours/week", "10 hours/week", "15 hours/week", "20+ hours/week"];

type Phase = {
  phase: number; title: string; duration: string; color: string; icon: string;
  topics: { name: string; description: string; resources: string[]; hours: number }[];
};
type PathData = { title: string; summary: string; totalDuration: string; phases: Phase[]; finalGoal: string };

const phaseColors: Record<string, string> = {
  cyan:   "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
  violet: "border-violet-500/30 bg-violet-500/5 text-violet-400",
  emerald:"border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
  orange: "border-orange-500/30 bg-orange-500/5 text-orange-400",
  rose:   "border-rose-500/30 bg-rose-500/5 text-rose-400",
  amber:  "border-amber-500/30 bg-amber-500/5 text-amber-400",
};

export default function LearningPathTool() {
  const [interests, setInterests] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [goals, setGoals] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("10 hours/week");
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openPhase, setOpenPhase] = useState<number | null>(0);

  const toggle = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const generate = async () => {
    if (interests.length === 0) { setError("Please select at least one interest."); return; }
    setLoading(true); setError(""); setPathData(null); setOpenPhase(0);
    try {
      const data = await api.classroomLearningPath({ interests, skillLevel, goals, timeAvailable });
      setPathData(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto space-y-6 w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 space-y-5">
        <h2 className="text-base font-bold text-indigo-400 flex items-center gap-2"><Map size={16} /> Personalized Learning Path</h2>

        {/* Interests */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Your Interests *</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <button key={i} onClick={() => toggle(i)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${interests.includes(i) ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "border border-border/50 hover:border-indigo-500/30 text-muted-foreground"}`}>
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Skill level */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Current Skill Level</label>
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setSkillLevel(l)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${skillLevel === l ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300" : "border border-border/40 hover:border-indigo-500/20 text-muted-foreground"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Time available */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Time Available per Week</label>
          <div className="flex flex-wrap gap-2">
            {TIMES.map(t => (
              <button key={t} onClick={() => setTimeAvailable(t)}
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${timeAvailable === t ? "bg-indigo-500 text-white" : "border border-border/50 hover:border-indigo-500/30 text-muted-foreground"}`}>
                <Clock size={10} /> {t}
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">Goal (optional)</label>
          <input value={goals} onChange={e => setGoals(e.target.value)}
            placeholder="e.g. Get a job at Google, Build my own startup, Freelance"
            className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all" />
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generate}
          disabled={loading || interests.length === 0}
          className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Building your path...</> : <><Map size={16} /> Generate My Learning Path</>}
        </motion.button>
        {error && <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>}
      </motion.div>

      {/* Roadmap */}
      <AnimatePresence>
        {pathData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Summary */}
            <div className="rounded-2xl border border-indigo-500/20 bg-card/60 p-5">
              <h3 className="font-bold text-indigo-400 mb-1">{pathData.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{pathData.summary}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock size={12} /> {pathData.totalDuration}</span>
                <span className="flex items-center gap-1"><BookOpen size={12} /> {pathData.phases?.length} phases</span>
              </div>
            </div>

            {/* Phases */}
            {pathData.phases?.map((phase, pi) => {
              const clrClass = phaseColors[phase.color] || phaseColors.cyan;
              const [borderClr, bgClr, textClr] = clrClass.split(" ");
              return (
                <motion.div key={pi} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.1 }}
                  className={`rounded-2xl border overflow-hidden ${borderClr} ${bgClr}`}>
                  {/* Phase header */}
                  <button onClick={() => setOpenPhase(openPhase === pi ? null : pi)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${bgClr} border ${borderClr}`}>
                        {phase.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${textClr}`}>Phase {phase.phase}: {phase.title}</p>
                        <p className="text-xs text-muted-foreground">{phase.duration} · {phase.topics?.length} topics</p>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: openPhase === pi ? 180 : 0 }}>
                      <ChevronDown size={16} className={textClr} />
                    </motion.div>
                  </button>

                  {/* Topics */}
                  <AnimatePresence initial={false}>
                    {openPhase === pi && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 space-y-3">
                        {phase.topics?.map((topic, ti) => (
                          <div key={ti} className="rounded-xl border border-border/30 bg-card/40 p-4">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold">{topic.name}</p>
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} /> {topic.hours}h</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{topic.description}</p>
                            {topic.resources?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {topic.resources.map((r, ri) => (
                                  <span key={ri} className={`text-[10px] px-2 py-0.5 rounded-full border ${borderClr} ${bgClr} ${textClr}`}>{r}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Final Goal */}
            {pathData.finalGoal && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-start gap-3">
                <span className="text-2xl mt-0.5">🏆</span>
                <div>
                  <p className="text-sm font-bold text-emerald-400 mb-1">Your End Goal</p>
                  <p className="text-sm text-muted-foreground">{pathData.finalGoal}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
