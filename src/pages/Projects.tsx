import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, Send, X, Github, Globe,
  FileText, CheckCircle2, Upload, AlertCircle, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const difficultyColor: Record<string, string> = {
  Beginner: "bg-neon-green/20 text-neon-green",
  Intermediate: "bg-neon-cyan/20 text-neon-cyan",
  Advanced: "bg-neon-pink/20 text-neon-pink",
};

interface SubmissionForm {
  githubUrl: string;
  demoUrl: string;
  description: string;
  screenshot: File | null;
}

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitModal, setSubmitModal] = useState<any | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState<SubmissionForm>({
    githubUrl: "",
    demoUrl: "",
    description: "",
    screenshot: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SubmissionForm, string>>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, refreshUser } = useAuth();
  const categories = ["All", "Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? projects : projects.filter(p => p.difficulty === filter);

  const isAlreadySubmitted = (projectId: string) => {
    if (!user?.completedProjects?.length) return false;
    return user.completedProjects.some((p: any) => {
      const id = typeof p === "object" && p !== null ? (p._id?.toString() ?? "") : p?.toString() ?? "";
      return id === projectId;
    });
  };

  const openModal = (project: any) => {
    setSubmitModal(project);
    setSubmitSuccess(false);
    setForm({ githubUrl: "", demoUrl: "", description: "", screenshot: null });
    setErrors({});
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const closeModal = () => {
    setSubmitModal(null);
    setSubmitSuccess(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm(f => ({ ...f, screenshot: file }));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    setErrors(er => ({ ...er, screenshot: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SubmissionForm, string>> = {};
    if (!form.githubUrl.trim()) {
      newErrors.githubUrl = "GitHub repository URL is required.";
    } else if (!/^https?:\/\/.+/i.test(form.githubUrl.trim())) {
      newErrors.githubUrl = "Please enter a valid URL starting with http:// or https://";
    }
    if (form.demoUrl && !/^https?:\/\/.+/i.test(form.demoUrl.trim())) {
      newErrors.demoUrl = "Please enter a valid URL starting with http:// or https://";
    }
    if (!form.description.trim()) {
      newErrors.description = "Please briefly describe what you built.";
    } else if (form.description.trim().length < 30) {
      newErrors.description = "Description must be at least 30 characters.";
    }
    if (!form.screenshot) {
      newErrors.screenshot = "A screenshot of your project is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("githubUrl", form.githubUrl.trim());
      formData.append("demoUrl", form.demoUrl.trim());
      formData.append("description", form.description.trim());
      if (form.screenshot) formData.append("screenshot", form.screenshot);

      const result = await api.submitProjectWithData(submitModal._id, formData);
      setProjects(projects.map(p => p._id === submitModal._id ? result.project : p));
      await refreshUser();
      setSubmitSuccess(true);
    } catch (err: any) {
      alert("Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
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
          <p className="text-muted-foreground mt-1">Hands-on projects to solidify your skills — submit with proof</p>
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
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[project.difficulty]}`}>{project.difficulty}</span>
                      <span className="text-xs text-muted-foreground">{project.submissions.toLocaleString()} submissions</span>
                      {isAlreadySubmitted(project._id) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green flex items-center gap-1">
                          <CheckCircle2 size={10} /> Submitted
                        </span>
                      )}
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
                      {isAlreadySubmitted(project._id) ? (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm font-semibold">
                          <CheckCircle2 size={16} /> Already Submitted — +200 XP Earned!
                        </div>
                      ) : (
                        <button
                          onClick={() => openModal(project)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
                        >
                          <Send size={14} /> Submit Project
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Submission Modal ── */}
      <AnimatePresence>
        {submitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card p-6 max-w-lg w-full neon-glow-cyan max-h-[90vh] overflow-y-auto"
            >
              {submitSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 size={32} className="text-neon-green" />
                  </motion.div>
                  <h3 className="font-display font-bold text-xl mb-2">Project Submitted! 🎉</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>{submitModal.title}</strong> has been submitted successfully.
                  </p>
                  <p className="text-neon-cyan text-sm font-semibold mt-2">+200 XP earned!</p>
                  <button
                    onClick={closeModal}
                    className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
                  >
                    Awesome!
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h2 className="font-display text-xl font-bold">Submit Project</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{submitModal.title}</p>
                    </div>
                    <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Steps Indicator */}
                  <div className="flex items-center gap-1 mb-6 p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                    {["GitHub Repo", "Live Demo", "Screenshot", "Description"].map((step, idx) => (
                      <div key={step} className="flex items-center gap-1 flex-1">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">{idx + 1}</span>
                        <span className="hidden sm:block truncate">{step}</span>
                        {idx < 3 && <div className="h-px flex-1 bg-border mx-1 hidden sm:block" />}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-5">
                    {/* GitHub URL */}
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">
                        <span className="flex items-center gap-1.5"><Github size={14} /> GitHub Repository URL <span className="text-destructive">*</span></span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/yourusername/project-name"
                        value={form.githubUrl}
                        onChange={e => { setForm(f => ({ ...f, githubUrl: e.target.value })); setErrors(er => ({ ...er, githubUrl: undefined })); }}
                        className={`w-full px-4 py-2.5 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm ${errors.githubUrl ? "border-destructive" : "border-border"}`}
                      />
                      {errors.githubUrl && (
                        <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} /> {errors.githubUrl}</p>
                      )}
                    </div>

                    {/* Demo URL */}
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">
                        <span className="flex items-center gap-1.5"><Globe size={14} /> Live Demo URL <span className="text-muted-foreground text-xs font-normal">(optional)</span></span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://your-project.vercel.app"
                        value={form.demoUrl}
                        onChange={e => { setForm(f => ({ ...f, demoUrl: e.target.value })); setErrors(er => ({ ...er, demoUrl: undefined })); }}
                        className={`w-full px-4 py-2.5 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm ${errors.demoUrl ? "border-destructive" : "border-border"}`}
                      />
                      {errors.demoUrl && (
                        <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} /> {errors.demoUrl}</p>
                      )}
                    </div>

                    {/* Screenshot Upload */}
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">
                        <span className="flex items-center gap-1.5"><Upload size={14} /> Project Screenshot <span className="text-destructive">*</span></span>
                      </label>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      {previewUrl ? (
                        <div className="relative rounded-lg overflow-hidden border border-border">
                          <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                          <button
                            onClick={() => { setForm(f => ({ ...f, screenshot: null })); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X size={14} />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-background/80 to-transparent text-xs text-muted-foreground truncate px-3">
                            {form.screenshot?.name}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-primary/50 hover:bg-primary/5 ${errors.screenshot ? "border-destructive" : "border-border"}`}
                        >
                          <Upload size={22} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
                          <span className="text-xs text-muted-foreground/60">PNG, JPG, WEBP up to 5MB</span>
                        </button>
                      )}
                      {errors.screenshot && (
                        <p className="text-destructive text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} /> {errors.screenshot}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">
                        <span className="flex items-center gap-1.5"><FileText size={14} /> What did you build? <span className="text-destructive">*</span></span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe the features you built, key challenges you overcame, and what you learned..."
                        value={form.description}
                        onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setErrors(er => ({ ...er, description: undefined })); }}
                        className={`w-full px-4 py-2.5 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm resize-none ${errors.description ? "border-destructive" : "border-border"}`}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.description ? (
                          <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle size={11} /> {errors.description}</p>
                        ) : <span />}
                        <span className={`text-xs ml-auto ${form.description.length >= 30 ? "text-neon-green" : "text-muted-foreground"}`}>
                          {form.description.length}/30 min
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                      <button onClick={closeModal} className="flex-1 py-2.5 rounded-lg glass text-muted-foreground text-sm font-semibold hover:text-foreground transition-all">
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        {submitting ? (
                          <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                        ) : (
                          <><Send size={14} /> Submit for Review</>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
