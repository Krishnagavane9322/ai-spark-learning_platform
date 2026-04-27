import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Youtube, Mail, Map, BookOpen, Users, BrainCircuit, Globe } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  const links = {
    Platform: [
      { name: "My Courses", path: "/courses", icon: BookOpen },
      { name: "Projects", path: "/projects", icon: Globe },
      { name: "AI Classroom", path: "/ai-classroom", icon: BrainCircuit },
      { name: "Find Peers", path: "/peers", icon: Users },
    ],
    Resources: [
      { name: "Smart Notes", path: "/notes" },
      { name: "Learning Paths", path: "/ai-classroom" },
      { name: "Community", path: "/peers" },
      { name: "Help Center", path: "/support" },
    ],
    Legal: [
      { name: "Privacy Policy", path: "#" },
      { name: "Terms of Service", path: "#" },
      { name: "Cookie Policy", path: "#" },
    ],
  };

  return (
    <footer className="relative pt-20 pb-8 overflow-hidden bg-background">
      {/* Wave background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
      <svg className="absolute bottom-0 left-0 w-full opacity-5 pointer-events-none" viewBox="0 0 1440 200">
        <path
          d="M0,160L60,144C120,128,240,96,360,101.3C480,107,600,149,720,154.7C840,160,960,128,1080,112C1200,96,1320,96,1380,96L1440,96L1440,200L0,200Z"
          fill="hsl(186, 100%, 50%)"
        />
      </svg>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-2 pr-0 md:pr-12">
            <h3 className="font-display font-bold text-2xl gradient-text mb-4 tracking-tight">NeuralPath</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Empowering the future workforce with AI-driven, personalized education. Track your progress, build projects, and learn alongside a global community.
            </p>
            <div className="flex gap-4">
              {[Github, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all shadow-sm"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="font-semibold text-sm mb-4 text-foreground uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3">
              {links.Platform.map(item => (
                <li key={item.name}>
                  <Link to={item.path} onClick={() => window.scrollTo(0,0)} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                    <item.icon size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-semibold text-sm mb-4 text-foreground uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              {links.Resources.map(item => (
                <li key={item.name}>
                  <Link to={item.path} onClick={() => window.scrollTo(0,0)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-semibold text-sm mb-4 text-foreground uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {links.Legal.map(item => (
                <li key={item.name}>
                  <a href={item.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-primary/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Mail className="text-primary" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg text-foreground">Subscribe to NeuralPath Updates</h4>
              <p className="text-sm text-muted-foreground">Get the latest AI features and course announcements straight to your inbox.</p>
            </div>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-3 w-full md:w-auto">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 flex-1 md:w-72 transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2 shrink-0"
            >
              {subscribed ? "Subscribed ✓" : "Subscribe"}
            </button>
          </form>
        </motion.div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NeuralPath. All rights reserved.</p>
          <p>Built for the AI-first generation.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
