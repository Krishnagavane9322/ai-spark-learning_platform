import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Save, CreditCard, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useEffect } from "react";

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifications, setNotifications] = useState(user?.settings?.notifications ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(user?.settings?.weeklyDigest ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [passwordData, setPasswordData] = useState({ current: "", new: "" });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.updateProfile({ name, email });
      await api.updateNotifications({ notifications, weeklyDigest });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordMsg("");
    try {
      await api.changePassword(passwordData.current, passwordData.new);
      setPasswordMsg("Password changed successfully!");
      setPasswordData({ current: "", new: "" });
    } catch (err: any) {
      setPasswordMsg(err.message || "Failed to change password");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold">
            <span className="gradient-text">Settings</span>
          </h1>
        </motion.div>

        <div className="space-y-6">
          {/* Profile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-4"><User size={18} className="text-primary" /> Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">{user?.avatar || "👨‍💻"}</div>
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Level {user?.level || 1} · {(user?.xp || 0).toLocaleString()} XP</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-4"><Bell size={18} className="text-primary" /> Notifications</h2>
            <div className="space-y-3">
              {[
                { label: "Push Notifications", value: notifications, setter: setNotifications },
                { label: "Weekly Digest", value: weeklyDigest, setter: setWeeklyDigest },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  <button onClick={() => item.setter(!item.value)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${item.value ? "bg-primary" : "bg-muted"}`}>
                    <motion.div animate={{ x: item.value ? 20 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Account */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-4"><Shield size={18} className="text-primary" /> Change Password</h2>
            <div className="space-y-3">
              <input type="password" placeholder="Current password" value={passwordData.current}
                onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input type="password" placeholder="New password (min 6 characters)" value={passwordData.new}
                onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button onClick={handlePasswordChange}
                className="px-4 py-2 rounded-lg glass text-sm hover:bg-glass-highlight/10 transition-colors">
                Update Password
              </button>
              {passwordMsg && <p className={`text-sm ${passwordMsg.includes("success") ? "text-neon-green" : "text-destructive"}`}>{passwordMsg}</p>}
            </div>
          </motion.div>

          {/* Billing & Transactions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <h2 className="font-display font-semibold flex items-center gap-2 mb-4"><CreditCard size={18} className="text-primary" /> Billing & Transactions</h2>
            <div className="space-y-4">
              {loadingTransactions ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tx.courseId?.image || "📚"}</span>
                        <div>
                          <p className="text-sm font-medium">{tx.courseTitle || tx.courseId?.title}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()} • {tx.paymentId ? "ID: " + tx.paymentId.slice(-8) : "Pending"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-neon-violet">₹{tx.amount}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          tx.status === "completed" ? "bg-neon-green/10 text-neon-green" : 
                          tx.status === "failed" ? "bg-destructive/10 text-destructive" : 
                          "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No transactions found.</p>
                  <p className="text-xs mt-1">Enroll in a paid course to see it here.</p>
                </div>
              )}
            </div>
          </motion.div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Save size={18} /> {saved ? "Saved ✓" : saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
