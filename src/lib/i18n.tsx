import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi' | 'ro';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  cycleLang: () => void;
  getLangLabel: () => string;
  t: (en: string, vi: string, ro?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('language', newLang);
  };

  const cycleLang = () => {
    setLang(lang === 'en' ? 'vi' : lang === 'vi' ? 'ro' : 'en');
  };

  const getLangLabel = () => {
    if (lang === 'en') return 'EN';
    if (lang === 'vi') return 'VI';
    return 'RO';
  };

  const t = (en: string, vi: string, ro?: string) => {
    if (lang === 'vi') return vi;
    if (lang === 'ro') return ro || en;
    return en;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, cycleLang, getLangLabel, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
