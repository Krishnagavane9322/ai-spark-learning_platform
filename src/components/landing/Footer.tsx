import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Youtube, Mail } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  const links = {
    Product: ["Courses", "Projects", "AI Roadmaps", "Pricing"],
    Company: ["About", "Careers", "Blog", "Press"],
    Resources: ["Documentation", "Community", "Support", "FAQ"],
    Legal: ["Privacy", "Terms", "Cookies", "Licenses"],
  };

  return (
    <footer className="relative pt-20 pb-8 overflow-hidden">
      {/* Wave background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <svg className="absolute bottom-0 left-0 w-full opacity-5" viewBox="0 0 1440 200">
        <path
          d="M0,160L60,144C120,128,240,96,360,101.3C480,107,600,149,720,154.7C840,160,960,128,1080,112C1200,96,1320,96,1380,96L1440,96L1440,200L0,200Z"
          fill="hsl(186, 100%, 50%)"
        />
      </svg>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-display font-bold text-xl gradient-text mb-4">NeuralPath</h3>
            <p className="text-sm text-muted-foreground mb-4">AI-powered learning for the future workforce.</p>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.2, y: -2 }}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-primary hover:neon-glow-cyan transition-all"
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Mail className="text-primary" size={24} />
            <div>
              <h4 className="font-semibold">Stay updated</h4>
              <p className="text-sm text-muted-foreground">Get the latest courses and AI features</p>
            </div>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1 md:w-64"
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all"
            >
              {subscribed ? "Subscribed ✓" : "Subscribe"}
            </button>
          </form>
        </motion.div>

        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2026 NeuralPath. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
