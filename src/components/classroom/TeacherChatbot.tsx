import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Bot, User, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain recursion with a real example",
  "What is the difference between SQL and NoSQL?",
  "How does React's useEffect work?",
  "Teach me about Big O notation",
];

export default function TeacherChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const userMsg: Message = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const data = await api.classroomTeacher(msg, history);
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full gap-6 py-12">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Bot size={32} className="text-cyan-400" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold mb-1">Your AI Teacher is ready!</h2>
              <p className="text-sm text-muted-foreground">Ask any question — I'll teach you step by step.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-xs px-4 py-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 transition-all hover:border-cyan-500/40">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mt-1">
                  <Bot size={14} className="text-cyan-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card border border-border/50 text-foreground rounded-bl-sm"
              }`}>
                {m.role === "assistant"
                  ? <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>pre]:text-xs">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  : m.content}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mt-1">
                  <User size={14} className="text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
            <div className="w-8 h-8 shrink-0 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Bot size={14} className="text-cyan-400" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{ y: [0,-6,0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-card/30">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="p-2.5 rounded-xl border border-border/50 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground transition-all">
              <Trash2 size={16} />
            </button>
          )}
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask your AI teacher anything..."
              rows={1}
              className="w-full resize-none bg-card border border-border/50 rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all max-h-32"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black transition-all shadow-lg shadow-cyan-500/20"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
