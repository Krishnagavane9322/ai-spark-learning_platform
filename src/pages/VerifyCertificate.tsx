import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, Download, Share2, ShieldCheck, ExternalLink, CheckCircle2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

const VerifyCertificate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shared, setShared] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      api.verifyCertificate(id)
        .then(data => {
          if (!data) { setError(true); }
          else { setCert(data); }
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    } else {
      setError(true);
      setLoading(false);
    }
  }, [id]);

  const handlePrint = () => window.print();

  const handleShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`🎓 I just earned a certificate for "${cert?.courseTitle}" on NeuralPath! Verify it here:`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, "_blank");
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Verifying certificate…</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-12 container mx-auto px-4 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card p-10 text-center border border-destructive/30"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <Award size={32} className="text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-destructive mb-3">Certificate Not Found</h1>
            <p className="text-muted-foreground mb-2">
              The certificate ID <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{id}</span> could not be verified.
            </p>
            <p className="text-muted-foreground text-sm mb-8">It may be invalid, expired, or not yet issued.</p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all"
            >
              <ArrowLeft size={16} /> Go to Homepage
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.href)}&color=06b6d4&bgcolor=0f172a&qzone=1`;
  const issueDate = new Date(cert.issuedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const score = cert.score != null ? cert.score : null;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Print-only styles */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          #cert-page-wrapper { padding: 0 !important; display: block !important; }
          #printable-cert {
            width: 100vw !important; height: 100vh !important;
            margin: 0 !important; border-radius: 0 !important;
            box-shadow: none !important; position: fixed !important;
            top: 0; left: 0; z-index: 9999;
          }
          .cert-border { border-color: #d97706 !important; }
          .cert-name { color: #06b6d4 !important; }
          .cert-id { color: #06b6d4 !important; }
        }
      `}</style>

      <Navbar />

      <div id="cert-page-wrapper" className="pt-24 pb-12 container mx-auto px-4 max-w-5xl">

        {/* Verified badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="no-print flex items-center justify-center gap-2 mb-8"
        >
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-2 rounded-full text-sm font-bold">
            <ShieldCheck size={16} />
            ✓ This certificate has been verified as authentic
          </div>
        </motion.div>

        {/* Certificate Card */}
        <motion.div
          ref={certRef}
          id="printable-cert"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(6,182,212,0.05) 50%, rgba(245,158,11,0.08) 100%)",
            border: "1px solid rgba(245,158,11,0.25)"
          }}
        >
          {/* Shimmer top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-primary to-amber-400" />

          <div className="cert-border border-[10px] border-double border-amber-500/20 m-3 rounded-xl p-10 md:p-16 relative overflow-hidden">

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
              <Award size={520} className="text-amber-400" />
            </div>

            {/* Corner ornaments */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500/40 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500/40 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500/40 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500/40 rounded-br-lg" />

            <div className="relative z-10 text-center">
              {/* Logo / Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Award size={44} className="text-amber-400" />
                </div>
              </div>

              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-bold mb-3">NeuralPath · AI-Powered Learning Platform</p>
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight mb-2">
                CERTIFICATE OF COMPLETION
              </h1>
              <div className="flex justify-center mb-8">
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              </div>

              <p className="text-muted-foreground text-base mb-4 italic font-serif">This is to certify that</p>

              <h2 className="cert-name text-4xl md:text-6xl font-display font-black text-primary mb-2 leading-tight">
                {cert.userName}
              </h2>
              <div className="flex justify-center mb-8">
                <div className="h-px w-48 bg-primary/30" />
              </div>

              <p className="text-muted-foreground text-base italic font-serif mb-2">has successfully completed</p>
              <h3 className="text-xl md:text-3xl font-bold text-foreground mb-12">{cert.courseTitle}</h3>

              {/* Footer row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-border/30 mt-6 items-end">
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5">Issue Date</p>
                  <p className="font-semibold text-sm">{issueDate}</p>
                </div>

                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5">
                    {score != null ? "Final Score" : "Status"}
                  </p>
                  <p className="font-black text-primary text-sm">
                    {score != null ? `${score}%` : "Completed ✓"}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-white p-1.5 rounded-lg shadow-inner border border-border/20 mb-1.5">
                    <img src={qrUrl} alt="QR Verify" className="w-16 h-16" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Scan to Verify</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5">Certificate ID</p>
                  <p className="cert-id font-mono text-[10px] font-bold text-primary break-all">{cert.certificateId}</p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="no-print mt-8 flex flex-wrap gap-3 justify-center"
        >
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:brightness-110 hover:scale-105 transition-all active:scale-95"
          >
            <Download size={18} /> Download / Print PDF
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-[#0077b5] text-white px-7 py-3 rounded-full font-bold shadow-lg shadow-[#0077b5]/20 hover:brightness-110 hover:scale-105 transition-all active:scale-95"
          >
            <ExternalLink size={18} />
            {shared ? "Opening LinkedIn…" : "Share on LinkedIn"}
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-muted text-foreground px-7 py-3 rounded-full font-bold hover:bg-muted/80 hover:scale-105 transition-all active:scale-95"
          >
            {shared ? <CheckCircle2 size={18} className="text-green-500" /> : <Share2 size={18} />}
            {shared ? "Link Copied!" : "Copy Verify Link"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-7 py-3 rounded-full font-bold border border-border hover:bg-muted transition-all"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </motion.div>

        {/* Verification details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="no-print mt-8 max-w-lg mx-auto glass-card p-5 rounded-xl border border-green-500/20"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-green-400 mb-1">Verified Credential</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This certificate is cryptographically signed and issued by NeuralPath. The Certificate ID{" "}
                <span className="font-mono text-primary font-bold">{cert.certificateId}</span>{" "}
                is unique and tamper-proof. Anyone can verify its authenticity using this page.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default VerifyCertificate;
