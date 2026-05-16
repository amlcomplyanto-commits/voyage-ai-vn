import React, { useRef, useState, useEffect } from 'react';
import { Camera, FileText, Upload, Plus, AlertCircle, X, Trash2, Mail, Download } from 'lucide-react';
import { storage, VaultFile } from '../lib/storage';
import { askTravelAssistant } from '../lib/gemini';
import Markdown from 'react-markdown';
import { useI18n } from '../lib/i18n';

export function VaultContent() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const [showTextFile, setShowTextFile] = useState<VaultFile | null>(null);

  useEffect(() => {
    const existingFiles = storage.getVaultFiles();
    if (existingFiles.length === 0) {
      const firstTimerGuide: VaultFile = {
        id: 'guide_' + Date.now().toString(),
        name: 'Vietnam First-Timer Guide',
        type: 'text/markdown',
        uri: `# Welcome to Vietnam! 🇻🇳\n\n**Quick Tips:**\n- **Crossing the street:** Be predictable, walk slowly, don't step back.\n- **Drinking water:** Stick to bottled water. Ice in major cities is safe if it has a hole in the middle (machine made).\n- **Money:** 100,000 VND is roughly $4 USD. Always count the zeros!\n- **Sim Card:** Get a Viettel or Vinaphone SIM at the airport for cheap data.\n- **Transport:** Use reputable ride-hailing apps. Add your credit card. Avoid hopping into strange taxis without a meter.`,
        createdAt: new Date().toISOString()
      };
      storage.saveVaultFiles([firstTimerGuide]);
      setFiles([firstTimerGuide]);
    } else {
      setFiles(existingFiles);
    }
  }, []);

  const handleDeleteFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFiles = files.filter(f => f.id !== id);
    storage.saveVaultFiles(newFiles);
    setFiles(newFiles);
  };

  const handleDownloadFile = (e: React.MouseEvent, f: VaultFile) => {
    e.stopPropagation();
    if (f.type === 'text/markdown') {
      const blob = new Blob([f.uri], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${f.name.replace(/[\s\W]+/g, '_')}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const link = document.createElement('a');
      link.href = f.uri;
      const ext = f.type.split('/')[1] || 'png';
      link.download = `${f.name.replace(/[\s\W]+/g, '_')}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEmailFile = (e: React.MouseEvent, f: VaultFile) => {
    e.stopPropagation();
    
    if (f.type === 'text/markdown') {
      const subject = encodeURIComponent(f.name);
      const body = encodeURIComponent(f.uri);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else {
      if (navigator.share) {
        fetch(f.uri)
          .then(res => res.blob())
          .then(blob => {
            const ext = f.type.split('/')[1] || 'png';
            const file = new File([blob], `${f.name}.${ext}`, { type: f.type });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              navigator.share({
                files: [file],
                title: f.name,
              });
            } else {
              window.location.href = `mailto:?subject=${encodeURIComponent(f.name)}&body=${encodeURIComponent('Please find the attached document.')}`;
              alert(t('Your device does not support file attachments directly via email in the browser. Please save the file and attach it manually.', '', ''));
            }
          });
      } else {
        window.location.href = `mailto:?subject=${encodeURIComponent(f.name)}&body=${encodeURIComponent('Please find the attached document.')}`;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image to scan for now.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      // Save locally
      const newFile: VaultFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        uri: base64, // Storing base64 for MVP app simplicity locally
        createdAt: new Date().toISOString()
      };
      
      const newFiles = [...files, newFile];
      storage.saveVaultFiles(newFiles);
      setFiles(newFiles);

      // Trigger AI OCR
      analyzeImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Full: string, mimeType: string) => {
    setLoading(true);
    setIsScanning(true);
    // Remove data uri prefix
    const base64Data = base64Full.split(',')[1];
    
    try {
      const resp = await askTravelAssistant(
        "Analyze this image. If it is a menu, receipt, or sign, extract the text and explain briefly what it means. IMPORTANT: If any prices or totals are listed in a currency other than Vietnamese Dong (VND), you MUST automatically convert them to VND based on the current approximate exchange rate and show both the original and converted prices clearly. If it's a document/ticket, extract key details. If it's a landmark, identify it.",
        {
          imageBase64: base64Data,
          imageMime: mimeType
        }
      );
      setScanResult(resp);
    } catch (e) {
      setScanResult("Could not analyze image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative min-h-0">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-slate-900">{t('Document Vault', 'Két tài liệu', 'Seif Documente')}</h2>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-brand-50 text-brand-600 p-2 rounded-full"
        >
          <Plus size={20} />
        </button>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-5xl mx-auto w-full">
        
        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 text-brand-500 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Camera size={32} strokeWidth={1.5} />
            <span className="text-sm font-bold text-slate-900">{t("Scan via AI", "Quét bằng AI", "Scanează cu AI")}</span>
          </button>
          
          <button 
            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 text-blue-500 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Upload size={32} strokeWidth={1.5} />
            <span className="text-sm font-bold text-slate-900">{t("Upload PDF", "Tải lên PDF", "Încarcă PDF")}</span>
          </button>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-4">{t("Saved Documents", "Tài liệu đã lưu", "Documente Salvate")}</h2>
        
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm">
              {t("Your vault is empty. Upload tickets, menus, or receipts to keep them handy and let AI extract info.", "Két của bạn trống. Tải lên vé, thực đơn, hoặc biên lai để giữ tiện lơi và cho phép AI lấy thông tin.", "Seiful tău este gol. Încarcă bilete, meniuri sau chitanțe pentru a le avea la îndemână și lasă AI-ul să extragă informații.")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map(f => (
              <div key={f.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer" onClick={() => f.type === 'text/markdown' ? setShowTextFile(f) : analyzeImage(f.uri, f.type)}>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 w-12 h-12 rounded-xl border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {f.type.startsWith('image') ? (
                       <img src={f.uri} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                       <FileText className="text-slate-400" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{f.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(f.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDownloadFile(e, f)}
                    className="p-2 text-slate-300 hover:text-brand-500 hover:bg-brand-50 rounded-full transition-colors shrink-0"
                    title={t("Download document", "Tải xuống tài liệu", "Descarcă document")}
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={(e) => handleEmailFile(e, f)}
                    className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors shrink-0"
                    title={t("Email document", "Gửi email tài liệu", "Trimite document pe email")}
                  >
                    <Mail size={18} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteFile(e, f.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                    title={t("Delete document", "Xóa tài liệu", "Șterge document")}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* AI Scan Overlay */}
      {isScanning && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold flex items-center gap-2 text-slate-900">
                <AlertCircle size={18} className="text-brand-500" /> AI Vision Analysis
              </h3>
              <button onClick={() => setIsScanning(false)} className="text-slate-400 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto w-full">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                  <p className="text-sm text-slate-500">Analyzing image contents...</p>
                </div>
              ) : (
                <div className="markdown-body prose prose-sm prose-slate max-w-none">
                  {scanResult ? <Markdown>{scanResult}</Markdown> : "No result"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Text File View Overlay */}
      {showTextFile && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold flex items-center gap-2 text-slate-900 truncate pr-4">
                <FileText size={18} className="text-brand-500" /> {showTextFile.name}
              </h3>
              <button onClick={() => setShowTextFile(null)} className="text-slate-400 p-1 shrink-0">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto w-full">
              <div className="markdown-body prose prose-sm prose-slate max-w-none">
                <Markdown>{showTextFile.uri}</Markdown>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export function VaultPage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 pt-safe font-sans relative">
      <VaultContent />
    </div>
  );
}
