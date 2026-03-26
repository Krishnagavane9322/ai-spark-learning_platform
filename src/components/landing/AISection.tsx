import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const codeLines = [
  "const ai = new NeuralPath();",
  "ai.analyzeLearner(profile);",
  "const path = ai.generateRoadmap();",
  "path.stages.forEach(stage => {",
  "  learner.unlock(stage);",
  "  ai.trackProgress(stage);",
  "});",
  "ai.adaptDifficulty(score);",
  "const insights = ai.getInsights();",
  "dashboard.render(insights);",
];

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const chars = "01アイウエオカキクケコ";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(7, 10, 19, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "hsla(186, 100%, 50%, 0.3)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />;
};

const AISection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <MatrixRain />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              <span className="gradient-text">AI That Learns</span> How You Learn
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Our AI analyzes your learning patterns, strengths, and weaknesses to create a roadmap that adapts in real-time. No two learning paths are the same.
            </p>
            <div className="space-y-4">
              {["Adaptive difficulty adjustment", "Real-time progress tracking", "Personalized recommendations", "Smart scheduling"].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-primary neon-glow-cyan" />
                  <span className="text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Floating terminal */}
            <div className="glass-card p-6 neon-glow-cyan">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-neon-cyan/40" />
                <div className="w-3 h-3 rounded-full bg-neon-green/40" />
                <span className="text-xs text-muted-foreground ml-2">neural-path.ai</span>
              </div>
              <div className="font-mono text-sm space-y-1">
                {codeLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="text-muted-foreground"
                  >
                    <span className="text-primary/40 mr-3">{i + 1}</span>
                    <span className="text-neon-cyan/80">{line}</span>
                  </motion.div>
                ))}
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-primary"
                >
                  █
                </motion.div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 glass-card p-3 neon-glow-violet"
            >
              <span className="text-sm font-semibold text-neon-violet">AI Active ✨</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
