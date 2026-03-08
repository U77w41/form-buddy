import { useState, useCallback, useRef } from "react";
import Layout from "@/components/Layout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const BG_COLORS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Light Blue", value: "#D6EAF8" },
  { label: "Red", value: "#E74C3C" },
  { label: "Transparent", value: "transparent" },
];

const BackgroundRemoval = () => {
  const [file, setFile] = useState<File | null>(null);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
  }, []);

  const process = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress("Loading AI model (first time may take ~30s)...");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      setProgress("Removing background...");
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (total > 0) setProgress(`${key}: ${Math.round((current / total) * 100)}%`);
        },
      });

      // Apply background color
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.src = url;
      await new Promise((res) => (img.onload = res));

      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;

      if (bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const format = bgColor === "transparent" ? "image/png" : "image/jpeg";
      setResult(canvas.toDataURL(format, 0.92));
    } catch (e) {
      console.error(e);
      setProgress("Error processing image. Try a different photo.");
    } finally {
      setProcessing(false);
    }
  }, [file, bgColor]);

  const download = useCallback(() => {
    if (!result) return;
    const ext = bgColor === "transparent" ? "png" : "jpg";
    const a = document.createElement("a");
    a.href = result;
    a.download = `bg-removed.${ext}`;
    a.click();
  }, [result, bgColor]);

  return (
    <Layout title="Background Remover" description="AI-powered background removal — runs entirely in your browser.">
      <div className="mx-auto max-w-2xl space-y-6">
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Upload your photo"
          sublabel="Works best with portraits & product shots"
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setResult(null); }}
        />

        {file && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Background Color</label>
              <div className="flex gap-3">
                {BG_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => { setBgColor(c.value); setResult(null); }}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      bgColor === c.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-border"
                      style={{ background: c.value === "transparent" ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px" : c.value }}
                    />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={process} disabled={processing} className="w-full gap-2">
              {processing && <Loader2 className="h-4 w-4 animate-spin" />}
              {processing ? progress : "Remove Background"}
            </Button>
          </motion.div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border p-4" style={{ background: bgColor === "transparent" ? "repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 50% / 16px 16px" : bgColor }}>
              <img src={result} alt="Result" className="mx-auto max-h-80 rounded-lg" />
            </div>
            <Button onClick={download} className="w-full gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default BackgroundRemoval;
