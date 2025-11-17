import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDynamicLocalization } from '../utils/localize'

export default function Bookings({ bookings = [], cancelBooking, callSalon, submitFeedback }){
  const {t} = useTranslation()
  const { salonName, salonAddress, serviceName } = useDynamicLocalization()
  const navigate = useNavigate()
  function goBackToHome(){ navigate('/') }
  const [filter, setFilter] = React.useState('all') // all | upcoming | completed
  const [bookingToCancel, setBookingToCancel] = React.useState(null)
  const confirmBtnRef = React.useRef(null)
  const modalRef = React.useRef(null)
  const reasonSelectRef = React.useRef(null)
  const otherReasonRef = React.useRef(null)
  const [cancelReason, setCancelReason] = React.useState('')
  const [otherReason, setOtherReason] = React.useState('')
  const CANCEL_REASONS = [
    t('bookings.cancelReason.changeOfPlans', 'Change of plans'),
    t('bookings.cancelReason.foundAnother', 'Found another salon'),
    t('bookings.cancelReason.schedulingConflict', 'Scheduling conflict'),
    t('bookings.cancelReason.priceIssue', 'Price issue'),
    t('bookings.cancelReason.other', 'Other')
  ]
  const OTHER_REASON_LABEL = t('bookings.cancelReason.other', 'Other')

  // feedback state per booking (not persisted beyond App unless submitFeedback is provided)
  const [feedbackState, setFeedbackState] = React.useState({})

  function initFeedbackFor(id){
    setFeedbackState(s => ({...s, [id]: s[id] || { rating: 0, comment: '', images: [], saving: false, saved: false } }))
  }

  function handleStarClick(id, value){
    initFeedbackFor(id)
    setFeedbackState(s => ({...s, [id]: {...s[id], rating: value}}))
  }

  function handleCommentChange(id, val){
    initFeedbackFor(id)
    setFeedbackState(s => ({...s, [id]: {...s[id], comment: val}}))
  }

  function handleImageChange(id, files){
    initFeedbackFor(id)
    const fileList = Array.from(files || [])
    const readers = fileList.map(f => new Promise((res)=>{ const r = new FileReader(); r.onload = ()=>res(r.result); r.readAsDataURL(f) }))
    Promise.all(readers).then(dataUrls => {
      setFeedbackState(s => ({...s, [id]: {...s[id], images: (s[id]?.images||[]).concat(dataUrls)}}))
    }).catch(()=>{})
  }

  async function handleSubmit(id){
    const st = feedbackState[id] || {rating:0, comment:'', images:[]}
    if(!st || !st.rating) return
    setFeedbackState(s => ({...s, [id]: {...s[id], saving: true}}))
    try{
      if(typeof submitFeedback === 'function'){
        submitFeedback(id, { rating: st.rating, comment: st.comment, images: st.images })
      }
      setFeedbackState(s => ({...s, [id]: {...s[id], saving: false, saved: true}}))
      // show a brief saved state then keep it
      setTimeout(()=>{
        setFeedbackState(s => ({...s, [id]: {...s[id], saved: true}}))
      }, 300)
    }catch(e){
      setFeedbackState(s => ({...s, [id]: {...s[id], saving: false}}))
    }
  }

  React.useEffect(()=>{
    const prev = document.body.style.overflow
    function onKeyDown(e){
      if(!bookingToCancel) return
      if(e.key === 'Tab'){
        const modal = modalRef.current
        if(!modal) return
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if(!focusable.length) return
        const first = focusable[0]; const last = focusable[focusable.length-1]
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus() }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus() }
      }
    }
    function onFocusIn(e){ if(bookingToCancel){ const modal = modalRef.current; if(modal && !modal.contains(e.target)){ e.preventDefault(); try{ confirmBtnRef.current && confirmBtnRef.current.focus() }catch(ex){} } } }
    if(bookingToCancel){
      document.body.style.overflow = 'hidden'
      setTimeout(()=>{
        try{
          if(reasonSelectRef.current) reasonSelectRef.current.focus()
          else if(otherReasonRef.current) otherReasonRef.current.focus()
          else { confirmBtnRef.current && confirmBtnRef.current.focus() }
        }catch(e){}
      }, 0)
      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('focusin', onFocusIn)
    } else { document.body.style.overflow = prev || '' }
    return ()=>{ document.body.style.overflow = prev || ''; document.removeEventListener('keydown', onKeyDown); document.removeEventListener('focusin', onFocusIn) }
  }, [bookingToCancel])
    // services are always visible now — no expand/collapse state needed

  // sort bookings by recency (use bookingDate if available, otherwise date)
  const getBookingTime = (b) => {
    try{
      const d = b?.bookingDate || b?.date || null
      const t = d ? new Date(d).getTime() : 0
      return isNaN(t) ? 0 : t
    }catch(e){ return 0 }
  }
  const sortedBookings = Array.isArray(bookings) ? [...bookings].sort((a,b) => getBookingTime(b) - getBookingTime(a)) : []

  const upcoming = sortedBookings.filter(b => String(b.status || '').toLowerCase() === 'upcoming')
  const completed = sortedBookings.filter(b => String(b.status || '').toLowerCase() === 'completed')

  function formatDay(dateStr){
    try{
      const d = new Date(dateStr)
      if(isNaN(d)) return ''
      return d.toLocaleDateString(undefined, { weekday: 'short' }) // Mon, Tue...
    }catch(e){
      return ''
    }
  }

  function formatFullDate(dateStr){
    try{
      const d = new Date(dateStr)
      if(isNaN(d)) return dateStr || ''
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })
    }catch(e){
      return dateStr || ''
    }
  }

  function renderBooking(b){
    const isCompleted = String(b.status || '').toLowerCase() === 'completed'
    return (
      <div key={b.id} className={`rounded-lg shadow-sm border px-4 py-3 relative ${isCompleted ? '' : 'bg-white'}`}>
        <div className="mb-1 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{b.salonId ? salonName(b.salonId, b.salonName) : b.salonName}</h3>
            <p className="text-sm text-gray-600 mt-1">{b.salonId ? salonAddress(b.salonId, b.salonAddress) : b.salonAddress}</p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <span className={`text-sm font-medium capitalize px-3 py-1 rounded ${String(b.status || '').toLowerCase() === 'upcoming' ? 'bg-green-100 text-green-700' : (isCompleted ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700')}`}>{b.status}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="inline-flex items-center font-medium">
            <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M16 2v4M8 2v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span>{formatFullDate(b.date)}</span>
          </div>
          <div className="inline-flex items-center font-medium">
            <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-medium mr-2">{b.time}</span>
          </div>
        </div>

        {b.services && b.services.length > 0 && (
          <div className="services-box services-scroll mt-3 border rounded bg-gray-50">
            {b.services.map((svc, idx) => {
              const cat = String(svc.category || '').toLowerCase()
              const tagClass = cat === 'men' ? 'tag--men' : (cat === 'women' ? 'tag--women' : 'tag--unisex')
              const label = svc.category ? String(svc.category).charAt(0).toUpperCase() + String(svc.category).slice(1) : ''
              return (
                <div key={idx} className="flex items-center justify-between py-1 px-2 border-b last:border-b-0">
                  <div className="flex items-center">
                    <div className="text-sm font-medium">{serviceName(svc.name)}</div>
                    {label && (
                      <span className={`ml-3 text-xs font-semibold px-2 py-0.5 rounded-full ${tagClass}`}>{label}</span>
                    )}
                    <div className="text-sm text-gray-600 ml-3">{svc.duration}</div>
                  </div>
                  <div className="font-semibold text-sm">₹{svc.price}</div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="text-sm">
            <span className="mr-2">{(b.services && b.services.length) || 0} {(b.services && b.services.length) === 1 ? t('common.service', 'service') : t('common.services', 'services')}</span>
            <span className="font-semibold">₹{b.totalPrice ?? 0}</span>
          </div>
          <div className="flex items-center space-x-3">
            {String(b.status || '').toLowerCase() === 'upcoming' && (<button onClick={(e)=>{ e.stopPropagation(); setBookingToCancel(b) }} className="text-red-500">{t('bookings.cancel')}</button>)}
            {String(b.status || '').toLowerCase() === 'completed' && !b.feedback && (
              <div className="flex items-center space-x-2">
                <button onClick={()=>navigate(`/rate/${b.id}`)} className="text-blue-500">{t('bookings.rateUs','Rate Us')}</button>
              </div>
            )}
            {String(b.status || '').toLowerCase() === 'completed' && b.feedback && (
              <div className="absolute right-4 bottom-3 text-xl" title={t('bookings.yourRating','Your rating')} aria-hidden="true">
                <div className="flex space-x-0">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`${(b.feedback && b.feedback.rating >= i) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
              </div>
            )}
            {String(b.status || '').toLowerCase() !== 'completed' && (
              <button onClick={()=>callSalon(b.salonName)} className="text-blue-500">{t('bookings.callSalon')}</button>
            )}
          </div>
        </div>

      </div>
    )
  }

  // empty check per filter
  const filteredList = filter === 'all' ? sortedBookings : (filter === 'upcoming' ? upcoming : completed)

  return (
    <div className="px-4 py-5 pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('bookings.myBookings')}</h1>
        <div className="flex items-center space-x-3">
          <button onClick={goBackToHome} className="text-blue-500 hover:text-blue-700" aria-label="Back to home">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <button onClick={()=>setFilter('all')} className={`booking-filter-btn px-4 py-2 rounded-full text-sm font-medium ${filter==='all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{t('bookings.all')}</button>
        <button onClick={()=>setFilter('upcoming')} className={`booking-filter-btn px-4 py-2 rounded-full text-sm font-medium ${filter==='upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{t('bookings.upcoming')}</button>
        <button onClick={()=>setFilter('completed')} className={`booking-filter-btn px-4 py-2 rounded-full text-sm font-medium ${filter==='completed' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{t('bookings.completed')}</button>
      </div>

      {filter === 'all' ? (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('bookings.noBookingsTitle')}</h3>
              <p className="text-gray-500 mb-4">{t('bookings.noBookingsDesc')}</p>
              <div className="mt-3">
                <button onClick={goBackToHome} className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">{t('bookings.browseSalons')}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">{sortedBookings.map(renderBooking)}</div>
          )}
        </div>
      ) : (
        <div>
          {filteredList.length === 0 ? (
            <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('bookings.noBookingsTitle')}</h3>
              <p className="text-gray-500 mb-4">{t('bookings.noBookingsDesc')}</p>
              <div className="mt-3">
                <button onClick={goBackToHome} className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">{t('bookings.browseSalons')}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">{filteredList.map(renderBooking)}</div>
          )}
        </div>
      )}
      {/* Cancel confirmation modal (logout-style) */}
      {bookingToCancel && (
        <div style={{zIndex:99999}} className="fixed inset-0 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black opacity-40"></div>
              <div ref={modalRef} className="relative bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('bookings.confirmCancelTitle', ' Cancel booking')}</h3>
                <p className="text-sm text-gray-700 mb-3">{t('bookings.confirmCancelMessage', 'Are you sure you want to cancel the booking?')}</p>
                <label className="block text-sm text-gray-700 mb-2">{t('bookings.cancelReasonTitle', 'Reason for cancellation')}</label>
                <select
                  ref={reasonSelectRef}
                  value={cancelReason}
                  onChange={(e)=>{ setCancelReason(e.target.value); if(e.target.value !== OTHER_REASON_LABEL) setOtherReason('') }}
                  className="w-full border rounded px-3 py-2 mb-3"
                  aria-label={t('bookings.cancelReasonAria', 'Select cancellation reason')}
                >
                  <option value="">{t('common.select', 'Select')}</option>
                  {CANCEL_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {cancelReason === OTHER_REASON_LABEL && (
                  <textarea
                    ref={otherReasonRef}
                    value={otherReason}
                    onChange={(e)=>setOtherReason(e.target.value)}
                    placeholder={t('bookings.cancelOtherPlaceholder', 'Please enter your reason')}
                    className="w-full border rounded px-3 py-2 mb-3"
                    rows={3}
                  />
                )}
                <div className="flex space-x-3">
                  <button
                    ref={confirmBtnRef}
                    onClick={()=>{ 
                      try{
                        const finalReason = cancelReason === OTHER_REASON_LABEL ? (otherReason || '').trim() : cancelReason
                        if(typeof cancelBooking === 'function') cancelBooking(bookingToCancel.id, finalReason)
                      }finally{
                        setBookingToCancel(null)
                        setCancelReason('')
                        setOtherReason('')
                      }
                    }}
                    className={`flex-1 ${(!cancelReason || (cancelReason===OTHER_REASON_LABEL && (!otherReason || !otherReason.trim())) ) ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white py-2 rounded`}
                    disabled={!cancelReason || (cancelReason===OTHER_REASON_LABEL && (!otherReason || !otherReason.trim()))}
                  >
                    {t('bookings.cancelConfirm', 'Yes, cancel')}
                  </button>
                  <button onClick={()=>{ setBookingToCancel(null); setCancelReason(''); setOtherReason('') }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded">{t('common.cancel')}</button>
                </div>
              </div>
        </div>
      )}
    </div>
  )
}
