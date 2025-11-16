import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../i18n'

export default function Header({ companyName, currentLocation, onLocationChange }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [openLang, setOpenLang] = useState(false)
  const ref = useRef(null)
  const location = useLocation()
  const isHome = String(location.pathname || '/') === '/'

  useEffect(()=>{
    function handleClick(e){
      if(ref.current && !ref.current.contains(e.target)){
        setOpen(false)
        setOpenLang(false)
      }
    }
    document.addEventListener('click', handleClick)
    return ()=>document.removeEventListener('click', handleClick)
  },[])

  const locations = ['Kaichar','Khirogram','Mathrun','Khudrun','Singot','Itta','Nigan']

  function handleSelect(loc){
    if(onLocationChange) onLocationChange(loc)
    setOpen(false)
  }
  // Only render header on home page. This removes the small white header bar from other routes.
  if(!isHome) return null

  return (
    <header id="main-header" className="bg-white px-4 py-2 shadow-sm">
      <div className="flex justify-between items-center">
        {isHome ? (
          <>
            <h1 id="company-name" className="text-2xl font-bold text-gray-800">{companyName || t('common.brand')}</h1>
            <div className="flex items-center space-x-3 relative" ref={ref}>
              {/* Language dropdown */}
              <div className="relative">
                <button onClick={()=>setOpenLang(v=>!v)} className="flex items-center space-x-1 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <span className="text-sm font-medium text-gray-700">{(i18n?.language || 'en').toUpperCase()}</span>
                  <svg className={`w-3 h-3 text-gray-600 transform transition-transform ${openLang? 'rotate-180':''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </button>
                {openLang && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md z-40">
                    <button onClick={()=>{ changeLanguage('en'); setOpenLang(false) }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">{t('common.language.english') || 'English'}</button>
                    <button onClick={()=>{ changeLanguage('bn'); setOpenLang(false) }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">{t('common.language.bengali') || 'বাংলা'}</button>
                    <button onClick={()=>{ changeLanguage('hi'); setOpenLang(false) }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">{t('common.language.hindi') || 'हिन्दी'}</button>
                  </div>
                )}
              </div>

              {/* Location selector */}
              <div className="relative">
                <button onClick={()=>setOpen(o=>!o)} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                  <span id="current-location" className="text-sm font-medium text-gray-700">{t(`locations.${String(currentLocation).toLowerCase()}`, currentLocation)}</span>
                  <svg className={`w-4 h-4 text-gray-600 transform transition-transform ${open? 'rotate-180':''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md z-40">
                    {locations.map(loc => (
                      <button key={loc} onClick={()=>handleSelect(loc)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">{t(`locations.${String(loc).toLowerCase()}`, loc)}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // minimal header on other pages (no company name or location selector)
          <div className="w-full" />
        )}
      </div>
    </header>
  )
}
