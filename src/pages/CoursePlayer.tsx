import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, PlayCircle, BookOpen, Clock, CheckCircle2, Circle } from "lucide-react";
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

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getCourse(id),
        api.getMe()
      ])
        .then(([data, user]) => {
          setCourse(data);
          setCompletedVideos(user.completedVideos || []);
          setIsCompleted(user.certificates?.some((c: any) => c.courseId === id));
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

  const handleClaimCertificate = async () => {
    if (!id) return;
    setClaiming(true);
    try {
      await api.completeCourse(id);
      setIsCompleted(true);
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
  const canClaim = progressPercent === 100 && !isCompleted;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="pt-20 flex-1 flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
        
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
              {canClaim ? (
                <button 
                  onClick={handleClaimCertificate}
                  disabled={claiming}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold animate-pulse flex items-center gap-2"
                >
                  {claiming ? "Processing..." : <>Claim Certificate 🎓</>}
                </button>
              ) : isCompleted ? (
                <span className="bg-green-500/20 text-green-500 border border-green-500/30 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                  Completed 🎓
                </span>
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
                    src={activeVideo.url}
                    title={activeVideo.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
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

