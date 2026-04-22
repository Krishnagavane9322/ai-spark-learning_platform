import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, PlayCircle, BookOpen, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

const CoursePlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.getCourse(id)
        .then((data) => {
          setCourse(data);
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="pt-20 flex-1 flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col bg-black/40 overflow-y-auto">
          <div className="p-4 flex items-center gap-4 border-b border-border/40">
            <button onClick={() => navigate("/courses")} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft size={20} />
            </button>
            <h1 className="font-display font-semibold text-lg flex items-center gap-2">
              <span className="text-2xl">{course.image}</span> {course.title}
            </h1>
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
                <div className="mt-6">
                  <h2 className="text-2xl font-bold mb-2">{activeVideo.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock size={16} className="text-primary" /> {activeVideo.duration}</span>
                  </div>
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
            <p className="text-xs text-muted-foreground mt-1">{course.topics?.length || 0} Topics</p>
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
                      return (
                        <button
                          key={vIdx}
                          onClick={() => setActiveVideo(video)}
                          className={`flex items-start gap-3 p-3 text-left transition-colors hover:bg-white/5 ${
                            isActive ? "bg-primary/10 border-l-2 border-primary" : "border-l-2 border-transparent"
                          }`}
                        >
                          <PlayCircle size={16} className={`mt-0.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <p className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
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
