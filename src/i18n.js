import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import bn from './locales/bn/translation.json'
import hi from './locales/hi/translation.json'

// Load saved language or default to English
const savedLang = typeof window !== 'undefined' ? (localStorage.getItem('trimtime_lang') || 'en') : 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
      hi: { translation: hi }
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    returnObjects: true
  })

export function changeLanguage(lng){
  i18n.changeLanguage(lng)
  try{ localStorage.setItem('trimtime_lang', lng) }catch(e){}
}

export default i18n
