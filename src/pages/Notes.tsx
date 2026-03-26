import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Download, Brain, Layers, RotateCcw, Trash2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

const Notes = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "flashcards" | "mindmap">("upload");
  const [notes, setNotes] = useState<any[]>([]);
  const [currentNote, setCurrentNote] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getNotes()
      .then(data => {
        setNotes(data);
        if (data.length > 0) setCurrentNote(data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.split(".")[0]);

      const note = await api.createNote(formData);
      setNotes(prev => [note, ...prev]);
      setCurrentNote(note);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      alert("Failed to upload and process note: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.deleteNote(noteId);
      const updated = notes.filter(n => n._id !== noteId);
      setNotes(updated);
      if (currentNote?._id === noteId) {
        setCurrentNote(updated[0] || null);
        setCurrentCard(0);
        setFlipped(false);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownload = () => {
    if (!currentNote?.extractedText) return;
    const blob = new Blob([currentNote.extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentNote.title || "Note"}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const flashcards = currentNote?.flashcards || [];
  const mindmapData = currentNote?.mindmapData || { center: "Topic", branches: [] };

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => setCurrentCard((currentCard + 1) % flashcards.length), 200);
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
      <div className="pt-20 pb-12 container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold">Smart <span className="gradient-text">Notes</span></h1>
          <p className="text-muted-foreground mt-1">Convert handwritten notes to digital formats, flashcards & mindmaps automatically via AI.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {([["upload", "Upload & Manage", Upload], ["flashcards", "Flashcards", Layers], ["mindmap", "Mind Map", Brain]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => { setActiveTab(key as any); setCurrentCard(0); setFlipped(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "glass text-muted-foreground hover:text-foreground"}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Upload & Manage */}
        {activeTab === "upload" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass-card p-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
              />
              <div 
                onClick={() => !uploading && fileInputRef.current?.click()} 
                className={`border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full mb-4" />
                    <p className="font-semibold text-lg">Extracting text...</p>
                    <p className="text-xs text-muted-foreground mt-1">Applying OCR and generating flashcards.</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                      <Upload size={32} />
                    </div>
                    <p className="font-semibold text-lg">Click to Upload Notes</p>
                    <p className="text-sm text-muted-foreground mt-2">Supports JPG, PNG images and PDFs</p>
                  </>
                )}
              </div>
            </div>

            {/* Notes List & Preview */}
            {notes.length > 0 && (
              <div className="grid md:grid-cols-5 gap-6">
                {/* List */}
                <div className="md:col-span-2 glass-card p-4 h-[500px] overflow-y-auto">
                  <h3 className="font-semibold mb-3 px-2">Your Notes ({notes.length})</h3>
                  <div className="space-y-2">
                    {notes.map(note => (
                      <div key={note._id} 
                        className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${currentNote?._id === note._id ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-white/5"}`}
                        onClick={() => setCurrentNote(note)}>
                        <FileText size={18} className={currentNote?._id === note._id ? "text-primary" : "text-muted-foreground"} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${currentNote?._id === note._id ? "text-foreground" : "text-muted-foreground"}`}>{note.title}</p>
                          <p className="text-[10px] text-muted-foreground/70">{new Date(note.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                          title="Delete Note"
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {currentNote && (
                  <div className="md:col-span-3 glass-card flex flex-col h-[500px]">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-semibold text-sm truncate pr-4">{currentNote.title}</h3>
                      <button onClick={handleDownload} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                        <Download size={14} /> Download (.txt)
                      </button>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto">
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono relative z-10">
                        {currentNote.extractedText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Flashcards */}
        {activeTab === "flashcards" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8">
            {flashcards.length > 0 ? (
              <>
                <div className="w-full max-w-xl mb-8">
                  <div className="flex justify-between text-xs text-muted-foreground mb-4 px-2">
                    <span>Card {currentCard + 1} of {flashcards.length}</span>
                    <span>{currentNote?.title}</span>
                  </div>
                  <div style={{ perspective: "1000px" }} className="w-full">
                    <motion.div
                      onClick={() => setFlipped(!flipped)}
                      animate={{ rotateY: flipped ? 180 : 0 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                      className="glass-card h-80 cursor-pointer flex items-center justify-center text-center relative border-primary/20 hover:border-primary/40 transition-colors shadow-xl shadow-black/20"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Front */}
                      <div style={{ backfaceVisibility: "hidden" }} className="absolute inset-0 flex flex-col items-center justify-center p-8">
                        <span className="absolute top-4 left-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Front</span>
                        <p className="text-xl md:text-2xl font-semibold leading-snug">{flashcards[currentCard]?.front}</p>
                      </div>
                      
                      {/* Back */}
                      <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
                        <span className="absolute top-4 left-4 text-[10px] font-bold tracking-wider text-primary uppercase">Back</span>
                        <p className="text-lg md:text-xl text-foreground font-medium leading-relaxed">{flashcards[currentCard]?.back}</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button onClick={() => { setFlipped(false); setTimeout(() => setCurrentCard((currentCard - 1 + flashcards.length) % flashcards.length), 150); }} className="p-3 rounded-full glass hover:bg-white/10 transition-colors">
                    <RotateCcw size={20} className="-rotate-180" />
                  </button>
                  <button onClick={nextCard} className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:brightness-110 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95">
                    Next Card <RotateCcw size={18} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-6">Click the card to flip between question and answer</p>
              </>
            ) : (
              <div className="glass-card p-12 text-center max-w-md w-full border-dashed">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  <Layers size={32} />
                </div>
                <h3 className="font-semibold text-lg mb-1">No flashcards found</h3>
                <p className="text-sm text-muted-foreground">Upload a document with readable text to automatically generate study flashcards.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Mind Map */}
        {activeTab === "mindmap" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 md:p-8 overflow-hidden">
            <h3 className="font-semibold text-center mb-6 text-muted-foreground">{currentNote?.title || "Mind Map"}</h3>
            {currentNote?.mindmapData?.branches?.length > 0 ? (
              <div className="flex items-center justify-center min-h-[500px] relative">
                {/* Center Node */}
                <motion.div animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0px #0ea5e9", "0 0 20px #0ea5e9", "0 0 0px #0ea5e9"] }} transition={{ duration: 3, repeat: Infinity }}
                  className="absolute p-5 rounded-full bg-primary text-primary-foreground font-bold text-sm md:text-base z-20 shadow-xl border-4 border-background">
                  {mindmapData.center}
                </motion.div>
                
                {/* Branches */}
                {mindmapData.branches.map((branch: string, i: number) => {
                  const angle = (i / mindmapData.branches.length) * 2 * Math.PI - Math.PI / 2;
                  // Make distance responsive
                  const distance = window.innerWidth < 768 ? 120 : 180;
                  const x = Math.cos(angle) * distance;
                  const y = Math.sin(angle) * distance;
                  
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, type: "spring" }}
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                      className="absolute p-3 rounded-xl bg-card border border-primary/30 text-xs md:text-sm font-semibold text-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer z-10 whitespace-nowrap"
                    >
                      {branch}
                    </motion.div>
                  );
                })}
                
                {/* Lines connecting nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="-300 -300 600 600">
                  {mindmapData.branches.map((_: string, i: number) => {
                    const angle = (i / mindmapData.branches.length) * 2 * Math.PI - Math.PI / 2;
                    const distance = window.innerWidth < 768 ? 120 : 180;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    return (
                      <motion.line 
                        key={i} 
                        initial={{ pathLength: 0 }} 
                        animate={{ pathLength: 1 }} 
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                        x1="0" y1="0" x2={x} y2={y} 
                        stroke="currentColor" 
                        className="text-primary/30"
                        strokeWidth="2" 
                      />
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] border-dashed rounded-xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Brain size={32} />
                </div>
                <h3 className="font-semibold text-lg mb-1">No concept map structure found.</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">Upload a document with readable text to extract key concepts and map their relationships automatically.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notes;
