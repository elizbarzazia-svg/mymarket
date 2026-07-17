'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import en from '../locales/en.json';
import ka from '../locales/ka.json';
type Lang = 'en' | 'ka';
const dictionaries: Record<Lang, any> = { en, ka };

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (path: string) => path,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Lang;
    if (savedLang) setLangState(savedLang);
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (path: string) => {
    return path.split('.').reduce((obj, key) => obj?.[key], dictionaries[lang]) || path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
// ... დანარჩენი კოდი (ის, რაც ადრე მოგეცი)