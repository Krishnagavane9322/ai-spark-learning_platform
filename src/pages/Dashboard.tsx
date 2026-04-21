import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Trophy, Target, Clock, Lock, CheckCircle2, Play, Sparkles, BookOpen, ExternalLink, ChevronRight, ChevronDown, Code2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import AssessmentQuiz from "@/components/AssessmentQuiz";
import StepQuiz from "@/components/StepQuiz";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [completing, setCompleting] = useState<number | null>(null);
  const [stepQuizTarget, setStepQuizTarget] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; xp: number } | null>(null);

  const fetchData = async () => {
    try {
      const [dash, assessment] = await Promise.all([api.getDashboard(), api.getAssessmentStatus()]);
      setDashData(dash);
      setAssessmentData(assessment);
      if (!assessment.completed) setShowQuiz(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Log activity on dashboard visit
    api.logActivity(0.5).catch(() => {});
  }, []);

  const handleAssessmentComplete = async (result: any) => {
    setShowQuiz(false);
    setAssessmentData({ completed: true, personalizedPath: result.personalizedPath, interests: result.interests });
    await refreshUser();
    fetchData();
  };

  const handleCompleteStep = async (stepId: number, stepTitle: string) => {
    setCompleting(stepId);
    try {
      const result = await api.completeStep(stepId);
      setAssessmentData((prev: any) => ({
        ...prev,
        personalizedPath: result.personalizedPath,
      }));

      // Update dashboard stats
      setDashData((prev: any) => ({
        ...prev,
        stats: {
          ...prev.stats,
          xp: result.totalXP,
          completed: result.completedCount,
          level: Math.max(1, Math.floor(result.totalXP / 500) + 1),
        }
      }));

      // Show toast
      setToast({ message: `"${stepTitle}" completed!`, xp: result.xpEarned });
      setTimeout(() => setToast(null), 3000);

      // Refresh to get updated weekly activity
      const dash = await api.getDashboard();
      setDashData(dash);
      await refreshUser();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12 container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Flame, label: "Day Streak", value: dashData?.stats?.streak || 0, color: "text-neon-cyan" },
    { icon: Zap, label: "XP Points", value: (dashData?.stats?.xp || 0).toLocaleString(), color: "text-neon-violet" },
    { icon: Trophy, label: "Level", value: dashData?.stats?.level || 1, color: "text-neon-pink" },
    { icon: Target, label: "Completed", value: dashData?.stats?.completed || 0, color: "text-neon-green" },
  ];

  const personalizedPath = assessmentData?.personalizedPath || [];
  const weeklyActivity = dashData?.weeklyActivity || [];
  const achievements = dashData?.achievements || [];
  const completedCount = personalizedPath.filter((s: any) => s.status === "completed").length;
  const totalSteps = personalizedPath.length;
  const overallProgress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Assessment Quiz Overlay */}
      <AnimatePresence>
        {showQuiz && <AssessmentQuiz onComplete={handleAssessmentComplete} />}
      </AnimatePresence>

      {/* XP Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-20 left-1/2 z-50 px-6 py-3 rounded-xl glass-card neon-glow-cyan flex items-center gap-3"
          >
            <CheckCircle2 size={20} className="text-neon-green" />
            <span className="text-sm font-medium">{toast.message}</span>
            <span className="text-sm font-bold text-neon-cyan">+{toast.xp} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 pb-12 container mx-auto px-4">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold">Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0] || "Learner"}</span> 👋</h1>
          <p className="text-muted-foreground mt-1">Continue your learning journey</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-5 flex items-center gap-4 hover:neon-glow-cyan transition-shadow">
              <div className={`p-3 rounded-lg bg-muted ${stat.color}`}><stat.icon size={22} /></div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Personalized Learning Path */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <Sparkles size={20} className="text-primary" /> Your Personalized Path
              </h2>
              {assessmentData?.completed && (
                <button
                  onClick={() => setShowQuiz(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Retake Quiz
                </button>
              )}
            </div>

            {/* Overall Progress Bar */}
            {totalSteps > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{completedCount} of {totalSteps} steps completed</span>
                  <span className="font-semibold text-primary">{overallProgress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-neon-green"
                  />
                </div>
              </div>
            )}

            {personalizedPath.length > 0 ? (
              <div className="space-y-2">
                {personalizedPath.map((step: any, i: number) => {
                  const isExpanded = expandedStep === step.stepId;
                  const canExpand = step.status !== "locked";
                  const resourceTypeIcon: Record<string, string> = {
                    docs: "📄", course: "🎓", video: "📺", practice: "🏋️", book: "📘"
                  };
                  return (
                    <motion.div
                      key={step.stepId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        step.status === "completed" ? "border-neon-green/20 bg-neon-green/5" :
                        step.status === "current" ? "border-primary/40 bg-primary/5" :
                        "border-border/40 bg-white/2 opacity-60"
                      }`}
                    >
                      {/* Step Header — always visible */}
                      <button
                        onClick={() => step.status !== "locked" && setExpandedStep(isExpanded ? null : step.stepId)}
                        className={`w-full flex items-center gap-3 p-4 text-left ${
                          step.status === "locked" ? "cursor-not-allowed" : "cursor-pointer hover:bg-white/3 transition-colors"
                        }`}
                      >
                        {/* Status icon */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          step.status === "completed" ? "bg-neon-green/20 text-neon-green" :
                          step.status === "current" ? "bg-primary/20 text-primary" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {step.status === "completed" ? <CheckCircle2 size={18} /> :
                           step.status === "current" ? <Play size={16} /> :
                           <Lock size={14} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">{step.title}</h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              step.status === "completed" ? "bg-neon-green/10 text-neon-green" :
                              "bg-primary/10 text-primary"
                            }`}>{step.category}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock size={11} /> {step.duration}</span>
                            <span className="flex items-center gap-1"><Zap size={11} /> {step.xp} XP</span>
                            {step.status !== "locked" && (
                              <span className="text-primary/70 text-[10px]">
                                {(step.resources || []).length} resources
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {step.status === "completed" && (
                            <span className="text-[10px] text-neon-green font-medium hidden sm:flex items-center gap-1">
                              <CheckCircle2 size={10} /> Completed
                            </span>
                          )}
                          {step.status !== "locked" && (
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown size={16} className="text-muted-foreground" />
                            </motion.div>
                          )}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-5 pt-1 space-y-4 border-t border-border/30">
                              {/* Long description */}
                              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                              {/* What you'll learn */}
                              {step.whatYouLearn?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                                    <Code2 size={13} className="text-primary" /> What you'll learn
                                  </p>
                                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {step.whatYouLearn.map((item: string, j: number) => (
                                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 size={12} className="text-primary shrink-0 mt-0.5" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Resources */}
                              {step.resources?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                                    <BookOpen size={13} className="text-primary" /> Learning Resources
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {step.resources.map((r: any, j: number) => {
                                      const name = typeof r === "object" ? r.name : r;
                                      const url = typeof r === "object" ? r.url : null;
                                      const type = typeof r === "object" ? r.type : "docs";
                                      return (
                                        <a
                                          key={j}
                                          href={url || "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all group ${
                                            url
                                              ? "bg-white/5 border-border/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                                              : "bg-white/3 border-border/30 cursor-default"
                                          }`}
                                        >
                                          <span className="text-base">{resourceTypeIcon[type] || "📄"}</span>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium group-hover:text-primary transition-colors truncate">{name}</p>
                                            <p className="text-[10px] text-muted-foreground capitalize">{type}</p>
                                          </div>
                                          {url && <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />}
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Action */}
                              {step.status === "current" && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                  disabled={completing === step.stepId}
                                  onClick={() => setStepQuizTarget({ stepId: step.stepId, title: step.title, category: step.category, xp: step.xp })}
                                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                  {completing === step.stepId ? (
                                    <><div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" /> Completing...</>
                                  ) : (
                                    <><Trophy size={16} /> Take Step Test to Unlock Next <ChevronRight size={14} /></>
                                  )}
                                </motion.button>
                              )}
                              {step.status === "completed" && (
                                <p className="text-center text-xs text-neon-green flex items-center justify-center gap-1">
                                  <CheckCircle2 size={13} /> +{step.xp} XP earned
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Complete the assessment to get your personalized path</p>
                <button onClick={() => setShowQuiz(true)}
                  className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all">
                  Take Assessment
                </button>
              </div>
            )}
          </motion.div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Weekly Activity */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4">Weekly Activity</h3>
              <div className="flex items-end gap-2 h-32">
                {weeklyActivity.map((day: any, i: number) => {
                  const percent = Math.max(3, (day.hours / 5) * 100);
                  const isToday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()] === day.day;
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${percent}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className={`w-full rounded-t-md min-h-[4px] ${
                          isToday
                            ? "bg-gradient-to-t from-neon-cyan/60 to-neon-cyan"
                            : day.hours > 0
                              ? "bg-gradient-to-t from-primary/40 to-primary"
                              : "bg-muted/50"
                        }`}
                        title={`${day.hours}h studied`}
                      />
                      <span className={`text-[10px] ${isToday ? "text-neon-cyan font-bold" : "text-muted-foreground"}`}>
                        {day.day}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                {weeklyActivity.reduce((sum: number, d: any) => sum + d.hours, 0).toFixed(1)}h total this week
              </p>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4">Achievements</h3>
              <div className="grid grid-cols-3 gap-3">
                {achievements.map((a: any) => (
                  <motion.div
                    key={a._id}
                    whileHover={{ scale: 1.1 }}
                    className={`flex flex-col items-center p-2 rounded-lg text-center transition-all ${
                      a.unlocked
                        ? "cursor-default"
                        : "opacity-30 grayscale"
                    }`}
                    title={a.unlocked ? `${a.title} - Unlocked!` : `${a.title} - Locked`}
                  >
                    <span className="text-2xl mb-1">{a.icon}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{a.title}</span>
                    {a.unlocked && (
                      <span className="text-[8px] text-neon-green mt-0.5">✓ Unlocked</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Interests Tags */}
            {assessmentData?.interests?.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                <h3 className="font-display font-semibold mb-3">Your Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {assessmentData.interests.map((interest: string) => (
                    <span key={interest} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {interest}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {stepQuizTarget && (
          <StepQuiz
            step={stepQuizTarget}
            onPass={() => {
              handleCompleteStep(stepQuizTarget.stepId, stepQuizTarget.title);
              setStepQuizTarget(null);
            }}
            onClose={() => setStepQuizTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
