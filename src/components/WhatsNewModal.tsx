import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Map, Bot } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export function WhatsNewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const hasSeenWhatsNew = localStorage.getItem('hasSeenWhatsNew_v1');
    if (!hasSeenWhatsNew) {
      // Small delay to make it feel more natural on launch
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenWhatsNew_v1', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 py-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="relative pt-8 pb-4 px-6 text-center shrink-0">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
                >
                  <X size={20} />
                </button>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                  <Sparkles size={32} strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {t("What's New", "Có gì mới", "Ce este nou")}
                </h2>
                <p className="text-slate-500 text-sm">
                  {t("Check out the latest features designed to enhance your travel experience.", "Khám phá các tính năng mới nhất được thiết kế để nâng cao trải nghiệm du lịch của bạn.", "Consultați cele mai recente funcții concepute pentru a vă îmbunătăți experiența de călătorie.")}
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-4 flex flex-col gap-6 overflow-y-auto max-h-[50vh]">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1 w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base mb-1">
                      {t("AI Itinerary Planner", "Lên kế hoạch AI", "Planificator de itinerariu AI")}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t("Create personalized day-by-day travel plans in seconds using our smart AI assistant.", "Tạo kế hoạch du lịch chi tiết từng ngày trong vài giây với trợ lý AI thông minh.", "Creați planuri de călătorie personalizate zi de zi în câteva secunde folosind asistentul nostru inteligent AI.")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 mt-1 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Map size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base mb-1">
                      {t("New Local Experiences", "Trải nghiệm văn hóa mới", "Noi experiențe locale")}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t("Discover authentic local activities, from street food tours to cultural workshops.", "Khám phá các hoạt động địa phương chân thực, từ tour ẩm thực đường phố đến các lớp học văn hóa.", "Descoperiți activități locale autentice, de la tururi de street food la ateliere culturale.")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 shrink-0 border-t border-slate-100">
                <button
                  onClick={handleClose}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors"
                >
                  {t("Got it!", "Đã hiểu!", "Am înțeles!")}
                </button>
              </div>
            </motion.div>
          </div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
