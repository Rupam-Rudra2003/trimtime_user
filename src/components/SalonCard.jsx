import React from 'react'
import { getProfile } from '../utils/profile'
import { useTranslation } from 'react-i18next'
import { useDynamicLocalization } from '../utils/localize'

export default function SalonCard({ salon, onOpen, onBook, quickBook, isFavorite, onToggleFavorite }) {
  const { t } = useTranslation()
  const { salonName, salonAddress, serviceName } = useDynamicLocalization()
  const [showQuick, setShowQuick] = React.useState(false)
  const [selected, setSelected] = React.useState([])
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = React.useState('10:00')
  const [name, setName] = React.useState('')

  function toggleService(i){
    setSelected(prev => {
      if(prev.includes(i)) return prev.filter(x=>x!==i)
      return [...prev, i]
    })
  }

  function openQuick(e){
    e.stopPropagation()
    setShowQuick(true)
  }

  function confirmQuick(){
    if(selected.length===0) return
    const services = selected.map(i=> ({...salon.servicesList[i], index:i}))
    // auto-fill user details from profile
    const profile = getProfile()
    const booking = {
      id: Date.now().toString(),
      salonName: salon.name,
      salonAddress: salon.address,
      salonId: salon.id,
      customerName: profile.name || name || 'Guest',
      customerPhone: profile.phone || '',
      date,
      time,
      services,
      totalPrice: services.reduce((s,a)=>s+a.price,0),
      status: 'upcoming',
      bookingDate: new Date().toISOString()
    }
    quickBook && quickBook(booking)
    setShowQuick(false)
    setSelected([])
    setName('')
  }

  return (
    <>
    <div className={`salon-card zomato-card bg-white rounded-lg shadow-sm mb-4 overflow-hidden cursor-pointer ${salon.status === 'Closed' ? 'salon-closed' : ''}`} onClick={()=>onOpen && onOpen(salon)}>
      <div className="flex h-44">
        <div className="w-32 h-44 flex-shrink-0 relative">
          <div className="card-image-container w-full h-full relative overflow-hidden rounded-l-lg">
            <img src={salon.image} alt={salon.name} className="w-full h-full object-cover" onError={(e)=>e.target.src='https://via.placeholder.com/200'} />
          </div>
          <button className="favorite-btn absolute top-2 left-2 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-sm hover:bg-opacity-100 transition-all z-10" onClick={(e)=>{e.stopPropagation(); onToggleFavorite && onToggleFavorite(salon)}}>
            <svg className={`w-5 h-5 ${isFavorite? 'text-red-500 fill-current':'text-gray-400'}`} fill={isFavorite? 'currentColor': 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 px-5 py-4 flex flex-col justify-between h-full">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 text-lg leading-tight pr-3">{salonName(salon.id, salon.name)}</h3>
              <div className="flex items-center bg-green-500 rating-badge px-2 py-1 rounded-lg text-sm font-bold flex-shrink-0 text-white">
                <span>{salon.rating}</span>
                <span className="ml-1">★</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">{salonAddress(salon.id, salon.address)}</p>
            {/* Show waiting and queue info instead of service names on homepage; add icons for clarity */}
            <div className="text-sm text-gray-700 font-medium mb-3">
              <span className="inline-flex items-center mr-4">
                <svg className="w-4 h-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2 13.5C2 11 6 10 10 10s8 1 8 3.5V16H2v-2.5z" />
                </svg>
                <span className="font-semibold text-gray-900">{salon.waiting || ''}</span>
              </span>

              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.75a.75.75 0 00-1.5 0v4.25c0 .207.083.406.23.552l2.5 2.5a.75.75 0 101.06-1.06L10.75 10.04V6.25z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">{salon.time || ''}</span>
              </span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm">
                <span className={`${salon.status==='Closed'? 'text-red-600':'text-green-600'} font-semibold`}>{salon.status}</span>
                <span className="text-gray-600"> • {salon.hours}</span>
              </div>
            </div>

            {/* Action badges and buttons removed to simplify card UI */}

          </div>
        </div>
      </div>
  </div>
  {showQuick && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={()=>setShowQuick(false)}>
        <div className="bg-white rounded-lg w-full max-w-md p-4" onClick={(e)=>e.stopPropagation()}>
          <h3 className="text-lg font-semibold mb-3">{t('bookings.quickBookTitle', 'Quick Book')} — {salon.name}</h3>

          {/* name/phone come from profile automatically */}

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">{t('common.selectServices')}</label>
            <div className="space-y-2 max-h-40 overflow-auto">
              {(salon.servicesList || []).map((svc, idx)=> {
                const cat = (svc.category || '').toLowerCase()
                const badgeClass = cat === 'unisex' ? 'bg-green-100 text-green-800' : (cat === 'men' ? 'bg-blue-100 text-blue-800' : (cat === 'women' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'))
                const labelText = svc.category ? String(svc.category).charAt(0).toUpperCase() + String(svc.category).slice(1) : ''
                return (
                  <label key={idx} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center">
                      <input type="checkbox" checked={selected.includes(idx)} onChange={()=>toggleService(idx)} className="mr-3" />
                      <div>
                        <div className="font-medium flex items-center">
                          <span>{serviceName(svc.name)}</span>
                          {labelText && (
                            <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>{labelText}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{svc.duration}</div>
                      </div>
                    </div>
                    <div className="font-semibold">₹{svc.price}</div>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.date')}</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.time')}</label>
              <select value={time} onChange={e=>setTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option>09:00</option>
                <option>10:00</option>
                <option>11:00</option>
                <option>14:00</option>
                <option>15:00</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="font-semibold">{t('common.totalLabel')}: ₹{selected.reduce((s,i)=>s + ((salon.servicesList[i] && salon.servicesList[i].price) || 0), 0)}</div>
          </div>

          <div className="flex space-x-3">
            <button onClick={()=>setShowQuick(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">{t('common.cancel')}</button>
            <button onClick={confirmQuick} className="flex-1 bg-blue-500 text-white py-2 rounded-lg">{t('buttons.confirmBooking')}</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

// Quick book modal rendered at end of file via portal-like absolute overlay (keeps file self-contained)
