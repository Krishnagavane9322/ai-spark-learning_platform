import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const difficultyColor: Record<string, string> = {
  Beginner: "bg-neon-green/20 text-neon-green",
  Intermediate: "bg-neon-cyan/20 text-neon-cyan",
  Advanced: "bg-neon-pink/20 text-neon-pink",
};

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { refreshUser } = useAuth();
  const categories = ["All", "Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? projects : projects.filter(p => p.difficulty === filter);

  const handleSubmit = async (projectId: string) => {
    setSubmitting(projectId);
    try {
      const result = await api.submitProject(projectId);
      setProjects(projects.map(p => p._id === projectId ? result.project : p));
      await refreshUser();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(null);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold">Build <span className="gradient-text">Projects</span></h1>
          <p className="text-muted-foreground mt-1">Hands-on projects to solidify your skills</p>
        </motion.div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all ${filter === c ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((project, i) => (
            <motion.div key={project._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden">
              <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === project._id ? null : project._id)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[project.difficulty]}`}>{project.difficulty}</span>
                      <span className="text-xs text-muted-foreground">{project.submissions.toLocaleString()} submissions</span>
                    </div>
                    <h3 className="font-semibold">{project.title}</h3>
                  </div>
                  {expanded === project._id ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                </div>
              </div>
              <AnimatePresence>
                {expanded === project._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border">
                    <div className="p-5 space-y-4">
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((t: string) => <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary">{t}</span>)}
                      </div>
                      <button
                        onClick={() => handleSubmit(project._id)}
                        disabled={submitting === project._id}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        <Send size={14} /> {submitting === project._id ? "Submitting..." : "Submit Project"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
