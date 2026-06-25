import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Trophy, Target, Clock, Lock, CheckCircle2, Play, Sparkles, BookOpen, ExternalLink, ChevronRight, ChevronDown, Code2, Crown, TrendingUp } from "lucide-react";
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

  // Leaderboard state
  const [leaderboardType, setLeaderboardType] = useState<"xp" | "streak">("xp");
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const fetchLeaderboard = async (type: "xp" | "streak") => {
    setLeaderboardLoading(true);
    try {
      const data = await api.getLeaderboard(type);
      setLeaderboardData(data);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [dash, assessment, leaderboard] = await Promise.all([
        api.getDashboard(),
        api.getAssessmentStatus(),
        api.getLeaderboard(leaderboardType),
      ]);
      setDashData(dash);
      setAssessmentData(assessment);
      setLeaderboardData(leaderboard);
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

  // Refetch when leaderboard sorting type changes
  useEffect(() => {
    if (!loading) {
      fetchLeaderboard(leaderboardType);
    }
  }, [leaderboardType]);

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
      
      // Update leaderboard live
      fetchLeaderboard(leaderboardType);
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
  const completedCount = Array.isArray(personalizedPath) ? personalizedPath.filter((s: any) => s.status === "completed").length : 0;
  const totalSteps = Array.isArray(personalizedPath) ? personalizedPath.length : 0;
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
          {(Array.isArray(stats) ? stats : []).map((stat, i) => (
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
          <motion.div id="personalized-path" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass-card p-6">
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
                {(Array.isArray(personalizedPath) ? personalizedPath : []).map((step: any, i: number) => {
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
                                    {(Array.isArray(step.whatYouLearn) ? step.whatYouLearn : []).map((item: string, j: number) => (
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
                                    {(Array.isArray(step.resources) ? step.resources : []).map((r: any, j: number) => {
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
                {(Array.isArray(weeklyActivity) ? weeklyActivity : []).map((day: any, i: number) => {
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
                {(Array.isArray(weeklyActivity) ? weeklyActivity : []).reduce((sum: number, d: any) => sum + d.hours, 0).toFixed(1)}h total this week
              </p>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card p-6 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-neon-pink animate-pulse shrink-0" />
                  <h3 className="font-display font-semibold text-lg">Leaderboard</h3>
                  {/* Live Status indicator */}
                  <span className="flex items-center gap-1.5 ml-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    LIVE
                  </span>
                </div>

                {/* Filter pill tabs */}
                <div className="flex bg-muted/50 p-0.5 rounded-lg border border-border/40 shrink-0">
                  <button
                    onClick={() => setLeaderboardType("xp")}
                    className={`text-[10px] px-2.5 py-1 rounded-md transition-all font-semibold uppercase tracking-wider ${
                      leaderboardType === "xp"
                        ? "bg-background text-foreground shadow-sm font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    XP
                  </button>
                  <button
                    onClick={() => setLeaderboardType("streak")}
                    className={`text-[10px] px-2.5 py-1 rounded-md transition-all font-semibold uppercase tracking-wider ${
                      leaderboardType === "streak"
                        ? "bg-background text-foreground shadow-sm font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Streak
                  </button>
                </div>
              </div>

              {leaderboardLoading && !leaderboardData ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
                  <span className="text-xs text-muted-foreground">Syncing live standings...</span>
                </div>
              ) : leaderboardData?.leaderboard ? (
                <div className="space-y-5">
                  {/* Podium (Top 3) */}
                  <div className="grid grid-cols-3 gap-2 pt-2 items-end justify-center border-b border-border/30 pb-4">
                    {/* Rank 2 (Left) */}
                    {leaderboardData.leaderboard[1] ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-1 group">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-slate-400">
                            <Crown size={12} className="rotate-[-15deg]" />
                          </div>
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 border border-border text-[10px] font-bold text-white shadow-sm">
                            2
                          </span>
                          <span className="text-3xl p-1.5 inline-block rounded-full bg-slate-500/10 border border-slate-400/30 group-hover:scale-105 transition-transform duration-300">
                            {leaderboardData.leaderboard[1].avatar || "👨‍💻"}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold truncate w-full max-w-[65px] block mt-1">
                          {leaderboardData.leaderboard[1].name.split(" ")[0]}
                        </span>
                        <span className="text-[9px] text-muted-foreground mt-0.5 bg-slate-500/10 px-1.5 py-0.5 rounded-full font-medium">
                          Lv.{leaderboardData.leaderboard[1].level || 1}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 mt-1 flex items-center gap-0.5">
                          {leaderboardType === "xp" ? (
                            <>
                              <Zap size={9} className="text-neon-violet shrink-0" />
                              {leaderboardData.leaderboard[1].xp.toLocaleString()}
                            </>
                          ) : (
                            <>
                              <Flame size={9} className="text-neon-cyan shrink-0" />
                              {leaderboardData.leaderboard[1].streak}d
                            </>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center opacity-30">
                        <div className="w-10 h-10 rounded-full border border-dashed border-muted flex items-center justify-center text-xs">-</div>
                      </div>
                    )}

                    {/* Rank 1 (Middle) */}
                    {leaderboardData.leaderboard[0] ? (
                      <div className="flex flex-col items-center text-center -translate-y-1">
                        <div className="relative mb-2 group">
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                            <Crown size={16} />
                          </div>
                          <span className="absolute -bottom-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-amber-500 border-2 border-amber-400 text-[10px] font-bold text-black shadow-md">
                            1
                          </span>
                          <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <span className="text-4xl p-2 inline-block rounded-full bg-background border border-amber-300/40">
                              {leaderboardData.leaderboard[0].avatar || "👑"}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold truncate w-full max-w-[70px] block text-amber-300">
                          {leaderboardData.leaderboard[0].name.split(" ")[0]}
                        </span>
                        <span className="text-[9px] text-amber-400 mt-0.5 bg-amber-400/10 px-1.5 py-0.5 rounded-full font-medium border border-amber-400/20">
                          Lv.{leaderboardData.leaderboard[0].level || 1}
                        </span>
                        <span className="text-xs font-bold text-amber-300 mt-1 flex items-center gap-0.5 justify-center">
                          {leaderboardType === "xp" ? (
                            <>
                              <Zap size={10} className="text-amber-400 shrink-0" />
                              {leaderboardData.leaderboard[0].xp.toLocaleString()}
                            </>
                          ) : (
                            <>
                              <Flame size={10} className="text-amber-400 shrink-0" />
                              {leaderboardData.leaderboard[0].streak}d
                            </>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center opacity-30">
                        <div className="w-12 h-12 rounded-full border border-dashed border-muted flex items-center justify-center text-xs">-</div>
                      </div>
                    )}

                    {/* Rank 3 (Right) */}
                    {leaderboardData.leaderboard[2] ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-1 group">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-700">
                            <Crown size={12} className="rotate-[15deg]" />
                          </div>
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 border border-border text-[10px] font-bold text-white shadow-sm">
                            3
                          </span>
                          <span className="text-3xl p-1.5 inline-block rounded-full bg-amber-800/10 border border-amber-700/30 group-hover:scale-105 transition-transform duration-300">
                            {leaderboardData.leaderboard[2].avatar || "🧑‍💻"}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold truncate w-full max-w-[65px] block mt-1">
                          {leaderboardData.leaderboard[2].name.split(" ")[0]}
                        </span>
                        <span className="text-[9px] text-muted-foreground mt-0.5 bg-amber-700/10 px-1.5 py-0.5 rounded-full font-medium">
                          Lv.{leaderboardData.leaderboard[2].level || 1}
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 mt-1 flex items-center gap-0.5">
                          {leaderboardType === "xp" ? (
                            <>
                              <Zap size={9} className="text-neon-pink shrink-0" />
                              {leaderboardData.leaderboard[2].xp.toLocaleString()}
                            </>
                          ) : (
                            <>
                              <Flame size={9} className="text-neon-pink shrink-0" />
                              {leaderboardData.leaderboard[2].streak}d
                            </>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center opacity-30">
                        <div className="w-10 h-10 rounded-full border border-dashed border-muted flex items-center justify-center text-xs">-</div>
                      </div>
                    )}
                  </div>

                  {/* List (Positions 4-10) */}
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {leaderboardData.leaderboard.length > 3 ? (
                      leaderboardData.leaderboard.slice(3).map((item: any, idx: number) => {
                        const absoluteRank = idx + 4;
                        const isCurrentUser = item._id === user?._id;
                        return (
                          <div
                            key={item._id}
                            className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                              isCurrentUser
                                ? "bg-primary/10 border-primary/40 shadow-sm"
                                : "bg-white/2 hover:bg-white/5 border-transparent"
                            }`}
                          >
                            <span className={`text-xs font-semibold w-5 text-center ${
                              isCurrentUser ? "text-primary" : "text-muted-foreground"
                            }`}>
                              {absoluteRank}
                            </span>
                            <span className="text-xl shrink-0">{item.avatar || "👤"}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate ${isCurrentUser ? "text-primary font-bold" : ""}`}>
                                {item.name} {isCurrentUser && "(You)"}
                              </p>
                              <p className="text-[9px] text-muted-foreground">Level {item.level || 1}</p>
                            </div>
                            <span className="text-xs font-bold flex items-center gap-1 shrink-0 text-foreground">
                              {leaderboardType === "xp" ? (
                                <>
                                  <Zap size={10} className="text-neon-violet" />
                                  {(item.xp || 0).toLocaleString()}
                                </>
                              ) : (
                                <>
                                  <Flame size={10} className="text-neon-cyan" />
                                  {item.streak || 0}d
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center py-4 text-xs text-muted-foreground">No other runners yet</p>
                    )}
                  </div>

                  {/* User Progress Panel */}
                  {leaderboardData.currentUser && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <div className="glass-card bg-gradient-to-br from-primary/5 via-transparent to-neon-pink/5 p-3.5 rounded-xl border border-primary/20 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Your Rank:</span>
                            <span className="text-sm font-bold text-foreground flex items-center gap-1">
                              <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-extrabold">
                                #{leaderboardData.currentUserRank}
                              </span>
                            </span>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                            {leaderboardType === "xp" ? (
                              <>
                                <Zap size={11} className="text-neon-violet" />
                                {(leaderboardData.currentUser.xp || 0).toLocaleString()} XP
                              </>
                            ) : (
                              <>
                                <Flame size={11} className="text-neon-cyan" />
                                {leaderboardData.currentUser.streak || 0} day streak
                              </>
                            )}
                          </span>
                        </div>

                        {leaderboardData.currentUserRank > 1 && leaderboardData.nextUser ? (
                          <div className="text-[11px] text-muted-foreground flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span>
                                Needs <strong className="text-foreground">{leaderboardType === "xp" ? `${(leaderboardData.gapToNext || 0).toLocaleString()} XP` : `${leaderboardData.gapToNext || 0} days`}</strong> to pass <strong className="text-primary">{leaderboardData.nextUser.split(" ")[0]}</strong>
                              </span>
                              <span className="font-semibold text-primary">#{leaderboardData.currentUserRank - 1}</span>
                            </div>
                            {/* Progress bar to next user */}
                            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-1.5">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-neon-pink"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      10,
                                      ((leaderboardData.currentUser[leaderboardType] || 0) /
                                        ((leaderboardData.currentUser[leaderboardType] || 0) + (leaderboardData.gapToNext || 1))) *
                                        100
                                    )
                                  )}%`
                                }}
                              />
                            </div>
                          </div>
                        ) : leaderboardData.currentUserRank === 1 ? (
                          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5 mt-1">
                            <Crown size={12} className="animate-bounce shrink-0" />
                            You are leading the board! Outstanding! 👑
                          </div>
                        ) : null}

                        {/* Earn XP / Boost Rank Link */}
                        <div className="mt-1">
                          <button
                            onClick={() => {
                              const element = document.getElementById("personalized-path");
                              if (element) {
                                element.scrollIntoView({ behavior: "smooth" });
                              }
                            }}
                            className="w-full py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                          >
                            <TrendingUp size={11} /> Boost Your Rank Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No leaderboard data available.
                </div>
              )}
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4">Achievements</h3>
              <div className="grid grid-cols-3 gap-3">
                {(Array.isArray(achievements) ? achievements : []).map((a: any) => (
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
                  {(Array.isArray(assessmentData.interests) ? assessmentData.interests : []).map((interest: string) => (
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
