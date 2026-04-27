import { motion, AnimatePresence } from "motion/react";
import { Upload, FileUp, X, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useAudit } from "../../context/AuditContext";
import { uploadModel } from "../../api/fairnessApi";

export function UploadModelPanel() {
  const { setProject, setModelUploaded, addTimelineEvent } = useAudit();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".pkl") && !f.name.endsWith(".joblib")) {
      setError("Only .pkl or .joblib files are supported");
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await uploadModel(file);
      setProject(res.project_id, "model");
      setModelUploaded(true);
      setSuccess(true);
      addTimelineEvent({
        icon: "model",
        title: "Model uploaded",
        desc: `${file.name} → Project ${res.project_id}`,
        time: "Just now",
        color: "#a855f7",
      });
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-2xl p-8 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10">
              <Upload className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: 600 }} className="text-white">
                Upload Model
              </h2>
              <p style={{ fontFamily: "Inter", fontSize: 12 }} className="text-white/50">
                Upload a scikit-learn model (.pkl or .joblib)
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 600 }} className="text-white mb-2">
                  Model Uploaded Successfully!
                </h3>
                <p style={{ fontFamily: "Inter", fontSize: 13 }} className="text-white/60">
                  Now upload a dataset to run a fairness audit.
                </p>
              </motion.div>
            ) : (
              <motion.div key="upload">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => inputRef.current?.click()}
                  className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                    dragOver
                      ? "border-purple-400 bg-purple-500/10"
                      : file
                      ? "border-emerald-400/50 bg-emerald-500/5"
                      : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pkl,.joblib"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  />
                  <FileUp className={`w-10 h-10 mx-auto mb-4 ${file ? "text-emerald-400" : "text-white/30"}`} />
                  {file ? (
                    <>
                      <p style={{ fontFamily: "Inter", fontSize: 14 }} className="text-white">
                        {file.name}
                      </p>
                      <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/40 mt-1">
                        {(file.size / 1024).toFixed(1)} KB · Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontFamily: "Inter", fontSize: 14 }} className="text-white/70">
                        Drag & drop your model file here
                      </p>
                      <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/40 mt-1">
                        Supports .pkl and .joblib formats
                      </p>
                    </>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-400/20"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p style={{ fontFamily: "Inter", fontSize: 12 }} className="text-red-300">{error}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className={`mt-6 w-full py-3 rounded-xl text-white transition-all ${
                    file && !loading
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)]"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "Inter", fontSize: 14, fontWeight: 500 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                      />
                      Uploading...
                    </span>
                  ) : (
                    "Upload Model"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
