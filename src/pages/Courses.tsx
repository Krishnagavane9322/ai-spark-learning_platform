import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Users, Play, X, Filter, CreditCard, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    api.getCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    filter === "all" ? true : filter === "free" ? c.price === 0 : c.price > 0
  );

  const handleFreeEnroll = async (courseId: string) => {
    setEnrolling(true);
    try {
      await api.enrollCourse(courseId);
      await refreshUser();
      setCourses(courses.map(c => c._id === courseId ? { ...c, students: c.students + 1 } : c));
      setSelectedCourse(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaidEnroll = async (course: any) => {
    setEnrolling(true);
    try {
      // Step 1: Create Razorpay order on backend
      const orderData = await api.createPaymentOrder(course._id);

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NeuralPath",
        description: `Enroll in ${orderData.courseTitle}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#00e5ff",
          backdrop_color: "rgba(0, 0, 0, 0.9)",
        },
        handler: async function (response: any) {
          // Step 3: Verify payment on backend
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
            });

            await refreshUser();
            setCourses(prev =>
              prev.map(c => c._id === course._id ? { ...c, students: c.students + 1 } : c)
            );
            setPaymentSuccess(true);
            setTimeout(() => {
              setPaymentSuccess(false);
              setSelectedCourse(null);
            }, 3000);
          } catch (err: any) {
            alert("Payment verification failed: " + err.message);
          }
        },
        modal: {
          ondismiss: function () {
            setEnrolling(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
        setEnrolling(false);
      });
      rzp.open();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = (courseId: string) => {
    return user?.enrolledCourses?.some((c: any) => (c._id || c) === courseId);
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">My <span className="gradient-text">Courses</span></h1>
            <p className="text-muted-foreground mt-1">Browse and continue learning</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            {(["all", "free", "paid"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-all ${filter === f ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <motion.div key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => { setSelectedCourse(course); setPaymentSuccess(false); }}
              className="glass-card overflow-hidden cursor-pointer hover:neon-glow-cyan transition-shadow">
              <div className="h-36 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                <span className="text-5xl">{course.image}</span>
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${course.price === 0 ? "bg-neon-green/20 text-neon-green" : "bg-neon-violet/20 text-neon-violet"}`}>
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </span>
                {isEnrolled(course._id) && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                    Enrolled
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">{course.title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {course.students.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-neon-cyan"><Star size={12} fill="currentColor" /> {course.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Course Detail Modal */}
        <AnimatePresence>
          {selectedCourse && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
              onClick={() => setSelectedCourse(null)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-lg w-full neon-glow-cyan" onClick={e => e.stopPropagation()}>

                {/* Payment Success */}
                {paymentSuccess ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                      className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 size={32} className="text-neon-green" />
                    </motion.div>
                    <h3 className="font-display font-bold text-lg mb-2">Payment Successful! 🎉</h3>
                    <p className="text-sm text-muted-foreground">You're enrolled in {selectedCourse.title}</p>
                    <p className="text-xs text-neon-cyan mt-2">+100 XP earned!</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-4xl">{selectedCourse.image}</span>
                      <button onClick={() => setSelectedCourse(null)}><X size={20} className="text-muted-foreground" /></button>
                    </div>
                    <h2 className="font-display text-xl font-bold mb-2">{selectedCourse.title}</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedCourse.tags?.map((t: string) => <span key={t} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">{t}</span>)}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                      <span>{selectedCourse.modules} modules</span>
                      <span>{selectedCourse.duration}</span>
                      <span>{selectedCourse.level}</span>
                    </div>

                    {selectedCourse.price > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-neon-violet/10 border border-neon-violet/20 mb-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Course Price</span>
                          <p className="text-[10px] text-muted-foreground/60">Powered by Razorpay • UPI, Cards, NetBanking</p>
                        </div>
                        <span className="text-2xl font-bold text-neon-violet">${selectedCourse.price}</span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {isEnrolled(selectedCourse._id) ? (
                        <button className="flex-1 py-3 rounded-lg bg-neon-green/20 text-neon-green font-semibold flex items-center justify-center gap-2" disabled>
                          ✓ Already Enrolled
                        </button>
                      ) : selectedCourse.price > 0 ? (
                        <button
                          onClick={() => handlePaidEnroll(selectedCourse)}
                          disabled={enrolling}
                          className="flex-1 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          <CreditCard size={18} />
                          {enrolling ? "Opening Razorpay..." : `Pay ₹${Math.round(selectedCourse.price * 83)} & Enroll`}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFreeEnroll(selectedCourse._id)}
                          disabled={enrolling}
                          className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          <Play size={18} /> {enrolling ? "Enrolling..." : "Enroll Free"}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Courses;
