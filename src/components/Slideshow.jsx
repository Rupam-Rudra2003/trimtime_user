import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export default function Slideshow({ images, height = '12rem', defaultTitle = '', defaultSubtitle = '' }) {
  // Assume defaultTitle/defaultSubtitle already localized by parent; allow fallback to i18n home keys if empty
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const ref = useRef()

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % images.length), 4000)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <div className="relative overflow-hidden bg-gray-200" style={{height}}>
      <div className="relative w-full h-full">
        {images.map((img, i) => (
          <div key={i} className={`slideshow-slide ${i===index? 'active':''}`}>
            <img src={img.url} alt={img.alt||'slide'} onError={(e)=>{e.target.src='https://via.placeholder.com/800x400'}}/>

            {/* Integrated overlay text inside each slide. Use per-image title/subtitle if provided, otherwise fall back to defaults. */}
            {(img.title || defaultTitle) && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center px-4">
                <div className="text-center text-white max-w-lg">
                  <h2 className="text-2xl font-bold mb-2">{img.title || defaultTitle || t('home.defaultTitle')}</h2>
                  { (img.subtitle || defaultSubtitle) && (
                    <p className="text-sm opacity-90">{img.subtitle || defaultSubtitle || t('home.defaultSubtitle')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, i) => (
          <div key={i} onClick={()=>setIndex(i)} className={`slideshow-indicator ${i===index? 'active':''}`}></div>
        ))}
      </div>
    </div>
  )
}
