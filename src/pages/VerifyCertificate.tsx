import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, Download, Share2, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

const VerifyCertificate = () => {
  const { id } = useParams<{ id: string }>();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.verifyCertificate(id)
        .then(setCert)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>;
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container mx-auto px-4">
          <div className="max-w-md mx-auto glass-card p-8 border-destructive/20">
            <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Certificate</h1>
            <p className="text-muted-foreground mb-6">The certificate ID provided could not be verified in our records.</p>
            <button onClick={() => window.location.href = "/"} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Go to Homepage</button>
          </div>
        </div>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.href}`;

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      <div className="pt-32 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <ShieldCheck className="text-green-500" size={24} />
            <h2 className="text-xl font-bold text-green-500 uppercase tracking-widest text-sm">Official Verified Credential</h2>
          </div>

          <div className="glass-card p-1 md:p-2 bg-gradient-to-br from-amber-500/20 via-primary/10 to-amber-500/20 shadow-2xl overflow-hidden relative">
            <div className="bg-card border-8 border-double border-amber-500/30 p-8 md:p-16 relative overflow-hidden text-center">
              
              {/* Background watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <Award size={600} className="text-amber-500" />
              </div>

              <div className="relative z-10">
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Award size={48} />
                  </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">CERTIFICATE OF COMPLETION</h1>
                <p className="text-muted-foreground text-lg mb-8 italic font-serif">This is to officially certify that</p>
                
                <h2 className="text-4xl md:text-6xl font-display font-bold text-primary mb-8 underline decoration-primary/20 underline-offset-8">
                  {cert.userName}
                </h2>

                <p className="text-muted-foreground text-lg mb-4 italic font-serif">has successfully completed the course</p>
                <h3 className="text-2xl md:text-3xl font-bold mb-12">{cert.courseTitle}</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mt-12 pt-12 border-t border-border/40">
                  <div className="text-left">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Issue Date</p>
                    <p className="font-semibold text-sm">{new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  
                  <div className="text-left">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Score</p>
                    <p className="font-bold text-primary text-sm">{cert.score}% Grade</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="p-1.5 bg-white rounded-lg shadow-inner mb-2 border border-border/20">
                      <img src={qrUrl} alt="QR Verification" className="w-16 h-16" />
                    </div>
                    <p className="text-[9px] text-muted-foreground font-bold tracking-tighter uppercase">Verified</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Certificate ID</p>
                    <p className="font-mono text-[10px] font-bold text-primary">{cert.certificateId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-4 justify-center">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
              <Download size={20} /> Print / Save PDF
            </button>
            <button className="flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-3 rounded-full font-bold shadow-lg shadow-secondary/20 hover:scale-105 transition-transform active:scale-95">
              <Share2 size={20} /> Share to LinkedIn
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
