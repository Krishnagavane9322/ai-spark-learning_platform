import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, ArrowLeft, Rocket,
  Code, Brain, Smartphone, Palette, Cloud, Database, Shield,
  Check, CheckCircle2, XCircle, Trophy
} from "lucide-react";
import { api } from "@/lib/api";

// ─── Topic config ────────────────────────────────────────────────────────────
const TOPICS = [
  { id: "Web Development",       label: "Web Development",       icon: Code,       color: "from-cyan-500 to-blue-500",     desc: "React, Node.js, Full-Stack" },
  { id: "AI & Machine Learning", label: "AI & Machine Learning", icon: Brain,      color: "from-violet-500 to-purple-500", desc: "Python, TensorFlow, Deep Learning" },
  { id: "Mobile Development",    label: "Mobile Development",    icon: Smartphone, color: "from-green-500 to-emerald-500", desc: "React Native, Flutter, Apps" },
  { id: "UI/UX Design",          label: "UI/UX Design",          icon: Palette,    color: "from-pink-500 to-rose-500",     desc: "Figma, Prototyping, User Research" },
  { id: "Cloud & DevOps",        label: "Cloud & DevOps",        icon: Cloud,      color: "from-orange-500 to-amber-500",  desc: "AWS, Docker, Kubernetes" },
  { id: "Data Science",          label: "Data Science",          icon: Database,   color: "from-teal-500 to-cyan-500",     desc: "Python, SQL, Visualization" },
  { id: "Cybersecurity",         label: "Cybersecurity",         icon: Shield,     color: "from-red-500 to-pink-500",      desc: "Ethical Hacking, Networking" },
];

// ─── Question bank (5 per topic) ─────────────────────────────────────────────
type Question = { q: string; options: string[]; answer: number; topic: string };

