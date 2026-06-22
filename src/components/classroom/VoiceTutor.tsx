import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Loader2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

type Message = { role: "user" | "assistant"; content: string };

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceTutor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setTranscript(t);
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => { setRecording(false); setError("Microphone access denied or not available."); };
    recognitionRef.current = recognition;
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const startRecording = () => {
    setError(""); setTranscript("");
    recognitionRef.current?.start();
    setRecording(true);
  };

  const stopAndSend = async () => {
    recognitionRef.current?.stop();
    setRecording(false);
    if (!transcript.trim()) return;
    const userText = transcript;
    setTranscript("");
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);
    try {
      const data = await api.classroomVoiceTutor(userText, history);
      const aiText = data.response;
      setMessages(prev => [...prev, { role: "assistant", content: aiText }]);
      // Speak the response
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiText);
        utterance.rate = 0.95; utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
              <Mic size={36} className="text-pink-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold mb-1">Voice Tutor</h2>
              <p className="text-sm text-muted-foreground max-w-xs">Press & hold the mic button to ask a question. Your AI tutor will speak the answer back to you.</p>
            </div>
            {!supported && (
              <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                ⚠️ Speech recognition is not supported in this browser. Try Chrome or Edge.
              </div>
            )}
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-pink-500 text-white rounded-br-sm"
                  : "bg-card border border-border/50 text-foreground rounded-bl-sm"
              }`}>
                {m.content}
                {m.role === "assistant" && (
                  <button onClick={() => {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(m.content);
                    u.rate = 0.95; window.speechSynthesis.speak(u);
                  }} className="ml-2 inline-flex items-center text-pink-400 hover:text-pink-300 transition-colors">
                    <Volume2 size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-pink-400"
                  animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Transcript preview */}
      {transcript && (
        <div className="mx-6 mb-2 px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-sm text-pink-200 italic">
          "{transcript}"
        </div>
      )}
      {error && <p className="mx-6 mb-2 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>}

      {/* Controls */}
      <div className="p-6 border-t border-border/50 flex items-center justify-center gap-6">
        {messages.length > 0 && (
          <button onClick={() => { setMessages([]); window.speechSynthesis.cancel(); }}
            className="p-3 rounded-xl border border-border/50 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground transition-all">
            <Trash2 size={18} />
          </button>
        )}
        <motion.button
          onPointerDown={supported ? startRecording : undefined}
          onPointerUp={supported ? stopAndSend : undefined}
          disabled={loading || !supported}
          animate={recording ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-40 shadow-2xl ${
            recording
              ? "bg-rose-500 shadow-rose-500/40 border-4 border-rose-300"
              : "bg-pink-500 hover:bg-pink-400 shadow-pink-500/30"
          }`}
        >
          {recording ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-white" />}
          {recording && (
            <motion.div className="absolute inset-0 rounded-full border-2 border-rose-400"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }} />
          )}
        </motion.button>
        {loading && (
          <div className="p-3">
            <Loader2 size={20} className="animate-spin text-pink-400" />
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground pb-4">{recording ? "🔴 Recording... release to send" : "Press & hold mic to speak"}</p>
    </div>
  );
}
