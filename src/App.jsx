import React, { useMemo, useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from './components/Header'
import Slideshow from './components/Slideshow'
import SalonList from './components/SalonList'
import SalonDetail from './components/SalonDetail'
import Bookings from './components/Bookings'
import Favorites from './components/Favorites'
import Profile from './components/Profile'
import FAQ from './components/FAQ'
import Terms from './components/Terms'
import NavBar from './components/NavBar'
import ScrollToTop from './components/ScrollToTop'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import ForgotPassword from './components/ForgotPassword'
import { salonData, slideshowImages } from './data/salonData'
import { clearProfile } from './utils/profile'

export default function App(){
  const { t } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('trimtime_profile'))
  const [location, setLocation] = useState('Kaichar')
  const [favorites, setFavorites] = useState(new Set())
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all') // 'all' | 'top' | 'men' | 'women'
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // Force device/browser back button to always go to home ('/')
  useEffect(() => {
    function onPopState(e) {
      try {
        // debug log to help diagnose back behavior
        // eslint-disable-next-line no-console
        console.log('[App] popstate event, path=', window.location.pathname, 'event=', e)
        if (window.location.pathname !== '/') {
          // eslint-disable-next-line no-console
          console.log('[App] navigating to / from popstate')
          navigate('/', { replace: true })
        }
      } catch (err) {
        // ignore
      }
    }

    // Push a history state so that a subsequent back press triggers popstate
    try {
      window.history.pushState({ appBack: true }, '')
    } catch (err) {
      // ignore
    }

    window.addEventListener('popstate', onPopState)
    // For Cordova/Capacitor WebView on Android, also listen to 'backbutton'
    if (document && document.addEventListener) {
      document.addEventListener('backbutton', onPopState, false)
    }

    return () => {
      window.removeEventListener('popstate', onPopState)
      if (document && document.removeEventListener) {
        document.removeEventListener('backbutton', onPopState, false)
      }
    }
  }, [navigate])

  const salonsByLocation = useMemo(()=>salonData, [])

  function handleOpenSalon(salon){ navigate(`/salon/${salon.id}`) }
  function toggleFavorite(salon){ setFavorites(prev => { const copy = new Set(prev); copy.has(salon.id) ? copy.delete(salon.id) : copy.add(salon.id); return copy }) }
  function addBooking(booking){ setBookings(prev=>[...prev, booking]) }
  function cancelBooking(id){ setBookings(prev=>prev.filter(b=>b.id!==id)) }
  function submitFeedback(bookingId, feedback){
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, feedback } : b))
  }
  function callSalon(salonName){
    const all = Object.values(salonsByLocation).flat(); const s = all.find(x=>x.name===salonName)
    if(s && s.phone) window.open(`tel:${s.phone}`, '_self')
    else alert(t('auth.phoneNotAvailable', 'Phone number not available'))
  }
  function logout(){ try{ clearProfile() }catch(e){} setIsAuthenticated(false); navigate('/signin') }

  if(!isAuthenticated){
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto">
          <Routes>
            <Route path="/" element={<SignIn onLogin={()=>setIsAuthenticated(true)} />} />
            <Route path="/signup" element={<SignUp onLogin={()=>setIsAuthenticated(true)} />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="*" element={<SignIn onLogin={()=>setIsAuthenticated(true)} />} />
          </Routes>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
        <Header companyName={t('common.brand')} currentLocation={location} onLocationChange={setLocation} />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={(
            <>
              <Slideshow
                images={slideshowImages}
                height={'12rem'}
                defaultTitle={t('home.defaultTitle')}
                defaultSubtitle={t('home.defaultSubtitle')}
              />
              <div id="main-filters" className="px-4 py-4 bg-white border-b">
                <div className="flex space-x-2">
                  <button onClick={()=>setFilter('all')} className={`filter-btn px-4 py-2 rounded-full text-sm font-medium ${filter==='all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('filters.all')}</button>
                  <button onClick={()=>setFilter('top')} className={`filter-btn px-4 py-2 rounded-full text-sm font-medium ${filter==='top' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('filters.topRated')}</button>
                  <button onClick={()=>setFilter('men')} className={`filter-btn px-4 py-2 rounded-full text-sm font-medium ${filter==='men' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('filters.men')}</button>
                  <button onClick={()=>setFilter('women')} className={`filter-btn px-4 py-2 rounded-full text-sm font-medium ${filter==='women' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('filters.women')}</button>
                </div>
              </div>
              <SalonList
                salons={(() => {
                  const base = salonsByLocation[location] || []
                  let list = base
                  if(filter === 'top') list = list.filter(s => parseFloat(s.rating) > 4)
                  else if(filter === 'men') list = list.filter(s => (s.servicesList||[]).some(it => it.category === 'men' || it.category === 'unisex'))
                  else if(filter === 'women') list = list.filter(s => (s.servicesList||[]).some(it => it.category === 'women' || it.category === 'unisex'))
                  if(searchQuery && searchQuery.trim() !== ''){
                    const q = searchQuery.trim().toLowerCase()
                    list = list.filter(s => ((s.name || '').toLowerCase().includes(q) || (s.services || '').toLowerCase().includes(q) || (s.address || '').toLowerCase().includes(q)))
                  }
                  return list
                })()}
                onOpenSalon={handleOpenSalon}
                onBook={handleOpenSalon}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onSearch={(q)=>setSearchQuery(q)}
                searchQuery={searchQuery}
                quickBook={(booking)=>{ addBooking(booking); navigate('/bookings') }}
              />
            </>
          )} />
          <Route path="/salon/:salonId" element={<SalonDetail salonsByLocation={salonsByLocation} addBooking={addBooking} favorites={favorites} toggleFavorite={toggleFavorite} />} />
          <Route path="/bookings" element={<Bookings bookings={bookings} cancelBooking={cancelBooking} callSalon={callSalon} submitFeedback={submitFeedback} />} />
          <Route path="/favorites" element={<Favorites favorites={favorites} salonsByLocation={salonsByLocation} openSalon={(s)=>navigate(`/salon/${s.id}`)} toggleFavorite={toggleFavorite} />} />
          <Route path="/profile" element={<Profile onLogout={logout} />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
        <NavBar />
      </div>
    </div>
  )
}
