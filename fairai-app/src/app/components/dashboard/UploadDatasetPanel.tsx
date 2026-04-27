import { motion, AnimatePresence } from "motion/react";
import { Database, FileUp, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useAudit } from "../../context/AuditContext";
import { uploadDataset } from "../../api/fairnessApi";

export function UploadDatasetPanel() {
  const { projectId, setDatasetInfo, addTimelineEvent } = useAudit();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".csv") && !f.name.endsWith(".parquet")) {
      setError("Only .csv or .parquet files are supported");
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file || !projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await uploadDataset(projectId, file);
      setDatasetInfo(res);
      setColumns(res.columns);
      setRows(res.rows);
      setSuccess(true);
      addTimelineEvent({
        icon: "dataset",
        title: "Dataset uploaded",
        desc: `${file.name} · ${res.rows.toLocaleString()} rows · ${res.columns.length} columns`,
        time: "Just now",
        color: "#3b82f6",
      });
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="rounded-2xl p-8 bg-white/[0.03] backdrop-blur-2xl border border-white/10 text-center">
          <Database className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 600 }} className="text-white/60">
            Upload a model first
          </h2>
          <p style={{ fontFamily: "Inter", fontSize: 13 }} className="text-white/40 mt-2">
            You need to upload a model before uploading a dataset.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-2xl p-8 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden relative">
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-white/10">
              <Database className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 style={{ fontFamily: "Space Grotesk", fontSize: 20, fontWeight: 600 }} className="text-white">
                Upload Dataset
              </h2>
              <p style={{ fontFamily: "Inter", fontSize: 12 }} className="text-white/50">
                Upload a CSV or Parquet file with test data
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8"
              >
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 600 }} className="text-white text-center mb-4">
                  Dataset Uploaded — {rows.toLocaleString()} rows
                </h3>
                <div className="max-h-48 overflow-y-auto rounded-xl bg-black/30 border border-white/10 p-4">
                  <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/40 mb-2 uppercase tracking-wider">
                    Columns ({columns.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {columns.map((col) => (
                      <span
                        key={col}
                        className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/70"
                        style={{ fontFamily: "Inter", fontSize: 11 }}
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
                <p style={{ fontFamily: "Inter", fontSize: 12 }} className="text-white/50 text-center mt-4">
                  Now go to "Run Audit" to configure and launch the analysis.
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
                      ? "border-blue-400 bg-blue-500/10"
                      : file
                      ? "border-emerald-400/50 bg-emerald-500/5"
                      : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.parquet"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  />
                  <FileUp className={`w-10 h-10 mx-auto mb-4 ${file ? "text-emerald-400" : "text-white/30"}`} />
                  {file ? (
                    <>
                      <p style={{ fontFamily: "Inter", fontSize: 14 }} className="text-white">{file.name}</p>
                      <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/40 mt-1">
                        {(file.size / 1024).toFixed(1)} KB · Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontFamily: "Inter", fontSize: 14 }} className="text-white/70">Drag & drop your dataset here</p>
                      <p style={{ fontFamily: "Inter", fontSize: 11 }} className="text-white/40 mt-1">Supports .csv and .parquet</p>
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
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_0_25px_rgba(59,130,246,0.45)] hover:shadow-[0_0_35px_rgba(59,130,246,0.7)]"
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
                    "Upload Dataset"
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
