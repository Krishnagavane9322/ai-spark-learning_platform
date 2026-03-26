import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, ExternalLink, Github, Linkedin, Twitter, Edit2, Plus, X, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const Portfolio = () => {
  const { user, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      api.getDashboard()
        .then(dashData => {
          setAchievements((dashData.achievements || []).filter((a: any) => a.unlocked));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const openEditor = () => {
    setEditData({
      bio: user?.bio || "",
      socialLinks: { 
        github: user?.socialLinks?.github || "", 
        twitter: user?.socialLinks?.twitter || "", 
        linkedin: user?.socialLinks?.linkedin || "" 
      },
      skills: user?.skills?.length ? [...user.skills] : [{ name: "JavaScript", level: 50 }],
      customProjects: user?.customProjects?.length ? [...user.customProjects] : []
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updatePortfolio(editData);
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    const url = `https://neuralpath.ai/u/${user?.name?.toLowerCase().replace(/\s+/g, "-") || "user"}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12 container mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const skills = user?.skills || [];
  const customProjects = user?.customProjects || [];
  const portfolioSlug = user?.name?.toLowerCase().replace(/\s+/g, "-") || "user";
  const { github, twitter, linkedin } = user?.socialLinks || {};

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      
      <div className="pt-20 pb-12 container mx-auto px-4 max-w-4xl">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          
          {/* Top Share Bar */}
          <motion.div variants={itemVariants} className="glass-card p-3 flex flex-wrap gap-4 items-center justify-between">
            <span className="text-sm text-muted-foreground truncate flex-1 min-w-[200px]">neuralpath.ai/u/{portfolioSlug}</span>
            <div className="flex gap-2">
              <button 
                onClick={openEditor} 
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary/20 text-secondary-foreground text-sm font-semibold hover:bg-secondary/30 transition-colors">
                <Edit2 size={14} /> Edit Profile
              </button>
              <button onClick={copyLink} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow hover:brightness-110 transition-all">
                <Copy size={14} /> {copied ? "Copied!" : "Share Link"}
              </button>
            </div>
          </motion.div>

          {/* Hero Section */}
          <motion.div variants={itemVariants} className="glass-card p-8 md:p-12 text-center neon-glow-cyan relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50"></div>
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 mx-auto flex items-center justify-center text-5xl mb-6 shadow-2xl shadow-primary/20 backdrop-blur-sm border-4 border-background/50">
              {user?.avatar || "👨‍💻"}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-2">{user?.name || "User"}</h1>
            <p className="text-primary/80 font-medium mb-4">Level {user?.level || 1} Developer</p>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
              {user?.bio || "Full-stack Developer passionate about AI and Web technologies. Always learning, always building."}
            </p>
            
            <div className="flex justify-center gap-4">
              {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass flex flex-col justify-center items-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all hover:scale-110">
                  <Github size={18} />
                </a>
              )}
              {twitter && (
                <a href={twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass flex flex-col justify-center items-center text-muted-foreground hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all hover:scale-110">
                  <Twitter size={18} />
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass flex flex-col justify-center items-center text-muted-foreground hover:text-[#0077b5] hover:bg-[#0077b5]/10 transition-all hover:scale-110">
                  <Linkedin size={18} />
                </a>
              )}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Skills Panel */}
            <motion.div variants={itemVariants} className="md:col-span-1 glass-card p-6 h-fit">
              <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-2"><span className="text-primary">⚡</span> Core Skills</h2>
              <div className="space-y-4">
                {skills.length > 0 ? skills.map((skill: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                      <span>{skill.name}</span>
                      <span className="text-muted-foreground text-xs">{skill.level}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      />
                    </div>
                  </div>
                )) : (
                   <p className="text-sm text-muted-foreground">No skills added yet.</p>
                )}
              </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Projects */}
              <motion.div variants={itemVariants} className="glass-card p-6">
                <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-2"><span className="text-primary">🚀</span> Featured Projects</h2>
                {customProjects.length > 0 ? (
                  <div className="space-y-4">
                    {customProjects.map((p: any, i: number) => (
                      <motion.div key={i} whileHover={{ y: -2 }} className="glass p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{p.title}</h3>
                          <div className="flex gap-2">
                            {p.githubUrl && (
                              <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                                <Github size={16} />
                              </a>
                            )}
                            {p.demoUrl && (
                              <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors">
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(p.tech || []).map((t: string) => (
                            <span key={t} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {t}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 glass rounded-xl border-dashed">
                    <p className="text-sm text-muted-foreground">No projects added yet.</p>
                    <button onClick={openEditor} className="mt-2 text-primary text-sm font-semibold hover:underline">Add a Project</button>
                  </div>
                )}
              </motion.div>

              {/* Achievements */}
              <motion.div variants={itemVariants} className="glass-card p-6">
                <h2 className="font-display font-bold text-xl mb-5 flex items-center gap-2"><span className="text-primary">🏆</span> Achievements</h2>
                <div className="flex flex-wrap gap-4">
                  {achievements.length > 0 ? achievements.map((a: any) => (
                    <motion.div key={a._id} whileHover={{ scale: 1.05, y: -4 }}
                      className="glass p-4 rounded-xl flex flex-col items-center text-center w-[110px] border border-border/50 shadow-sm">
                      <span className="text-4xl mb-2 drop-shadow-md">{a.icon}</span>
                      <span className="text-[11px] font-bold leading-tight">{a.title}</span>
                    </motion.div>
                  )) : (
                    <p className="text-sm text-muted-foreground py-4">Complete platform activities and courses to unlock achievements!</p>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !saving && setIsEditing(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-border/50 shadow-2xl p-6 rounded-2xl z-10 custom-scrollbar">
              
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-background/95 backdrop-blur py-2 z-20 border-b border-border/50">
                <h2 className="text-2xl font-bold font-display">Edit Portfolio</h2>
                <button disabled={saving} onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-primary">Basic Info</h3>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Bio / Summary</label>
                    <textarea 
                      value={editData.bio} 
                      onChange={e => setEditData({...editData, bio: e.target.value})}
                      className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                      placeholder="Tell the world about yourself..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">GitHub URL</label>
                      <input type="text" value={editData.socialLinks.github} onChange={e => setEditData({...editData, socialLinks: {...editData.socialLinks, github: e.target.value}})} className="w-full bg-background/50 border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://github.com/..." />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Twitter URL</label>
                      <input type="text" value={editData.socialLinks.twitter} onChange={e => setEditData({...editData, socialLinks: {...editData.socialLinks, twitter: e.target.value}})} className="w-full bg-background/50 border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://twitter.com/..." />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">LinkedIn URL</label>
                      <input type="text" value={editData.socialLinks.linkedin} onChange={e => setEditData({...editData, socialLinks: {...editData.socialLinks, linkedin: e.target.value}})} className="w-full bg-background/50 border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-border/50"></div>

                {/* Skills */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-primary">Core Skills</h3>
                    <button onClick={() => setEditData({...editData, skills: [...editData.skills, { name: "", level: 50 }]})} className="text-xs flex items-center gap-1 text-primary hover:underline"><Plus size={14}/> Add Skill</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editData.skills.map((s: any, i: number) => (
                      <div key={i} className="flex gap-2 items-center bg-white/5 p-2 rounded-lg border border-border/30">
                        <input type="text" value={s.name} onChange={e => { const newSkills = [...editData.skills]; newSkills[i].name = e.target.value; setEditData({...editData, skills: newSkills}); }} className="flex-1 bg-transparent text-sm focus:outline-none px-2" placeholder="Skill name" />
                        <input type="number" min="0" max="100" value={s.level} onChange={e => { const newSkills = [...editData.skills]; newSkills[i].level = Number(e.target.value); setEditData({...editData, skills: newSkills}); }} className="w-16 bg-background/50 border border-border rounded text-sm p-1 text-center" />
                        <button onClick={() => { const newSkills = editData.skills.filter((_: any, idx: number) => idx !== i); setEditData({...editData, skills: newSkills}); }} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-border/50"></div>

                {/* Projects */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-primary">Custom Projects</h3>
                    <button onClick={() => setEditData({...editData, customProjects: [{ title: "", description: "", tech: [], demoUrl: "", githubUrl: "" }, ...editData.customProjects]})} className="text-xs flex items-center gap-1 text-primary hover:underline"><Plus size={14}/> Add Project</button>
                  </div>
                  <div className="space-y-4">
                    {editData.customProjects.map((p: any, i: number) => (
                      <div key={i} className="bg-white/5 p-4 rounded-xl border border-border/50 relative">
                        <button onClick={() => { const newProj = editData.customProjects.filter((_: any, idx: number) => idx !== i); setEditData({...editData, customProjects: newProj}); }} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                        <div className="space-y-3 pr-8">
                          <div>
                            <input type="text" value={p.title} onChange={e => { const newProj = [...editData.customProjects]; newProj[i].title = e.target.value; setEditData({...editData, customProjects: newProj}); }} className="w-full bg-background/50 border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold" placeholder="Project Title" />
                          </div>
                          <div>
                            <textarea value={p.description} onChange={e => { const newProj = [...editData.customProjects]; newProj[i].description = e.target.value; setEditData({...editData, customProjects: newProj}); }} className="w-full bg-background/50 border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Project Description" rows={2} />
                          </div>
                          <div>
                            <input type="text" value={p.tech.join(", ")} onChange={e => { const newProj = [...editData.customProjects]; newProj[i].tech = e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean); setEditData({...editData, customProjects: newProj}); }} className="w-full bg-background/50 border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Tech Stack (comma separated, e.g. React, Node.js)" />
                          </div>
                          <div className="flex gap-3">
                            <input type="text" value={p.demoUrl} onChange={e => { const newProj = [...editData.customProjects]; newProj[i].demoUrl = e.target.value; setEditData({...editData, customProjects: newProj}); }} className="flex-1 bg-background/50 border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Live Demo URL (optional)" />
                            <input type="text" value={p.githubUrl} onChange={e => { const newProj = [...editData.customProjects]; newProj[i].githubUrl = e.target.value; setEditData({...editData, customProjects: newProj}); }} className="flex-1 bg-background/50 border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="GitHub URL (optional)" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {editData.customProjects.length === 0 && (
                      <p className="text-sm text-muted-foreground italic text-center py-4">Add projects to showcase your portfolio.</p>
                    )}
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-4 border-t border-border/50 flex justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur py-4 z-20">
                <button disabled={saving} onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
                <button disabled={saving} onClick={handleSave} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  Save Profile
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Portfolio;
