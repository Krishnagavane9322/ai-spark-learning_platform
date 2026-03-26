import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Users } from "lucide-react";
import { api } from "@/lib/api";

const CoursesSection = () => {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    api.getCourses().then(setCourses).catch(console.error);
  }, []);

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Popular <span className="gradient-text">Courses</span>
          </h2>
          <p className="text-muted-foreground text-lg">Curated paths to master in-demand skills</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, rotateY: 2, rotateX: 2 }}
              className="glass-card overflow-hidden group cursor-pointer hover:neon-glow-cyan transition-shadow duration-500"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                <span className="text-6xl">{course.image}</span>
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.price === 0 
                      ? "bg-neon-green/20 text-neon-green" 
                      : "bg-neon-violet/20 text-neon-violet"
                  }`}>
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{course.category}</span>
                  <span className="text-xs text-muted-foreground">{course.level}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-3 group-hover:text-primary transition-colors">{course.title}</h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Clock size={14} /> {course.duration}</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {course.students.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-neon-cyan"><Star size={14} fill="currentColor" /> {course.rating}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {course.tags.map((tag: string) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;

