import ko from './ko.json';
import en from './en.json';
import vi from './vi.json';

const translations = {
    ko,
    en,
    vi
};

let currentLanguage = 'ko'; // Default language

export function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
}

export function getTranslator() {
    const lang = translations[currentLanguage] || translations.ko;
    return (key) => lang[key] || key;
}

export function getLanguage() {
    return currentLanguage;
}

export function initI18n() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    }
}