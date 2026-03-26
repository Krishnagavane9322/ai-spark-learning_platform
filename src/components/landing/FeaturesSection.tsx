import { motion } from "framer-motion";
import { Map, Brain, Users, Briefcase, Code, BarChart3 } from "lucide-react";

const features = [
  { id: 1, title: "AI Roadmaps", description: "Personalized learning paths powered by AI that adapt to your pace", icon: "Map" },
  { id: 2, title: "Smart Notes", description: "Convert handwritten notes to digital flashcards and mind maps", icon: "Brain" },
  { id: 3, title: "Peer Learning", description: "Connect with learners worldwide and grow together", icon: "Users" },
  { id: 4, title: "Portfolio Builder", description: "Auto-generate stunning portfolios from your projects", icon: "Briefcase" },
  { id: 5, title: "Live Projects", description: "Build real-world projects with guided mentorship", icon: "Code" },
  { id: 6, title: "Skill Analytics", description: "Track your growth with detailed skill heatmaps", icon: "BarChart3" },
];

const iconMap: Record<string, React.ReactNode> = {
  Map: <Map size={28} />,
  Brain: <Brain size={28} />,
  Users: <Users size={28} />,
  Briefcase: <Briefcase size={28} />,
  Code: <Code size={28} />,
  BarChart3: <BarChart3 size={28} />,
};

const FeaturesSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Why Choose <span className="gradient-text">NeuralPath</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to accelerate your learning journey
          </p>
        </motion.div>

        {/* Scrolling features */}
        <div className="relative">
          <div className="flex gap-6 overflow-hidden">
            <motion.div
              animate={{ x: [0, -1200] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex gap-6 shrink-0"
            >
              {[...features, ...features].map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="glass-card p-6 w-72 shrink-0 group cursor-pointer hover:neon-glow-cyan transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    {iconMap[feature.icon]}
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
