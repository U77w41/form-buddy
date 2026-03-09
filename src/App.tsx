import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PassportPhoto from "./pages/tools/PassportPhoto";
import SizeTargeter from "./pages/tools/SizeTargeter";
import BackgroundRemoval from "./pages/tools/BackgroundRemoval";
import FormatConverter from "./pages/tools/FormatConverter";
import CropRotate from "./pages/tools/CropRotate";
import ImageToPdf from "./pages/tools/ImageToPdf";
import PdfSplitter from "./pages/tools/PdfSplitter";
import PdfMerger from "./pages/tools/PdfMerger";
import PdfPageManager from "./pages/tools/PdfPageManager";
import PdfCompressor from "./pages/tools/PdfCompressor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/passport-photo" element={<PassportPhoto />} />
          <Route path="/size-targeter" element={<SizeTargeter />} />
          <Route path="/background-removal" element={<BackgroundRemoval />} />
          <Route path="/format-converter" element={<FormatConverter />} />
          <Route path="/crop-rotate" element={<CropRotate />} />
          <Route path="/image-to-pdf" element={<ImageToPdf />} />
          <Route path="/pdf-splitter" element={<PdfSplitter />} />
          <Route path="/pdf-merger" element={<PdfMerger />} />
          <Route path="/pdf-page-manager" element={<PdfPageManager />} />
          <Route path="/pdf-compressor" element={<PdfCompressor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
