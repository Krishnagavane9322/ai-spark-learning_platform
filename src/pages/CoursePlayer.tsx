import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, PlayCircle, BookOpen, Clock, CheckCircle2, Circle, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

const CoursePlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizScore, setQuizScore] = useState<any>(null);
  const [certId, setCertId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getCourse(id),
        api.getMe()
      ])
        .then(([data, user]) => {
          setCourse(data);
          setCompletedVideos(user.completedVideos || []);
          const existingCert = user.certificates?.find((c: any) => c.courseId === id);
          setIsCompleted(!!existingCert);
          setCertId(existingCert?.certificateId || null);
          setQuizScore(user.quizScores?.find((s: any) => s.courseId === id));
          // Set the first video as active if topics exist
          if (data.topics && data.topics.length > 0) {
            const firstTopicWithVideos = data.topics.find((t: any) => t.videos && t.videos.length > 0);
            if (firstTopicWithVideos) {
              setActiveVideo(firstTopicWithVideos.videos[0]);
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const toggleProgress = async (videoUrl: string) => {
    if (!id) return;
    try {
      const res = await api.updateCourseProgress(id, videoUrl);
      if (res.completed) {
        setCompletedVideos(prev => [...prev, videoUrl]);
      } else {
        setCompletedVideos(prev => prev.filter(url => url !== videoUrl));
      }
    } catch (err) {
      console.error("Failed to update progress", err);
    }
  };

  const handleQuizSubmit = async () => {
    if (!id) return;
    
    // Ensure every question has an answer
    const allAnswered = course.quiz?.every((_: any, idx: number) => quizAnswers[idx] !== undefined);
    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    setClaiming(true);
    try {
      const res = await api.submitCourseQuiz(id, quizAnswers);
      setQuizResult(res);
      setQuizScore(res);
      if (res.passed) {
        alert("You passed! You can now claim your certificate.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit quiz");
    } finally {
      setClaiming(false);
    }
  };

  const handleClaimCertificate = async () => {
    if (!id) return;
    if (!quizScore?.passed) {
      alert("You must pass the quiz (70%+) first!");
      return;
    }
    setClaiming(true);
    try {
      const res = await api.completeCourse(id);
      setIsCompleted(true);
      setCertId(res.certificate?.certificateId || null);
    } catch (err: any) {
      alert(err.message || "Failed to claim certificate");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 text-center">
          <h2 className="text-2xl font-bold">Course not found</h2>
          <button onClick={() => navigate("/courses")} className="mt-4 text-primary hover:underline">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const totalVideos = course.topics?.reduce((acc: number, t: any) => acc + (t.videos?.length || 0), 0) || 0;
  const watchedCount = course.topics?.reduce((acc: number, t: any) => {
    return acc + (t.videos?.filter((v: any) => completedVideos.includes(v.url)).length || 0);
  }, 0) || 0;
  const progressPercent = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;
  
  const needsQuiz = progressPercent === 100 && !quizScore?.passed;
  const canClaim = progressPercent === 100 && quizScore?.passed && !isCompleted;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="pt-20 flex-1 flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden relative">
        
        {/* Quiz Modal Overlay */}
        <AnimatePresence>
          {showQuiz && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Final Assessment</h2>
                    <p className="text-sm text-muted-foreground">Score 70% or higher to earn your certificate</p>
                  </div>
                  <button onClick={() => setShowQuiz(false)} className="p-2 rounded-full hover:bg-white/10"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  {!quizResult ? (
                    course.quiz && course.quiz.length > 0 ? (
                      course.quiz.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="space-y-4">
                          <h3 className="font-semibold text-lg flex gap-3">
                            <span className="text-primary">{qIdx + 1}.</span> {q.question}
                          </h3>
                          <div className="grid gap-3">
                            {q.options.map((opt: string, oIdx: number) => (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  const newAnswers = [...quizAnswers];
                                  newAnswers[qIdx] = oIdx;
                                  setQuizAnswers(newAnswers);
                                }}
                                className={`p-4 rounded-xl text-left transition-all border ${
                                  quizAnswers[qIdx] === oIdx
                                    ? "bg-primary/20 border-primary text-foreground font-semibold"
                                    : "bg-white/5 border-border hover:border-primary/50"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>No quiz questions available for this course yet.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12 space-y-6">
                      <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg ${
                        quizResult.passed ? "bg-green-500/20 text-green-500 shadow-green-500/20" : "bg-destructive/20 text-destructive shadow-destructive/20"
                      }`}>
                        {quizResult.passed ? "🎉" : "💪"}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold mb-2">
                          {quizResult.passed ? "Congratulations!" : "Keep Practicing!"}
                        </h3>
                        <p className="text-muted-foreground">You scored {quizResult.score}% in the final assessment.</p>
                      </div>
                      <div className="flex justify-center gap-8">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Correct</p>
                          <p className="text-xl font-bold">{quizResult.correctCount}</p>
                        </div>
                        <div className="text-center border-l border-border pl-8">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Questions</p>
                          <p className="text-xl font-bold">{quizResult.totalQuestions}</p>
                        </div>
                      </div>
                      {!quizResult.passed && (
                        <p className="text-sm text-destructive font-medium">You need 70% to pass. Try again when you're ready!</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
                  {!quizResult ? (
                    <>
                      <button onClick={() => setShowQuiz(false)} className="px-6 py-2 rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
                      <button 
                        onClick={handleQuizSubmit}
                        disabled={claiming}
                        className="bg-primary text-primary-foreground px-8 py-2 rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {claiming ? "Grading..." : "Submit Answers"}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        if (quizResult.passed) {
                          setShowQuiz(false);
                        } else {
                          setQuizResult(null);
                          setQuizAnswers([]);
                        }
                      }}
                      className="bg-primary text-primary-foreground px-8 py-2 rounded-lg font-bold shadow-lg"
                    >
                      {quizResult.passed ? "Continue to Certificate" : "Try Again"}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col bg-black/40 overflow-y-auto">
          <div className="p-4 flex items-center justify-between border-b border-border/40">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/courses")} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                <ChevronLeft size={20} />
              </button>
              <h1 className="font-display font-semibold text-lg flex items-center gap-2">
                <span className="text-2xl">{course.image}</span> {course.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {needsQuiz ? (
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  Take Final Quiz 📝
                </button>
              ) : canClaim ? (
                <button 
                  onClick={handleClaimCertificate}
                  disabled={claiming}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold animate-pulse flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {claiming ? "Processing..." : <>Claim Certificate 🎓</>}
                </button>
              ) : isCompleted ? (
                <div className="flex items-center gap-2">
                  <span className="bg-green-500/20 text-green-500 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                    Completed 🎓 {quizScore?.score}%
                  </span>
                  {certId && (
                    <button 
                      onClick={() => navigate(`/verify/${certId}`)}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      View Certificate
                    </button>
                  )}
                </div>
              ) : null}

              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Your Progress</p>
                  <p className="text-sm font-semibold">{progressPercent}% Completed</p>
                </div>
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4 lg:p-6">
            {activeVideo ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto flex flex-col h-full">
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe
                    key={activeVideo.url}
                    src={activeVideo.url}
                    title={activeVideo.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  ></iframe>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{activeVideo.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Clock size={16} className="text-primary" /> {activeVideo.duration}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleProgress(activeVideo.url)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${
                      completedVideos.includes(activeVideo.url)
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {completedVideos.includes(activeVideo.url) ? (
                      <><CheckCircle2 size={18} /> Completed</>
                    ) : (
                      "Mark as Completed"
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col">
                <BookOpen size={48} className="mb-4 opacity-50" />
                <p>No video selected or available for this course.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Topics */}
        <div className="w-full lg:w-80 xl:w-96 bg-card/30 border-l border-border/40 flex flex-col h-full overflow-hidden shrink-0">
          <div className="p-4 border-b border-border/40 bg-card/50">
            <h3 className="font-semibold text-sm">Course Content</h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">{course.topics?.length || 0} Topics</p>
              <p className="text-xs font-medium text-primary">{watchedCount}/{totalVideos} Videos</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {course.topics && course.topics.length > 0 ? (
              course.topics.map((topic: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-border/50 bg-white/5 overflow-hidden">
                  <div className="p-3 bg-white/5 border-b border-border/50 font-medium text-sm">
                    {topic.name}
                  </div>
                  <div className="flex flex-col">
                    {topic.videos && topic.videos.map((video: any, vIdx: number) => {
                      const isActive = activeVideo?.url === video.url && activeVideo?.title === video.title;
                      const isCompleted = completedVideos.includes(video.url);
                      return (
                        <button
                          key={vIdx}
                          onClick={() => setActiveVideo(video)}
                          className={`flex items-start gap-3 p-3 text-left transition-colors hover:bg-white/5 group ${
                            isActive ? "bg-primary/10 border-l-2 border-primary" : "border-l-2 border-transparent"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 relative">
                            {isCompleted ? (
                              <CheckCircle2 size={16} className="text-primary" />
                            ) : (
                              <PlayCircle size={16} className={`${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"}`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"} ${isCompleted ? "opacity-70" : ""}`}>
                              {video.title}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
                              <Clock size={10} /> {video.duration}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No topics available for this course.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;

