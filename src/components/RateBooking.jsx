import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useDynamicLocalization } from '../utils/localize'

export default function RateBooking({ bookings = [], submitFeedback }){
  const { t } = useTranslation()
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { salonName, salonAddress } = useDynamicLocalization()
  const booking = (bookings || []).find(b => `${b.id}` === `${bookingId}`)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const toastTimerRef = useRef(null)
  const location = useLocation()

  // Prefill rating from query param if provided (e.g. ?rating=4)
  useEffect(()=>{
    try{
      const params = new URLSearchParams(location.search)
      const r = parseInt(params.get('rating'))
      if (!isNaN(r) && r >=1 && r <=5) setRating(r)
    }catch(e){/* ignore */}
  },[location.search])

  if(!booking) return <div className="p-4">{t('rateBooking.notFound','Booking not found')}</div>

  function onImageChange(files){
    const list = Array.from(files || [])
    const readers = list.map(f => new Promise(res => { const r = new FileReader(); r.onload = ()=>res(r.result); r.readAsDataURL(f) }))
    Promise.all(readers).then(data=> setImages(prev => prev.concat(data))).catch(()=>{})
  }

  async function doSubmit(){
    if(!rating || !comment.trim()) return
    setSaving(true)
    try{
      if(typeof submitFeedback === 'function'){
        submitFeedback(bookingId, { rating, comment, images })
      }
      setSaving(false)
      setShowConfirm(false)
      // show a small toast at bottom-right then navigate back
      setShowSavedToast(true)
      // clear any existing timer then start a new one
      if(toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(()=>{
        setShowSavedToast(false)
        navigate('/bookings')
        toastTimerRef.current = null
      }, 1400)
    }catch(e){
      setSaving(false)
    }
  }

  // cleanup toast timer on unmount
  useEffect(()=>{
    return ()=>{
      if(toastTimerRef.current){
        clearTimeout(toastTimerRef.current)
        toastTimerRef.current = null
      }
    }
  },[])

  return (
    <div className="px-4 py-5 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('rateBooking.title','Rate your visit')}</h1>
        <button onClick={()=>navigate(-1)} className="text-blue-500 hover:text-blue-700">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <h2 className="font-semibold text-lg">{booking.salonId ? salonName(booking.salonId, booking.salonName) : booking.salonName}</h2>
        <div className="text-sm text-gray-600 mb-3">{booking.salonId ? salonAddress(booking.salonId, booking.salonAddress) : booking.salonAddress}</div>

        <div className="mb-3">
          <div className="text-sm font-medium mb-2">{t('rateBooking.rateLabel','Your rating')}</div>
          <div className="flex items-center space-x-2">
            {[1,2,3,4,5].map(i => (
              <button
                key={i}
                type="button"
                onClick={()=> setRating(prev => prev === i ? 0 : i)}
                className={`text-2xl ${i <= rating ? 'text-yellow-500' : 'text-gray-300'} cursor-pointer`}
                aria-label={`${i} star`}
                title={`${i} star`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">{t('rateBooking.reviewLabel','Write a review')}</label>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} className="w-full border rounded px-3 py-2" rows={5} />
          {!comment.trim() && rating ? (
            <div className="text-sm text-red-600 mt-2">{t('rateBooking.reviewRequired','Please write a review')}</div>
          ) : null}
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">{t('rateBooking.uploadImages','Upload images (optional)')}</label>
          <input type="file" accept="image/*" multiple onChange={(e)=>onImageChange(e.target.files)} />
        </div>

        <div className="flex space-x-2">
          <button onClick={()=>setShowConfirm(true)} className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ${(!rating || !comment.trim())? 'opacity-60 cursor-not-allowed':''}`} disabled={!rating || !comment.trim()}>{t('rateBooking.submit','Submit')}</button>
          <button onClick={()=>navigate('/bookings')} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded">{t('common.cancel')}</button>
        </div>
      </div>

      {showConfirm && (
        <div style={{zIndex:99999}} className="fixed inset-0 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-5">
            <h3 className="text-lg font-semibold mb-2">{t('rateBooking.confirmTitle','Confirm submission')}</h3>
            <p className="text-sm text-gray-700 mb-4">{t('rateBooking.confirmMessage','Are you sure you want to submit this rating?')}</p>
            <div className="flex space-x-3">
              <button onClick={doSubmit} disabled={!rating || !comment.trim()} className={`flex-1 ${saving ? 'bg-blue-300' : (!rating || !comment.trim() ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700')} text-white py-2 rounded`}>{saving? t('common.saving','Saving...') : t('common.confirm','Submit')}</button>
              <button onClick={()=>setShowConfirm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showSavedToast && (
        <div aria-live="polite" className="fixed right-4 bottom-4 z-50">
          <div
            role="status"
            onClick={() => {
              // dismiss immediately and navigate
              if(toastTimerRef.current) { clearTimeout(toastTimerRef.current); toastTimerRef.current = null }
              setShowSavedToast(false)
              navigate('/bookings')
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer"
            title={t('rateBooking.savedToast','Feedback saved')}
          >
            {t('rateBooking.savedToast','Feedback saved')}
          </div>
        </div>
      )}
    </div>
  )
}
