import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Rocket, Code, Brain, Smartphone, Palette, Cloud, Database, Shield, Check } from "lucide-react";
import { api } from "@/lib/api";

const interests = [
  { id: "Web Development", label: "Web Development", icon: Code, color: "from-cyan-500 to-blue-500", desc: "React, Node.js, Full-Stack" },
  { id: "AI & Machine Learning", label: "AI & Machine Learning", icon: Brain, color: "from-violet-500 to-purple-500", desc: "Python, TensorFlow, Deep Learning" },
  { id: "Mobile Development", label: "Mobile Development", icon: Smartphone, color: "from-green-500 to-emerald-500", desc: "React Native, Flutter, Apps" },
  { id: "UI/UX Design", label: "UI/UX Design", icon: Palette, color: "from-pink-500 to-rose-500", desc: "Figma, Prototyping, User Research" },
  { id: "Cloud & DevOps", label: "Cloud & DevOps", icon: Cloud, color: "from-orange-500 to-amber-500", desc: "AWS, Docker, Kubernetes" },
  { id: "Data Science", label: "Data Science", icon: Database, color: "from-teal-500 to-cyan-500", desc: "Python, SQL, Visualization" },
  { id: "Cybersecurity", label: "Cybersecurity", icon: Shield, color: "from-red-500 to-pink-500", desc: "Ethical Hacking, Networking" },
];

const skillLevels = [
  { id: "beginner", label: "Beginner", emoji: "🌱", desc: "I'm just starting out" },
  { id: "intermediate", label: "Intermediate", emoji: "🌿", desc: "I know some basics" },
  { id: "advanced", label: "Advanced", emoji: "🌳", desc: "I have experience" },
];

interface Props {
  onComplete: (data: any) => void;
}

const AssessmentQuiz = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleInterest = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await api.submitAssessment({
        interests: selected,
        skillLevel: level,
      });
      onComplete(result);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-8 max-w-2xl w-full neon-glow-cyan max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-3"
          >
            <Sparkles size={36} className="text-primary" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold">
            {step === 0 ? "What do you want to learn?" : "What's your current level?"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {step === 0
              ? "Select up to 3 topics that interest you"
              : "We'll personalize your learning path"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[0, 1].map(s => (
            <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted">
              <motion.div
                animate={{ width: step >= s ? "100%" : "0%" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Pick interests */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {interests.map((item, i) => {
                const isSelected = selected.includes(item.id);
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => toggleInterest(item.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/10 neon-glow-cyan"
                        : "border-border hover:border-primary/30 glass"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${item.color} text-white shrink-0`}>
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check size={14} className="text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* Step 2: Skill level */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-3"
            >
              {skillLevels.map((item, i) => {
                const isSelected = level === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setLevel(item.id)}
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all w-full text-left ${
                      isSelected
                        ? "border-primary bg-primary/10 neon-glow-cyan"
                        : "border-border hover:border-primary/30 glass"
                    }`}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check size={14} className="text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg glass text-sm hover:bg-glass-highlight/10 transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}

          {step === 0 ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => selected.length > 0 && setStep(1)}
              disabled={selected.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-30 hover:brightness-110 transition-all"
            >
              Next <ArrowRight size={16} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!level || loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold disabled:opacity-30 hover:brightness-110 transition-all"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
              ) : (
                <><Rocket size={16} /> Generate My Path</>
              )}
            </motion.button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {selected.length}/3 topics selected
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AssessmentQuiz;
