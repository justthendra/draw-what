// context/LanguageContext.jsx - Draw What?! Language Provider
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, languages } from '../i18n/translations';

const LanguageContext = createContext();

// Default language
const DEFAULT_LANGUAGE = 'en';
const STORAGE_KEY = 'drawwhat_language';

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => {
        // Try to get from localStorage, fallback to browser language or default
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && translations[stored]) return stored;

            // Try browser language
            const browserLang = navigator.language?.split('-')[0];
            if (browserLang && translations[browserLang]) return browserLang;
        }
        return DEFAULT_LANGUAGE;
    });

    // Save to localStorage when language changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
    }, [language]);

    // Set language function
    const setLanguage = useCallback((lang) => {
        if (translations[lang]) {
            setLanguageState(lang);
        }
    }, []);

    // Translation function with nested key support (e.g., "features.teamwork")
    const t = useCallback((key, fallback) => {
        const keys = key.split('.');
        let result = translations[language];

        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                // Try English fallback
                let englishResult = translations['en'];
                for (const ek of keys) {
                    if (englishResult && typeof englishResult === 'object' && ek in englishResult) {
                        englishResult = englishResult[ek];
                    } else {
                        return fallback || key;
                    }
                }
                return englishResult || fallback || key;
            }
        }

        return result || fallback || key;
    }, [language]);

    const value = {
        language,
        setLanguage,
        t,
        languages,
        currentLanguage: languages.find(l => l.code === language) || languages[0]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

// Custom hook to use language context
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
