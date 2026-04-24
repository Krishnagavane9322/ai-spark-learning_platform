import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Image as ImageIcon, Trash2, Maximize2, Minimize2, Mic, MicOff, Volume2, VolumeX, Sparkles, Bot, User, Loader2, Paperclip } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  role: "user" | "model";
  content: string;
  timestamp?: Date;
}

const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchHistory = async () => {
    try {
      const history = await api.getChatHistory();
      setMessages(history);
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !image) || isLoading) return;

    const userMessage = input.trim() || "Analyzed an image";
    const currentImage = image;

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setImage(null);
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(userMessage, currentImage || undefined);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your chat history?")) return;
    try {
      await api.clearChatHistory();
      setMessages([]);
      toast.success("Chat history cleared");
    } catch (err) {
      toast.error("Failed to clear history");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice Recognition (Speech to Text)
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + " " + transcript);
    };
    recognition.start();
  };

  // Text to Speech
  const speak = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? "auto" : "550px",
              width: "380px" 
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 glass-card overflow-hidden flex flex-col shadow-2xl border-primary/20 neon-glow-cyan"
          >
            {/* Header */}
            <div className="p-4 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot size={18} className="text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1">
                    Neural AI <Sparkles size={12} className="text-neon-cyan" />
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/5 rounded-md transition-colors"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button 
                  onClick={handleClearHistory}
                  className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-muted-foreground hover:text-red-400"
                  title="Clear History"
                >
                  <Trash2 size={14} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/5 rounded-md transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages List */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20"
                >
                  {messages.length === 0 && !isLoading && (
                    <div className="text-center py-12 px-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={32} className="text-primary/50" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ask me anything about your courses, projects, or general learning!
                      </p>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`flex items-center gap-1.5 mb-0.5 text-[10px] text-muted-foreground`}>
                          {msg.role === "model" ? (
                            <><Bot size={10} className="text-primary" /> Neural Assistant</>
                          ) : (
                            <>{user.name} <User size={10} /></>
                          )}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10" 
                            : "bg-white/5 border border-white/10 rounded-tl-none"
                        }`}>
                          {msg.content}
                        </div>
                        {msg.role === "model" && (
                          <button 
                            onClick={() => speak(msg.content)}
                            className="p-1 text-muted-foreground hover:text-primary transition-colors mt-0.5"
                          >
                            {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/20 border-t border-white/10">
                  {image && (
                    <div className="mb-2 relative inline-block">
                      <img src={image} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-primary/30" />
                      <button 
                        onClick={() => setImage(null)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-0.5 text-white shadow-lg"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-white/5 rounded-full text-muted-foreground hover:text-primary transition-all"
                    >
                      <Paperclip size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    
                    <div className="flex-1 relative">
                      <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask anything..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-4 pr-10 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                      />
                      <button 
                        onClick={startListening}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isListening ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-primary"}`}
                      >
                        {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                      </button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={isLoading || (!input.trim() && !image)}
                      className="p-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </motion.button>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <p className="text-[9px] text-muted-foreground/60 flex items-center gap-1">
                      Powered by Gemini 1.5 Flash <Bot size={8} />
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-primary neon-glow-cyan"
        }`}
      >
        {isOpen ? <X className="text-white" size={24} /> : <MessageSquare className="text-primary-foreground" size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse" />
        )}
      </motion.button>
    </div>
  );
};

export default AIChatbot;
