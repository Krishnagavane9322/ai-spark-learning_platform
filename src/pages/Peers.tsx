import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageCircle, UserPlus, Check, X, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Peers = () => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [connecting, setConnecting] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchPeers = async () => {
    try {
      const data = await api.getPeers();
      // Map backend 'connections' array to a simple boolean 'connected' for UI
      const enrichedPeers = data.map((p: any) => ({
        ...p,
        connected: user?.connections?.includes(p._id) || p.connections?.includes(user?._id)
      }));
      setPeers(enrichedPeers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeers();
    // Poll for new messages if chat is open
    const interval = setInterval(() => {
      if (chatOpen && selectedPeer) {
        loadMessages(selectedPeer._id, false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [chatOpen, selectedPeer]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (peerId: string, showLoader = true) => {
    if (showLoader) setLoadingMessages(true);
    try {
      const data = await api.getMessages(peerId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const filtered = peers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.skills?.some((s: any) => s.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleConnect = async (peerId: string) => {
    setConnecting(peerId);
    try {
      await api.connectPeer(peerId);
      setPeers(peers.map(p => p._id === peerId ? { ...p, connected: true } : p));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConnecting(null);
    }
  };

  const openChat = (peer: any) => {
    setSelectedPeer(peer);
    setChatOpen(true);
    loadMessages(peer._id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPeer) return;
    
    setSending(true);
    try {
      const msg = await api.sendMessage(selectedPeer._id, newMessage);
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
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
        <div className="grid lg:grid-cols-3 gap-6 relative">
          
          {/* Peers list */}
          <div className={`lg:col-span-2 ${chatOpen ? "hidden md:block" : "block"}`}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <h1 className="text-3xl font-display font-bold">Find <span className="gradient-text">Peers</span></h1>
              <p className="text-muted-foreground mt-1">Connect and collaborate with learners</p>
              <div className="relative mt-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or skill (e.g., Python, React)..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((peer, i) => (
                <motion.div key={peer._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="glass-card p-5 hover:neon-glow-cyan transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                        {peer.avatar || "👤"}
                      </div>
                      {peer.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-neon-green border-2 border-card" title="Online" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{peer.name}</h3>
                      <p className="text-xs text-muted-foreground">Level {peer.level || 1} · {(peer.xp || 0).toLocaleString()} XP</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {peer.skills?.slice(0, 4).map((s: any) => (
                          <span key={s.name} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                            {s.name}
                          </span>
                        ))}
                        {peer.skills?.length > 4 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            +{peer.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                    {peer.connected ? (
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-neon-green/10 text-neon-green text-sm font-medium" disabled>
                        <Check size={14} /> Connected
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(peer._id)}
                        disabled={connecting === peer._id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        <UserPlus size={14} /> {connecting === peer._id ? "..." : "Connect"}
                      </button>
                    )}
                    <button onClick={() => openChat(peer)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg glass text-sm font-medium hover:bg-glass-highlight/10 transition-colors">
                      <MessageCircle size={14} /> Message
                    </button>
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-2 text-center py-16 px-4 glass-card border-dashed">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="text-muted-foreground" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No peers found</h3>
                  <p className="text-sm text-muted-foreground">We couldn't find anyone matching your search criteria. Try a different skill.</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div 
                initial={{ opacity: 0, x: 20, md: { x: 0, scale: 0.95 } }} 
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, md: { scale: 0.95 } }}
                className="glass-card flex flex-col h-[600px] border-primary/20 shadow-lg shadow-primary/5 bg-card/95 backdrop-blur-xl absolute z-10 w-full lg:relative lg:w-auto"
              >
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                        {selectedPeer?.avatar || "👤"}
                      </div>
                      {selectedPeer?.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-green border-2 border-card" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{selectedPeer?.name || "Select a peer"}</p>
                      <p className="text-xs text-muted-foreground">{selectedPeer?.online ? <span className="text-neon-green">Online</span> : "Offline"}</p>
                    </div>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground transition-colors lg:hidden">
                    <X size={18} />
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-black/20">
                  {loadingMessages ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-3">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                        <MessageCircle size={24} className="text-primary/50" />
                      </div>
                      <p className="font-medium text-foreground mb-1">Say hello to {selectedPeer?.name.split(' ')[0]}!</p>
                      <p className="text-xs opacity-70">Send a message to start collaboration</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user?._id;
                      const showAvatar = !isMine && (idx === messages.length - 1 || messages[idx + 1]?.senderId === user?._id);
                      
                      return (
                        <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                          
                          {!isMine && (
                            <div className="w-6 shrink-0 flex items-end">
                              {showAvatar && (
                                <span className="text-lg leading-none">{selectedPeer?.avatar || "👤"}</span>
                              )}
                            </div>
                          )}

                          <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                            isMine 
                              ? "bg-primary text-primary-foreground rounded-br-sm" 
                              : "bg-muted text-foreground rounded-bl-sm"
                          }`}>
                            <p className="leading-snug break-words">{msg.text}</p>
                            <p className={`text-[9px] mt-1 text-right ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card/50">
                  <div className="relative flex items-center">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} 
                      placeholder={`Message ${selectedPeer?.name.split(' ')[0]}...`}
                      disabled={sending}
                      className="w-full pl-4 pr-12 py-3 rounded-full bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50" 
                    />
                    <button type="submit" disabled={sending || !newMessage.trim()}
                      className="absolute right-1.5 p-2 rounded-full bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all flex items-center justify-center">
                      {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} className="translate-x-[1px]" />}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            
            {/* Empty State placeholder for desktop when chat is closed */}
            {!chatOpen && (
              <div className="hidden lg:flex flex-col items-center justify-center h-[600px] glass-card border-dashed text-muted-foreground text-center px-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <MessageCircle size={28} className="text-primary/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Your Messages</h3>
                <p className="text-sm">Select a peer from the list to start chatting</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Peers;
