import React, { useEffect, useState } from 'react'
import { getProfile } from '../utils/profile'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDynamicLocalization } from '../utils/localize'

export default function SalonDetail({ salonsByLocation, addBooking, favorites, toggleFavorite }){
  const { salonId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { salonName, salonAddress, serviceName } = useDynamicLocalization()
  const [salon, setSalon] = useState(null)
  const [selected, setSelected] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('10:00')
  const [showPopup, setShowPopup] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [serviceFilter, setServiceFilter] = useState('all')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(()=>{
    // find salon across locations (defensive)
    const all = salonsByLocation && Object.values(salonsByLocation).flat ? Object.values(salonsByLocation).flat() : []
    const s = all.find(x=> x && `${x.id}` === `${salonId}`)
    setSalon(s)
    setSlideIndex(0)

    // load profile details into customer fields (booking will use profile automatically)
    try{
      const p = getProfile()
      if(p){
        setCustomerName(p.name || '')
        setCustomerPhone(p.phone || '')
      }
    }catch(e){}

    // dispatch nav toggle based on selected services
    const ev = new CustomEvent('toggleNav', { detail: { hidden: selected.length>0 } })
    window.dispatchEvent(ev)
    return ()=> window.dispatchEvent(new CustomEvent('toggleNav', { detail: { hidden: false } }))
  },[salonId, salonsByLocation, selected.length])

  // Auto-advance slides when salon's detail images are available
  useEffect(() => {
    if (!salon) return
    const imgs = (salon.detailImages && salon.detailImages.length>0) ? salon.detailImages : (salon.image ? [{ url: salon.image }] : [])
    if (!imgs || imgs.length <= 1) {
      // ensure index stays at 0 when no auto-advance needed
      setSlideIndex(0)
      return
    }

    const id = setInterval(() => {
      setSlideIndex(i => (i + 1) % imgs.length)
    }, 4000)

    return () => clearInterval(id)
  }, [salon])

  if(!salon) return <div className="p-4">{t('salonDetail.notFound', 'Salon not found')}</div>

  function toggleService(service){
    setSelected(prev=>{
      const exists = prev.find(s=>s.name===service.name)
      if(exists){
        return prev.filter(s=>s.name!==exists.name)
      } else {
        return [...prev, {...service}]
      }
    })
  }

  function openBooking(){
    if(selected.length===0) return
    setShowPopup(true)
  }

  function confirmBooking(){
    // booking uses profile details automatically; require profile name & phone
    if(isClosed){
      setError(t('salonDetail.closedBookingError', 'Cannot book: salon is currently closed'))
      return
    }
    const profile = getProfile()
    const name = (profile && profile.name) || customerName
    const phone = (profile && profile.phone) || customerPhone
    if(!name || !phone){
      setError('Please set your name and phone in your Profile before booking')
      return
    }
    const booking = {
      id: Date.now().toString(),
      salonName: salon.name,
      salonAddress: salon.address,
      salonId: salon.id,
      customerName: name,
      customerPhone: phone,
      date,
      time,
      services: selected.map(s => {
        const original = (salon.servicesList || []).find(o => o.name === s.name) || s
        return { ...s, index: (salon.servicesList || []).indexOf(original) }
      }),
      totalPrice: selected.reduce((s,a)=>s+a.price,0),
      status: 'upcoming',
      bookingDate: new Date().toISOString()
    }
    addBooking(booking)
    setShowPopup(false)
    setShowSuccess(true)
  }

  function closeSuccess(){
    setShowSuccess(false)
    navigate('/bookings')
  }

  function prevSlide(){
    const len = (salon?.detailImages?.length || 1)
    setSlideIndex(i => (i - 1 + len) % len)
  }

  function nextSlide(){
    const len = (salon?.detailImages?.length || 1)
    setSlideIndex(i => (i + 1) % len)
  }

  function setActiveServiceFilter(f){
    setServiceFilter(f)
  }

  function formatCategory(cat){
    if(!cat) return ''
    const c = cat.toString().toLowerCase()
    // normalize common variants to canonical keys
    let key = c
    if (c.includes('uni') || c.includes('both')) key = 'unisex'
    else if (c.includes('men') && !c.includes('women')) key = 'men'
    else if (c.includes('women') || c.includes('woman') || c.includes('lady')) key = 'women'
    // use translation key with fallback to original value
    return t(`categories.${key}`, cat)
  }

  function categoryColorClass(cat){
    if(!cat) return 'bg-gray-100 text-gray-700'
    const c = cat.toString().toLowerCase()
    if(c.includes('uni') || c.includes('both') || c === 'unisex') return 'bg-purple-100 text-purple-800'
    if(c.includes('men') && !c.includes('women')) return 'bg-blue-100 text-blue-800'
    if(c.includes('women') || c.includes('woman') || c.includes('lady')) return 'bg-pink-100 text-pink-800'
    return 'bg-gray-100 text-gray-700'
  }

  const isClosed = String(salon?.status || '').toLowerCase() === 'closed'

  const estimateText = isClosed ? t('salonDetail.peopleWaitingFallback') : (salon?.estimate ? (typeof salon.estimate === 'number' ? `${salon.estimate} ${t('salonDetail.min')}` : salon.estimate) : t('salonDetail.estimateFallback'))

  

  return (
    <div id="salon-detail" className={`px-4 py-4 ${selected.length>0 ? 'pb-20' : 'pb-4'}`}>
      {/* Back Button */}
      <div className="mb-4"><button onClick={()=>navigate(-1)} className="flex items-center text-blue-500 hover:text-blue-700">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        {t('common.back')}
      </button></div>

      {/* Detail Page Slideshow */}
      <div className="relative h-48 overflow-hidden bg-gray-200 rounded-lg mb-4">
        <div className="relative w-full h-full">
          {(salon.detailImages && salon.detailImages.length>0 ? salon.detailImages : [{url: salon.image}]).map((img, i)=> (
            <img key={i} src={img.url} alt={`${salon.name}-${i}`} className={`${i===slideIndex ? 'block' : 'hidden'} w-full h-full object-cover`} />
          ))}
        </div>
        <button onClick={prevSlide} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        </button>
        <button onClick={nextSlide} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        </button>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {(salon.detailImages && salon.detailImages.length>0 ? salon.detailImages : [{url: salon.image}]).map((_, i)=> (
            <button key={i} onClick={()=>setSlideIndex(i)} className={`${i===slideIndex ? 'w-3 h-3 bg-white' : 'w-2 h-2 bg-white bg-opacity-60'} rounded-full`} />
          ))}
        </div>
      </div>

      {/* Salon Name */}
  <h1 id="detail-salon-name" className="text-2xl font-bold text-gray-900 mb-2">{salonName(salon.id, salon.name)}</h1>
      {/* Address */}
  <p id="detail-salon-address" className="text-gray-600 mb-3">{salonAddress(salon.id, salon.address)}</p>

      {/* Rating and Maps Link */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button onClick={(e)=>{ e.stopPropagation(); navigate(`/salon/${salon.id}/ratings`) }} className="flex items-center bg-green-500 text-white px-2 py-1 rounded font-bold mr-2">
            <span id="detail-salon-rating">{salon.rating}</span> <span className="ml-1">★</span>
          </button>
          <button onClick={(e)=>{ e.stopPropagation(); navigate(`/salon/${salon.id}/ratings`) }} className="text-gray-600 text-sm">({salon.ratingCount || 0} {t('ratings.reviews', 'ratings')})</button>
        </div>
        <a id="maps-link-detail" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address || salon.name)}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg> View on Maps
        </a>
      </div>

      {/* Queue Information */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">{t('common.queueStatus')}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span id="detail-people-waiting" className="text-gray-700 font-medium">
              {(() => {
                if(isClosed) return t('salonDetail.peopleWaitingFallback')
                const raw = salon.waiting
                if(!raw) return t('salonDetail.peopleWaitingFallback')
                const m = String(raw).match(/\d+/)
                const count = m ? Number(m[0]) : raw
                return t('salonDetail.waiting', { count })
              })()}
            </span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" /></svg>
            <span id="detail-estimate-time" className="text-gray-700 font-medium">{estimateText}</span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">{t('common.contactInformation')}</h3>
        <div className="flex items-center mb-2">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
          <span id="detail-salon-phone" className="text-gray-700">{salon.phone || salon.contact || '+91 00000 00000'}</span>
        </div>
        <div className="flex items-center mb-3">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
          <span id="detail-salon-hours" className="text-gray-700">{salon.hours || '9:00 AM - 8:00 PM'}</span>
        </div>
        <button onClick={()=> window.location.href = `tel:${salon.phone || ''}`} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
          {t('common.callSalon')}
        </button>
      </div>

      {/* Customer Details removed — booking will use profile info automatically (kept server-side) */}

      {/* Date & Time Selection */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">{t('common.selectDateTime')}</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.date')}</label>
            <input type="date" id="appointment-date" value={date} onChange={e=>setDate(e.target.value)} className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.time')}</label>
            <select id="appointment-time" value={time} onChange={e=>setTime(e.target.value)} className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {(() => {
                const times = []
                const pad = (n)=> n.toString().padStart(2,'0')
                for(let h=9; h<=17; h++){
                  times.push(`${pad(h)}:00`)
                  times.push(`${pad(h)}:30`)
                }
                return times.map(t=> <option key={t} value={t}>{t}</option>)
              })()}
            </select>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="mb-2">
        <h3 className="font-semibold text-gray-900 mb-3">{t('common.selectServices')}</h3>
        <div className="flex space-x-2 mb-4">
          <button className={`service-filter-btn px-3 py-1.5 rounded-full text-sm font-medium ${serviceFilter==='all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={()=>setActiveServiceFilter('all')}>{t('filters.all')}</button>
          <button className={`service-filter-btn px-3 py-1.5 rounded-full text-sm font-medium ${serviceFilter==='unisex' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={()=>setActiveServiceFilter('unisex')}>{t('filters.unisex', 'Unisex')}</button>
          <button className={`service-filter-btn px-3 py-1.5 rounded-full text-sm font-medium ${serviceFilter==='men' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={()=>setActiveServiceFilter('men')}>{t('filters.men')}</button>
          <button className={`service-filter-btn px-3 py-1.5 rounded-full text-sm font-medium ${serviceFilter==='women' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`} onClick={()=>setActiveServiceFilter('women')}>{t('filters.women')}</button>
        </div>
        <div id="services-list" className="services-box services-scroll mt-1 border rounded bg-gray-50">
          <div className="space-y-3">
              {(salon.servicesList || []).filter(svc => {
                if(serviceFilter==='all') return true
                const g = (svc.gender || svc.type || '').toString().toLowerCase()
                if(serviceFilter==='unisex') return g.includes('uni') || g.includes('both') || g.includes('unisex')
                return g.includes(serviceFilter)
              }).map((service, idx)=> (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <input id={`svc-${idx}`} type="checkbox" className="mr-3" onChange={()=>toggleService(service)} checked={!!selected.find(s=>s.name===service.name)} disabled={isClosed} title={isClosed ? t('salonStatus.closed') : ''} />
                  <div>
                    <label htmlFor={`svc-${idx}`} className="font-medium flex items-center">
                      <span>{serviceName(service.name)}</span>
                      {formatCategory(service.category || service.gender) && (
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${categoryColorClass(service.category || service.gender)}`}>{formatCategory(service.category || service.gender)}</span>
                      )}
                    </label>
                    <div className="text-sm text-gray-600">{service.duration || ''}</div>
                  </div>
                </div>
                <div className="text-right font-semibold">₹{service.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Booking Bar (fixed, hidden by default) */}
  <div id="booking-bar" className={`${selected.length>0 ? 'fixed bottom-0 left-0 right-0 z-60' : 'hidden'} bg-transparent`}>
        <div className="max-w-md mx-auto bg-white border-t border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
            <div>
              <span id="selected-services-count" className="font-semibold text-gray-900">{t('common.servicesSelected', {count: selected.length})}</span>
              <p id="total-price" className="text-sm text-gray-600">{t('common.totalLabel')}: ₹{selected.reduce((s,a)=>s+a.price,0)}</p>
            </div>
            {isClosed ? (
              <div className="text-sm text-red-600 font-semibold">{t('salonDetail.closedBookingNotice', 'Salon is closed — booking unavailable')}</div>
            ) : (
              <button onClick={openBooking} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"> {t('common.bookAppointment')} </button>
            )}
          </div>
        </div>
      </div>

      {/* Booking Confirmation Popup */}
      {showPopup && (
        <div id="booking-popup" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('common.confirmYourAppointment')}</h3>
            {/* Name is collected in the Customer Details section above; no need to ask again here */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 id="popup-salon-name" className="font-semibold text-gray-900 mb-1">{salon.name}</h4>
              <p id="popup-salon-address" className="text-sm text-gray-600 mb-2">{salon.address}</p>
              <div className="text-sm text-gray-700 mb-2"><span id="popup-date-time">{date}, {time}</span></div>
              {/* customer name/phone intentionally not shown */}
              <div id="popup-services" className="text-sm text-gray-700 mb-2"><strong>{t('common.selectServices')}:</strong> {selected.map(s=>serviceName(s.name)).join(', ')}</div>
              <div className="text-sm font-semibold text-gray-900"><span id="popup-total">{t('common.totalLabel')}: ₹{selected.reduce((s,a)=>s+a.price,0)}</span></div>
            </div>
            <div className="flex space-x-3">
              <button onClick={()=>setShowPopup(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"> {t('common.cancel')} </button>
              <button onClick={confirmBooking} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium"> {t('buttons.confirmBooking')} </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Animation Popup */}
      {showSuccess && (
        <div id="success-popup" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-8 text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('bookings.bookingConfirmedTitle')}</h3>
              <p className="text-gray-600 mb-4">{t('bookings.bookingConfirmedDesc')}</p>
              <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                <p id="success-details">{t('bookings.bookingConfirmedFollowup')}</p>
              </div>
            </div>
            <button onClick={closeSuccess} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium"> {t('common.done')} </button>
          </div>
        </div>
      )}
    </div>
  )
}
