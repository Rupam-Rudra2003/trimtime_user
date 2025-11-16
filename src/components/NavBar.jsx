import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NavBar(){
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loc = useLocation()
  const [hidden, setHidden] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isHome = loc.pathname === '/'
  const isBookings = loc.pathname.startsWith('/bookings')
  const isFavorites = loc.pathname.startsWith('/favorites')
  const isProfile = loc.pathname.startsWith('/profile')

  useEffect(()=>{
    function onToggle(e){
      const h = !!(e && e.detail && e.detail.hidden)
      setHidden(h)
    }
    window.addEventListener('toggleNav', onToggle)
    // small mount delay so active icons animate from black -> sky on first render
    const t = setTimeout(()=> setMounted(true), 60)
    return ()=> { window.removeEventListener('toggleNav', onToggle); clearTimeout(t) }
  },[])

  if(hidden) return null

  return (
  <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex justify-around py-1">
        <button onClick={()=>navigate('/')} className={`nav-btn flex flex-col items-center py-3 px-4 ${mounted && isHome ? 'text-sky-500' : 'text-black'}`}>
          <div className="nav-icon-container">
            <svg className="w-6 h-6 mb-1 transition-colors duration-300 ease-in-out" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1v-8.5z" fill="#fff" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            <div className="nav-indicator"></div>
          </div>
          <span className="text-xs">{t('nav.home', 'Home')}</span>
        </button>

        <button onClick={()=>navigate('/bookings')} className={`nav-btn flex flex-col items-center py-3 px-4 ${mounted && isBookings ? 'text-sky-500' : 'text-black'}`}>
          <div className="nav-icon-container">
            <svg className="w-6 h-6 mb-1 transition-colors duration-300 ease-in-out" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" fill="#fff" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 2v4M8 2v4M7 11h10M7 15h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div className="nav-indicator"></div>
          </div>
          <span className="text-xs">{t('nav.bookings', 'Bookings')}</span>
        </button>

        <button onClick={()=>navigate('/favorites')} className={`nav-btn flex flex-col items-center py-3 px-4 ${mounted && isFavorites ? 'text-sky-500' : 'text-black'}`}>
          <div className="nav-icon-container">
            <svg className="w-6 h-6 mb-1 transition-colors duration-300 ease-in-out" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s-7.5-4.9-9.2-7.2C1.5 11.6 2 7.8 5.1 6.1 7 5 9.4 5.4 12 7.1c2.6-1.7 5-2.1 6.9-1 3.1 1.7 3.6 5.5 2.3 7.7C19.5 16.1 12 21 12 21z" fill="#fff" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <div className="nav-indicator"></div>
          </div>
          <span className="text-xs">{t('nav.favorites', 'Favorites')}</span>
        </button>

        <button onClick={()=>navigate('/profile')} className={`nav-btn flex flex-col items-center py-3 px-4 ${mounted && isProfile ? 'text-sky-500' : 'text-black'}`}>
          <div className="nav-icon-container">
            <svg className="w-6 h-6 mb-1 transition-colors duration-300 ease-in-out" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" fill="#fff" stroke="currentColor" strokeWidth="1.4" />
              <path d="M4 20a8 8 0 0116 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="nav-indicator"></div>
          </div>
          <span className="text-xs">{t('nav.profile', 'Profile')}</span>
        </button>
      </div>
    </nav>
  )
}
