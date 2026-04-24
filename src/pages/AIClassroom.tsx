import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Bot, Zap, Lightbulb, BookOpen, Code2, Briefcase,
  CalendarCheck, Mic, Map, Sparkles
} from "lucide-react";
import TeacherChatbot from "@/components/classroom/TeacherChatbot";
import QuizGenerator from "@/components/classroom/QuizGenerator";
import ExplainTopic from "@/components/classroom/ExplainTopic";
import HomeworkSolver from "@/components/classroom/HomeworkSolver";
import CodeAssistant from "@/components/classroom/CodeAssistant";
import ResumeGuidance from "@/components/classroom/ResumeGuidance";
import AttendanceBot from "@/components/classroom/AttendanceBot";
import VoiceTutor from "@/components/classroom/VoiceTutor";
import LearningPathTool from "@/components/classroom/LearningPathTool";

const TOOLS = [
  { id: "teacher",       label: "AI Teacher",      icon: Bot,          color: "cyan",   desc: "Chat with your personal AI tutor" },
  { id: "quiz",          label: "Quiz Generator",  icon: Zap,          color: "violet", desc: "Auto-generate quizzes on any topic" },
  { id: "explain",       label: "Explain Simply",  icon: Lightbulb,    color: "amber",  desc: "Understand any concept in 3 layers" },
  { id: "homework",      label: "Homework Solver", icon: BookOpen,     color: "emerald",desc: "Step-by-step problem solutions" },
  { id: "code",          label: "Code Assistant",  icon: Code2,        color: "sky",    desc: "Debug, write & explain code" },
  { id: "resume",        label: "Career Guide",    icon: Briefcase,    color: "rose",   desc: "Resume & career roadmap advice" },
  { id: "attendance",    label: "Attendance Bot",  icon: CalendarCheck,color: "orange", desc: "Academic policy Q&A" },
  { id: "voice",         label: "Voice Tutor",     icon: Mic,          color: "pink",   desc: "Speak & get AI tutoring" },
  { id: "path",          label: "Learning Path",   icon: Map,          color: "indigo", desc: "Personalized study roadmap" },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/40",   text: "text-cyan-400",   glow: "shadow-cyan-500/20" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/40", text: "text-violet-400", glow: "shadow-violet-500/20" },
  amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/40",  text: "text-amber-400",  glow: "shadow-amber-500/20" },
  emerald:{ bg: "bg-emerald-500/10",border: "border-emerald-500/40",text: "text-emerald-400",glow: "shadow-emerald-500/20" },
  sky:    { bg: "bg-sky-500/10",    border: "border-sky-500/40",    text: "text-sky-400",    glow: "shadow-sky-500/20" },
  rose:   { bg: "bg-rose-500/10",   border: "border-rose-500/40",   text: "text-rose-400",   glow: "shadow-rose-500/20" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/40", text: "text-orange-400", glow: "shadow-orange-500/20" },
  pink:   { bg: "bg-pink-500/10",   border: "border-pink-500/40",   text: "text-pink-400",   glow: "shadow-pink-500/20" },
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/40", text: "text-indigo-400", glow: "shadow-indigo-500/20" },
};

const TOOL_COMPONENTS: Record<string, React.FC> = {
  teacher:    TeacherChatbot,
  quiz:       QuizGenerator,
  explain:    ExplainTopic,
  homework:   HomeworkSolver,
  code:       CodeAssistant,
  resume:     ResumeGuidance,
  attendance: AttendanceBot,
  voice:      VoiceTutor,
  path:       LearningPathTool,
};

export default function AIClassroom() {
  const [activeTool, setActiveTool] = useState("teacher");
  const active = TOOLS.find(t => t.id === activeTool)!;
  const c = colorMap[active.color];
  const ActiveComponent = TOOL_COMPONENTS[activeTool];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex h-screen overflow-hidden">

        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold gradient-text">AI Classroom</p>
                <p className="text-[10px] text-muted-foreground">Powered by GPT-4o</p>
              </div>
            </div>
          </div>

          {/* Tool List */}
          <nav className="p-3 flex flex-col gap-1">
            {TOOLS.map((tool, i) => {
              const isActive = tool.id === activeTool;
              const tc = colorMap[tool.color];
              return (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveTool(tool.id)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                    isActive
                      ? `${tc.bg} ${tc.border} border shadow-lg ${tc.glow}`
                      : "hover:bg-muted/40 border border-transparent"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full ${tc.text.replace("text-", "bg-")}`}
                    />
                  )}
                  <div className={`p-1.5 rounded-lg transition-all ${isActive ? tc.bg : "bg-muted/30 group-hover:bg-muted/50"}`}>
                    <tool.icon size={15} className={isActive ? tc.text : "text-muted-foreground group-hover:text-foreground"} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isActive ? tc.text : "text-muted-foreground group-hover:text-foreground"}`}>
                      {tool.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 truncate">{tool.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </nav>

          {/* Bottom Badge */}
          <div className="mt-auto p-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-semibold text-primary mb-0.5">✨ AI-Powered</p>
              <p className="text-[10px] text-muted-foreground">All tools use GPT-4o via NVIDIA NIM</p>
            </div>
          </div>
        </aside>

        {/* Mobile tool picker */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-sm border-t border-border/50 px-2 py-2 flex gap-1 overflow-x-auto">
          {TOOLS.map(tool => {
            const tc = colorMap[tool.color];
            const isActive = tool.id === activeTool;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive ? `${tc.bg} ${tc.border} border` : "hover:bg-muted/40"
                }`}
              >
                <tool.icon size={16} className={isActive ? tc.text : "text-muted-foreground"} />
                <span className={`text-[9px] font-medium ${isActive ? tc.text : "text-muted-foreground"}`}>
                  {tool.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tool Header */}
          <div className={`px-6 py-3 border-b border-border/50 flex items-center gap-3 ${c.bg}`}>
            <div className={`p-2 rounded-xl ${c.bg} border ${c.border}`}>
              <active.icon size={20} className={c.text} />
            </div>
            <div>
              <h1 className={`text-base font-bold ${c.text}`}>{active.label}</h1>
              <p className="text-xs text-muted-foreground">{active.desc}</p>
            </div>
          </div>

          {/* Active Tool Panel */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTool}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="h-full"
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
