import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDynamicLocalization } from '../utils/localize'

export default function Ratings({ salonsByLocation = {} }){
  const { t } = useTranslation()
  const { salonId } = useParams()
  const navigate = useNavigate()
  const [openMap, setOpenMap] = useState({})
  // track expanded review ids
  const [expanded, setExpanded] = useState({})

  const { salonName, salonAddress } = useDynamicLocalization()
  const all = Object.values(salonsByLocation).flat()
  const salon = all.find(s => s.id === salonId)
  const reviews = (salon && salon.reviews) ? salon.reviews : []

  return (
    <div className="px-4 py-5 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('ratings.title', 'Ratings')}</h1>
        <button onClick={() => navigate(-1)} className="text-blue-500 hover:text-blue-700">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        </button>
        </div>

      {!salon ? (
        <div className="text-center text-gray-600">{t('ratings.notFound', 'Salon not found')}</div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{salonName(salon.id, salon.name)}</h2>
            <div className="text-sm text-gray-600">{salonAddress(salon.id, salon.address)}</div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center text-gray-600">{t('ratings.noReviews', 'No reviews yet')}</div>
          ) : (
            <div className="ratings-list">
              {reviews.map(r => {
                const name = t(`data.reviews.${r.id}.name`, { defaultValue: r.name })
                const comment = t(`data.reviews.${r.id}.comment`, { defaultValue: r.comment })
                const initials = (name || '').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()
                const isExpanded = !!expanded[r.id]
                return (
                  <article key={r.id} className={`rating-card ${isExpanded? 'expanded':''}`}>
                    <header className="rating-header">
                      <div className="rating-avatar" aria-hidden>
                        {initials}
                      </div>
                      <div className="rating-meta">
                        <div className="rating-name">{name}</div>
                        <div className="rating-stars" aria-hidden>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} className={`star ${i < r.stars ? 'filled' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.377 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.377 2.455c-.784.57-1.84-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.629 9.393c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69L9.049 2.927z" /></svg>
                          ))}
                        </div>
                      </div>
                      <div className="rating-date">{r.date}</div>
                    </header>

                    <div className="rating-body">
                      <p className={`rating-comment ${isExpanded? 'show':''}`}>{comment}</p>
                      {r.images && r.images.length > 0 && (
                        <div className="mt-3 grid grid-flow-col gap-2 auto-cols-max">
                          {r.images.map((src, idx) => (
                            <img key={idx} src={src} alt={t('ratings.imageAlt','Review image')} className="w-20 h-20 object-cover rounded" />
                          ))}
                        </div>
                      )}
                      {comment && comment.length > 140 && (
                        <button onClick={() => setExpanded(prev => ({...prev, [r.id]: !prev[r.id]}))} className="rating-toggle">{isExpanded ? t('ratings.showLess','Show less') : t('ratings.showMore','Read more')}</button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
