import { motion } from "framer-motion";
import ToolCard from "@/components/ToolCard";
import Layout from "@/components/Layout";
import {
  Camera,
  Maximize,
  Eraser,
  RefreshCw,
  Crop,
  FileImage,
  Scissors,
  Merge,
  LayoutList,
  FileDown,
} from "lucide-react";

const tools = [
  {
    title: "Passport Photo Builder",
    description: "Auto-crop to standard passport dimensions. 2×2\", 3.5×4.5cm, and more.",
    icon: Camera,
    href: "/passport-photo",
    badge: "Photo",
    badgeClass: "tool-badge-photo",
  },
  {
    title: "Exact Size & KB Targeter",
    description: "Resize to exact pixel dimensions and compress under a strict KB limit.",
    icon: Maximize,
    href: "/size-targeter",
    badge: "Photo",
    badgeClass: "tool-badge-photo",
  },
  {
    title: "Background Remover",
    description: "Remove backgrounds and replace with solid colors — all in your browser.",
    icon: Eraser,
    href: "/background-removal",
    badge: "Photo",
    badgeClass: "tool-badge-photo",
  },
  {
    title: "Format Converter",
    description: "Convert images between JPG, PNG, and WebP instantly.",
    icon: RefreshCw,
    href: "/format-converter",
    badge: "Convert",
    badgeClass: "tool-badge-convert",
  },
  {
    title: "Crop & Rotate",
    description: "Freehand cropping, fixed aspect ratios, and rotation tools.",
    icon: Crop,
    href: "/crop-rotate",
    badge: "Photo",
    badgeClass: "tool-badge-photo",
  },
  {
    title: "Image to PDF",
    description: "Convert scanned images into a single PDF document.",
    icon: FileImage,
    href: "/image-to-pdf",
    badge: "PDF",
    badgeClass: "tool-badge-pdf",
  },
  {
    title: "PDF Splitter",
    description: "Extract specific pages or split PDFs into individual files.",
    icon: Scissors,
    href: "/pdf-splitter",
    badge: "PDF",
    badgeClass: "tool-badge-pdf",
  },
  {
    title: "PDF Merger",
    description: "Combine multiple PDFs into one single document.",
    icon: Merge,
    href: "/pdf-merger",
    badge: "PDF",
    badgeClass: "tool-badge-pdf",
  },
  {
    title: "PDF Page Manager",
    description: "View, delete, and rearrange pages visually before exporting.",
    icon: LayoutList,
    href: "/pdf-page-manager",
    badge: "PDF",
    badgeClass: "tool-badge-pdf",
  },
  {
    title: "PDF Compressor",
    description: "Reduce PDF file size to meet upload limits.",
    icon: FileDown,
    href: "/pdf-compressor",
    badge: "PDF",
    badgeClass: "tool-badge-pdf",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <div className="mb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          The Ultimate{" "}
          <span className="text-gradient-primary">Form Fill-Up</span>{" "}
          Utility
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
        >
          Resize photos, remove backgrounds, merge PDFs — everything you need to
          conquer government and exam portal uploads. 100% in your browser.
        </motion.p>
      </div>

      {/* Photo Tools */}
      <section className="mb-10">
        <h2 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Photo & Signature Tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.slice(0, 5).map((tool, i) => (
            <ToolCard key={tool.href} {...tool} index={i} />
          ))}
        </div>
      </section>

      {/* PDF Tools */}
      <section>
        <h2 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          PDF Mastery Center
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.slice(5).map((tool, i) => (
            <ToolCard key={tool.href} {...tool} index={i} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
