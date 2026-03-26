import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Trophy, Target, Clock, Lock, CheckCircle2, Play, Sparkles, BookOpen, ExternalLink, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import AssessmentQuiz from "@/components/AssessmentQuiz";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [completing, setCompleting] = useState<number | null>(null);
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
              <div className="space-y-1">
                {personalizedPath.map((step: any, i: number) => (
                  <motion.div
                    key={step.stepId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        step.status === "completed" ? "bg-neon-green/20 text-neon-green" :
                        step.status === "current" ? "bg-primary/20 text-primary neon-glow-cyan" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {step.status === "completed" ? <CheckCircle2 size={18} /> :
                         step.status === "current" ? <Play size={18} /> :
                         <Lock size={16} />}
                      </div>
                      {i < personalizedPath.length - 1 && (
                        <div className={`w-0.5 h-16 ${step.status === "completed" ? "bg-neon-green/30" : "bg-border"}`} />
                      )}
                    </div>
                    <div className={`pb-4 flex-1 ${step.status === "locked" ? "opacity-50" : ""}`}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{step.title}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{step.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock size={12} /> {step.duration}</span>
                        <span className="flex items-center gap-1"><Zap size={12} /> {step.xp} XP</span>
                      </div>

                      {/* Resources for current step */}
                      {step.status === "current" && step.resources && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {step.resources.map((r: string) => (
                            <span key={r} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground flex items-center gap-1">
                              <ExternalLink size={9} /> {r}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action button for current step */}
                      {step.status === "current" && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={completing === step.stepId}
                          onClick={() => handleCompleteStep(step.stepId, step.title)}
                          className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-semibold flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          {completing === step.stepId ? (
                            <>
                              <div className="w-3 h-3 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} /> Mark as Completed
                              <ChevronRight size={14} />
                            </>
                          )}
                        </motion.button>
                      )}

                      {/* Completed badge */}
                      {step.status === "completed" && (
                        <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-neon-green font-medium">
                          <CheckCircle2 size={10} /> Completed · +{step.xp} XP earned
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
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
    </div>
  );
};

export default Dashboard;