const QUESTION_BANK: Question[] = [
  // Web Development
  { topic: "Web Development", q: "What does the 'C' in CSS stand for?", options: ["Cascading", "Colorful", "Coded", "Centralized"], answer: 0 },
  { topic: "Web Development", q: "Which hook is used to manage state in a React functional component?", options: ["useEffect", "useRef", "useState", "useContext"], answer: 2 },
  { topic: "Web Development", q: "Which HTTP method is typically used to update an existing resource?", options: ["GET", "POST", "PUT", "DELETE"], answer: 2 },
  { topic: "Web Development", q: "What does 'npm' stand for?", options: ["Node Package Manager", "New Project Module", "Node Program Method", "None of the above"], answer: 0 },
  { topic: "Web Development", q: "Which of the following is NOT a JavaScript framework/library?", options: ["React", "Vue", "Django", "Angular"], answer: 2 },

  // AI & Machine Learning
  { topic: "AI & Machine Learning", q: "What is 'overfitting' in machine learning?", options: ["Model performs well only on training data", "Model is too simple", "Model has too few parameters", "Model trains too slowly"], answer: 0 },
  { topic: "AI & Machine Learning", q: "Which algorithm is commonly used for classification and regression?", options: ["K-Means", "Random Forest", "DBSCAN", "PCA"], answer: 1 },
  { topic: "AI & Machine Learning", q: "What does 'gradient descent' minimize?", options: ["Accuracy", "Loss function", "Number of epochs", "Learning rate"], answer: 1 },
  { topic: "AI & Machine Learning", q: "Which Python library is widely used for deep learning?", options: ["Pandas", "NumPy", "TensorFlow", "Matplotlib"], answer: 2 },
  { topic: "AI & Machine Learning", q: "What type of neural network is best suited for image recognition?", options: ["RNN", "LSTM", "CNN", "GAN"], answer: 2 },

  // Mobile Development
  { topic: "Mobile Development", q: "What language does Flutter use?", options: ["JavaScript", "Dart", "Swift", "Kotlin"], answer: 1 },
  { topic: "Mobile Development", q: "In React Native, which component is used to display scrollable lists?", options: ["ScrollView", "ListView", "FlatList", "All of the above"], answer: 3 },
  { topic: "Mobile Development", q: "What is 'AsyncStorage' in React Native used for?", options: ["Network calls", "Persistent local storage", "State management", "Navigation"], answer: 1 },
  { topic: "Mobile Development", q: "Which platform(s) does React Native target?", options: ["iOS only", "Android only", "Both iOS and Android", "Web only"], answer: 2 },
  { topic: "Mobile Development", q: "What is the purpose of 'Expo' in mobile development?", options: ["A UI component library", "A toolchain to build React Native apps faster", "A database", "A CI/CD service"], answer: 1 },

  // UI/UX Design
  { topic: "UI/UX Design", q: "What does 'UX' stand for?", options: ["User Experience", "User Extension", "Unified Exchange", "User Execution"], answer: 0 },
  { topic: "UI/UX Design", q: "Which of the following is a wireframing and prototyping tool?", options: ["Photoshop", "Figma", "Blender", "After Effects"], answer: 1 },
  { topic: "UI/UX Design", q: "What is 'affordance' in UX design?", options: ["A visual effect", "A cue that suggests how to interact with an element", "A color scheme", "A font size"], answer: 1 },
  { topic: "UI/UX Design", q: "What does 'A/B testing' involve?", options: ["Testing two versions of a design to see which performs better", "Writing test cases", "Unit testing", "Backend testing"], answer: 0 },
  { topic: "UI/UX Design", q: "Which principle states that interfaces should be consistent and follow standards?", options: ["Fitts's Law", "Hick's Law", "Nielsen's Heuristics", "Gestalt Principle"], answer: 2 },

  // Cloud & DevOps
  { topic: "Cloud & DevOps", q: "What does 'CI/CD' stand for?", options: ["Continuous Integration / Continuous Delivery", "Cloud Infrastructure / Cloud Deployment", "Central Integration / Code Deployment", "None of the above"], answer: 0 },
  { topic: "Cloud & DevOps", q: "What is Docker primarily used for?", options: ["Database management", "Containerization", "Version control", "UI testing"], answer: 1 },
  { topic: "Cloud & DevOps", q: "Which AWS service is used to host serverless functions?", options: ["EC2", "S3", "Lambda", "RDS"], answer: 2 },
  { topic: "Cloud & DevOps", q: "What is Kubernetes used for?", options: ["Building React apps", "Container orchestration", "Machine learning", "Database hosting"], answer: 1 },
  { topic: "Cloud & DevOps", q: "What does 'Infrastructure as Code' (IaC) mean?", options: ["Writing code inside a container", "Managing infrastructure via configuration files", "Deploying code to a server", "Monitoring cloud resources"], answer: 1 },

  // Data Science
  { topic: "Data Science", q: "Which Python library is primarily used for data manipulation?", options: ["Matplotlib", "Seaborn", "Pandas", "Scikit-learn"], answer: 2 },
  { topic: "Data Science", q: "What does SQL stand for?", options: ["Structured Query Language", "System Query Logic", "Stacked Question Layer", "Standard Query List"], answer: 0 },
  { topic: "Data Science", q: "What is the purpose of 'data normalization'?", options: ["Removing outliers", "Scaling features to a similar range", "Adding more data", "Splitting the dataset"], answer: 1 },
  { topic: "Data Science", q: "What does a 'confusion matrix' measure?", options: ["Model speed", "Classification performance", "Feature importance", "Data distribution"], answer: 1 },
  { topic: "Data Science", q: "Which chart is best for showing distribution of a single numerical variable?", options: ["Bar chart", "Scatter plot", "Histogram", "Pie chart"], answer: 2 },

  // Cybersecurity
  { topic: "Cybersecurity", q: "What is 'phishing'?", options: ["A network vulnerability", "A social engineering attack via deceptive emails/sites", "A type of malware", "A firewall bypass"], answer: 1 },
  { topic: "Cybersecurity", q: "What does 'SQL Injection' exploit?", options: ["Weak passwords", "Unsanitized database queries", "Open ports", "Weak encryption"], answer: 1 },
  { topic: "Cybersecurity", q: "What is the purpose of a firewall?", options: ["Speed up internet", "Monitor and control network traffic", "Store passwords", "Encrypt files"], answer: 1 },
  { topic: "Cybersecurity", q: "What does 'HTTPS' add over HTTP?", options: ["Faster speed", "SSL/TLS encryption", "Compression", "Caching"], answer: 1 },
  { topic: "Cybersecurity", q: "What is a 'zero-day vulnerability'?", options: ["A bug fixed in zero days", "An unknown exploit with no available patch", "A vulnerability in day-zero code", "A scheduled security patch"], answer: 1 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildQuiz(selectedTopics: string[]): Question[] {
  // Pick ~5 questions per topic (up to 15 total), then shuffle
  const picked: Question[] = [];
  for (const topic of selectedTopics) {
    const bank = QUESTION_BANK.filter(q => q.topic === topic);
    // shuffle per topic
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    picked.push(...shuffled.slice(0, Math.ceil(15 / selectedTopics.length)));
  }
  // Cap at 15
  return picked.sort(() => Math.random() - 0.5).slice(0, 15);
}

function scoreToLevel(correct: number, total: number): string {
  const pct = correct / total;
  if (pct >= 0.75) return "advanced";
  if (pct >= 0.45) return "intermediate";
  return "beginner";
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props { onComplete: (data: any) => void }

const TOTAL_STEPS = 3; // 0: topics, 1: quiz, 2: results

const AssessmentQuiz = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [chosen, setChosen] = useState<number | null>(null); // current q chosen option
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => answers.filter((a, i) => a === quiz[i]?.answer).length, [answers, quiz]);

  const toggleInterest = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const startQuiz = () => {
    const questions = buildQuiz(selected);
    setQuiz(questions);
    setAnswers([]);
    setQIndex(0);
    setChosen(null);
    setShowFeedback(false);
    setStep(1);
  };

  const handleChoose = (optIndex: number) => {
    if (showFeedback) return;
    setChosen(optIndex);
    setShowFeedback(true);
    const newAnswers = [...answers, optIndex];
    setTimeout(() => {
      if (qIndex < quiz.length - 1) {
        setAnswers(newAnswers);
        setQIndex(qIndex + 1);
        setChosen(null);
        setShowFeedback(false);
      } else {
        setAnswers(newAnswers);
        setStep(2);
      }
    }, 900);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const skillLevel = scoreToLevel(score, quiz.length);
    try {
      const result = await api.submitAssessment({ interests: selected, skillLevel });
      onComplete(result);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = quiz[qIndex];
  const progressPercent = step === 0 ? 0 : step === 1 ? Math.round(((qIndex + 1) / quiz.length) * 100) : 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-8 max-w-2xl w-full neon-glow-cyan max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-5">
          <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block mb-2">
            <Sparkles size={32} className="text-primary" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold">
            {step === 0 && "What do you want to learn?"}
            {step === 1 && `Question ${qIndex + 1} of ${quiz.length}`}
            {step === 2 && "Your Assessment Results"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {step === 0 && "Select up to 3 topics that interest you"}
            {step === 1 && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{currentQ?.topic}</span>}
            {step === 2 && "We've analyzed your answers to personalize your path"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
          {step === 1 && (
            <p className="text-[10px] text-muted-foreground text-right mt-1">{qIndex + 1}/{quiz.length} answered</p>
          )}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 0: Pick topics ── */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TOPICS.map((item, i) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => toggleInterest(item.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected ? "border-primary bg-primary/10 neon-glow-cyan" : "border-border hover:border-primary/30 glass"}`}
                    >
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${item.color} text-white shrink-0`}>
                        <item.icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check size={14} className="text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">{selected.length}/3 topics selected</p>
              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={startQuiz}
                  disabled={selected.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-30 hover:brightness-110 transition-all"
                >
                  Start Quiz <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Questions ── */}
          {step === 1 && currentQ && (
            <motion.div key={`q-${qIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-4">
              <p className="font-semibold text-lg leading-snug mb-5">{currentQ.q}</p>
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  const isChosen = chosen === i;
                  const isCorrect = i === currentQ.answer;
                  let optStyle = "border-border hover:border-primary/40 glass";
                  if (showFeedback) {
                    if (isCorrect) optStyle = "border-neon-green bg-neon-green/10";
                    else if (isChosen && !isCorrect) optStyle = "border-destructive bg-destructive/10";
                    else optStyle = "border-border glass opacity-50";
                  } else if (isChosen) {
                    optStyle = "border-primary bg-primary/10";
                  }
                  return (
                    <motion.button
                      key={i}
                      whileHover={!showFeedback ? { scale: 1.01 } : {}}
                      whileTap={!showFeedback ? { scale: 0.99 } : {}}
                      onClick={() => handleChoose(i)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${optStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                        showFeedback && isCorrect ? "border-neon-green text-neon-green" :
                        showFeedback && isChosen && !isCorrect ? "border-destructive text-destructive" :
                        "border-muted-foreground text-muted-foreground"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1 text-sm">{opt}</span>
                      {showFeedback && isCorrect && <CheckCircle2 size={18} className="text-neon-green shrink-0" />}
                      {showFeedback && isChosen && !isCorrect && <XCircle size={18} className="text-destructive shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Results ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
              {/* Score ring */}
              <div className="flex flex-col items-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="relative w-32 h-32 mb-4"
                >
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                    <motion.circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke="hsl(var(--primary))" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - score / quiz.length) }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Trophy size={20} className="text-primary mb-1" />
                    <span className="text-2xl font-bold">{score}/{quiz.length}</span>
                  </div>
                </motion.div>

                {/* Level badge */}
                {(() => {
                  const level = scoreToLevel(score, quiz.length);
                  const meta = {
                    beginner:     { emoji: "🌱", label: "Beginner",     color: "text-neon-green",  desc: "Great starting point! We'll build your foundations." },
                    intermediate: { emoji: "🌿", label: "Intermediate", color: "text-neon-cyan",   desc: "You know the basics. Let's fill the gaps and go deeper." },
                    advanced:     { emoji: "🌳", label: "Advanced",     color: "text-neon-violet", desc: "Impressive! We'll challenge you with advanced topics." },
                  }[level];
                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center">
                      <p className="text-3xl mb-1">{meta.emoji}</p>
                      <p className={`text-xl font-bold font-display ${meta.color}`}>{meta.label} Level</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{meta.desc}</p>
                    </motion.div>
                  );
                })()}
              </div>

              {/* Per-question breakdown */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Answer breakdown</p>
                {quiz.map((q, i) => {
                  const correct = answers[i] === q.answer;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-2 text-xs"
                    >
                      {correct
                        ? <CheckCircle2 size={14} className="text-neon-green shrink-0 mt-0.5" />
                        : <XCircle size={14} className="text-destructive shrink-0 mt-0.5" />}
                      <span className={correct ? "text-foreground" : "text-muted-foreground line-through"}>{q.q}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Topics selected */}
              <div className="flex flex-wrap gap-2">
                {selected.map(s => (
                  <span key={s} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => { setStep(0); setSelected([]); setAnswers([]); setQIndex(0); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft size={14} /> Retake
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold disabled:opacity-50 hover:brightness-110 transition-all"
                >
                  {loading
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                    : <><Rocket size={16} /> Generate My Path</>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AssessmentQuiz;
