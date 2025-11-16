import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Favorites({ favorites, salonsByLocation, openSalon, toggleFavorite }){
  const {t} = useTranslation()
  const navigate = useNavigate()
  function goBackToHome(){ navigate('/') }
  const allSalons = Object.values(salonsByLocation).flat()
  const favs = allSalons.filter(s=>favorites.has(s.id))

  return (
    <div className="px-4 py-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('favorites.title')}</h1>
        <button onClick={goBackToHome} className="text-blue-500 hover:text-blue-700">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>
      {favs.length===0 ? (
        <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.6l-1-1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-7.6a5.5 5.5 0 000-7.8z" />
              </svg>
            </div>
          <div className="text-lg font-medium">{t('favorites.emptyTitle')}</div>
          <p className="text-sm text-gray-600 mt-2">{t('favorites.emptyDesc')}</p>
          <div className="mt-4">
            <button onClick={goBackToHome} className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">{t('favorites.browseSalons')}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {favs.map(s => (
            <div key={s.id} className="salon-card zomato-card bg-white rounded-lg shadow-sm mb-4 overflow-hidden cursor-pointer" onClick={() => openSalon(s)}>
              <div className="flex h-44">
                  <div className="w-32 h-44 flex-shrink-0 relative">
                  <div className="card-image-container w-full h-full relative overflow-hidden rounded-l-lg">
                      <img src={s.image} className="w-full h-full object-cover" alt={s.name || ''} onError={(e) => e.target.src = 'https://via.placeholder.com/200'} />
                  </div>
                </div>

                <div className="flex-1 px-5 py-4 flex flex-col justify-between h-full">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight pr-3">{s.name}</h3>
                      <div className="flex items-center bg-green-500 rating-badge px-2 py-1 rounded-lg text-sm font-bold flex-shrink-0 text-white">
                        <span>{s.rating}</span>
                        <span className="ml-1">★</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{s.address}</p>
                    <p className="text-sm text-gray-700 font-medium mb-3">
                      <span className="inline-flex items-center font-semibold text-gray-900 mr-4">
                        <svg className="w-4 h-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2 13.5C2 11 6 10 10 10s8 1 8 3.5V16H2v-2.5z" />
                </svg>
                        {s.waiting || ''}
                      </span>
                      <span className="inline-flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.75a.75.75 0 00-1.5 0v4.25c0 .207.083.406.23.552l2.5 2.5a.75.75 0 101.06-1.06L10.75 10.04V6.25z" clipRule="evenodd" />
                </svg>
                        {s.time || ''}
                      </span>
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm mb-2">
                        <span className={`${s.status === 'Closed' ? 'text-red-600' : 'text-green-600'} font-semibold`}>{s.status}</span>
                        <span className="text-gray-600"> • {s.hours}</span>
                      </div>
                      <div className="ml-4">
                        <button type="button" onClick={(e) => { e.stopPropagation(); toggleFavorite(s) }} className="bg-red-500 text-white px-2 py-0.5 mb-3 text-xs rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300">{t('favorites.remove')}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
