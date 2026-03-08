import { useState, useRef, useCallback } from "react";
import Layout from "@/components/Layout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { motion } from "framer-motion";

const PRESETS = [
  { label: "2×2 in (US)", w: 600, h: 600 },
  { label: "3.5×4.5 cm (EU)", w: 413, h: 531 },
  { label: "35×45 mm (India)", w: 413, h: 531 },
  { label: "2×2.5 in", w: 600, h: 750 },
];

const PassportPhoto = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState(PRESETS[0]);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
  }, []);

  const process = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise((res) => (img.onload = res));

      const canvas = canvasRef.current!;
      canvas.width = preset.w;
      canvas.height = preset.h;
      const ctx = canvas.getContext("2d")!;

      // Center-crop to fill
      const srcRatio = img.width / img.height;
      const dstRatio = preset.w / preset.h;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (srcRatio > dstRatio) {
        sw = img.height * dstRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / dstRatio;
        sy = (img.height - sh) / 2;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, preset.w, preset.h);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, preset.w, preset.h);
      URL.revokeObjectURL(url);

      setResult(canvas.toDataURL("image/jpeg", 0.92));
    } finally {
      setProcessing(false);
    }
  }, [file, preset]);

  const download = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `passport-photo-${preset.w}x${preset.h}.jpg`;
    a.click();
  }, [result, preset]);

  return (
    <Layout title="Passport Photo Builder" description="Automatically crop and format photos to standard passport dimensions.">
      <div className="mx-auto max-w-2xl space-y-6">
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Upload your photo"
          sublabel="JPG, PNG or WebP"
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setResult(null); }}
        />

        {file && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Passport Size Preset</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setPreset(p); setResult(null); }}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      preset.label === p.label
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={process} disabled={processing} className="w-full">
              {processing ? "Processing..." : "Generate Passport Photo"}
            </Button>
          </motion.div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border bg-muted/30 p-4">
              <img src={result} alt="Result" className="mx-auto max-h-80 rounded-lg" />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {preset.w}×{preset.h}px — {preset.label}
              </p>
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

export default PassportPhoto;
