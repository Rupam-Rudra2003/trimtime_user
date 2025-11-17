import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, setProfile } from '../utils/profile'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../i18n'

export default function Profile({ onLogout }){
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [profile, setProfileState] = React.useState(() => getProfile() || { name: '', phone: '', email: '', image: '' })
  const [editingField, setEditingField] = React.useState(null)
  const [tempValue, setTempValue] = React.useState('')

  function goBackToHome(){ navigate('/') }
  function startEdit(field){ setEditingField(field); setTempValue(profile[field] || '') }
  function cancelEdit(){ setEditingField(null); setTempValue('') }
  function saveEdit(){
    if(!editingField) return
    const p = { ...profile, [editingField]: tempValue }
    setProfile(p); setProfileState(p); setEditingField(null); setTempValue('')
  }

  const fileInputRef = React.useRef(null)
  function triggerImageUpload(){ fileInputRef.current && fileInputRef.current.click() }
  function onImageSelected(e){
    const f = e.target.files && e.target.files[0]
    if(!f) return
    const reader = new FileReader()
    reader.onload = ev => { const p = { ...profile, image: ev.target.result }; setProfile(p); setProfileState(p) }
    reader.readAsDataURL(f)
  }

  function showBookingsPage(){ navigate('/bookings') }
  function showFavoritesPage(){ navigate('/favorites') }
  const [showPaymentModal, setShowPaymentModal] = React.useState(false)
  const [showReferralModal, setShowReferralModal] = React.useState(false)
  function showPaymentMethods(){ setShowPaymentModal(true) }
  function showReferralProgram(){ setShowReferralModal(true) }
  function contactSupport(){ window.location.href = 'mailto:support@trimtime.example.com' }
  function showFAQ(){ navigate('/faq') }
  function showTermsAndPrivacy(){ navigate('/terms') }
  function showPrivacySettings(){ alert('Privacy settings (not implemented)') }

  function showLogoutConfirmation(){ setShowLogoutConfirm(true) }
  function handleConfirmLogout(){
    if(typeof onLogout === 'function') onLogout(); else { try{ localStorage.removeItem('trimtime_profile') }catch(e){} navigate('/signin') }
    setShowLogoutConfirm(false)
  }
  function handleCancelLogout(){ setShowLogoutConfirm(false) }

  const initials = ((profile && profile.name) || '').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() || 'AB'
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)
  const confirmBtnRef = React.useRef(null)
  const modalRef = React.useRef(null)

  React.useEffect(()=>{
    const prev = document.body.style.overflow
    function onKeyDown(e){
      if(!showLogoutConfirm) return
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
    function onFocusIn(e){ if(showLogoutConfirm){ const modal = modalRef.current; if(modal && !modal.contains(e.target)){ e.preventDefault(); try{ confirmBtnRef.current && confirmBtnRef.current.focus() }catch(e){} } } }
    if(showLogoutConfirm){
      document.body.style.overflow = 'hidden'
      setTimeout(()=>{ try{ confirmBtnRef.current && confirmBtnRef.current.focus() }catch(e){} }, 0)
      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('focusin', onFocusIn)
    } else { document.body.style.overflow = prev || '' }
    return ()=>{ document.body.style.overflow = prev || ''; document.removeEventListener('keydown', onKeyDown); document.removeEventListener('focusin', onFocusIn) }
  }, [showLogoutConfirm])

  React.useEffect(()=>{
    const prev = document.body.style.overflow
    if(showPaymentModal || showReferralModal){
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = prev || ''
    }
    return ()=>{ document.body.style.overflow = prev || '' }
  }, [showPaymentModal, showReferralModal])

  function renderEdit(field, label){
    const val = profile[field]
    const isEditing = editingField === field
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {field === 'phone' && (
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
          )}
          {field === 'email' && (
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/> <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
          )}
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input value={tempValue} onChange={e=>setTempValue(e.target.value)} className="border rounded px-2 py-1 text-sm" />
                <button onClick={saveEdit} className="text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-sm">{t('common.save')}</button>
                <button onClick={cancelEdit} className="text-gray-600 px-2 py-1 rounded text-sm">{t('common.cancel')}</button>
              </div>
            ) : (
              <p className="font-medium text-gray-900">{val}</p>
            )}
          </div>
        </div>
        <button onClick={()=>startEdit(field)} className="text-blue-500 hover:text-blue-700" title={t(`buttons.edit${field.charAt(0).toUpperCase()+field.slice(1)}`)}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
        </button>
      </div>
    )
  }

  return (
    <div id="profile-page" className="px-4 py-5 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('profile.title')}</h1>
        <button onClick={goBackToHome} className="text-blue-500 hover:text-blue-700" aria-label={t('common.back')}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          {profile.image ? (
            <img src={profile.image} alt="avatar" className="w-24 h-24 rounded-full object-cover shadow-lg" />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">{initials}</div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />
          <button onClick={triggerImageUpload} className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors" title={t('buttons.editPhoto')}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
          </button>
        </div>
        <div className="flex items-center justify-center mb-1">
          {editingField === 'name' ? (
            <div className="flex items-center space-x-2">
              <input value={tempValue} onChange={e=>setTempValue(e.target.value)} className="border rounded px-2 py-1 text-lg" />
              <button onClick={saveEdit} className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded">{t('common.save')}</button>
              <button onClick={cancelEdit} className="text-gray-600 px-3 py-1 rounded">{t('common.cancel')}</button>
            </div>
          ) : (
            <>
              <h2 id="profile-name" className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <button onClick={()=>startEdit('name')} title={t('buttons.editName')} className="ml-2 text-blue-500 hover:text-blue-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{t('profile.personalInformation')}</h3>
        </div>
        <div className="px-4 py-4 border-b border-gray-100">{renderEdit('phone', t('profile.phoneNumber'))}</div>
        <div className="px-4 py-4">{renderEdit('email', t('profile.emailAddress'))}</div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{t('profile.accountSettings')}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                <div>
                  <p className="font-medium text-gray-900">{t('profile.notifications')}</p>
                  <p className="text-sm text-gray-600">{t('profile.notificationsDesc')}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                <div>
                  <p className="font-medium text-gray-900">{t('profile.locationServices')}</p>
                  <p className="text-sm text-gray-600">{t('profile.locationServicesDesc')}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l4 7H8l4-7zm0 20l-4-7h8l-4 7zM2 12l7-4v8l-7-4zm20 0l-7 4V8l7 4z"/></svg>
              <div>
                <p className="font-medium text-gray-900">{t('profile.languageChange')}</p>
                <p className="text-sm text-gray-600">{t('profile.languageChangeDesc')}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 ml-7 flex space-x-2">
            <button onClick={()=>changeLanguage('en')} className={`px-3 py-1 rounded-full text-sm font-medium ${t('common.language.english') && (window?.i18next?.language==='en' || '') ? 'bg-blue-500 text-white':'bg-gray-100 text-gray-800'}`}>{t('common.language.english')}</button>
            <button onClick={()=>changeLanguage('bn')} className={`px-3 py-1 rounded-full text-sm font-medium ${window?.i18next?.language==='bn' ? 'bg-blue-500 text-white':'bg-gray-100 text-gray-800'}`}>{t('common.language.bengali')}</button>
            <button onClick={()=>changeLanguage('hi')} className={`px-3 py-1 rounded-full text-sm font-medium ${window?.i18next?.language==='hi' ? 'bg-blue-500 text-white':'bg-gray-100 text-gray-800'}`}>{t('common.language.hindi')}</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{t('profile.appFeatures')}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="px-4 py-4"><button onClick={showBookingsPage} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
              <div>
                <p className="font-medium text-gray-900">{t('profile.bookingHistory')}</p>
                <p className="text-sm text-gray-600">{t('profile.bookingHistoryDesc')}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
          </button></div>
          <div className="px-4 py-4"><button onClick={showFavoritesPage} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <div>
                <p className="font-medium text-gray-900">{t('profile.favoriteSalons')}</p>
                <p className="text-sm text-gray-600">{t('profile.favoriteSalonsDesc')}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
          </button></div>
          <div className="px-4 py-4"><button onClick={showPaymentMethods} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/> <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg>
              <div>
                <p className="font-medium text-gray-900">{t('profile.paymentMethods')}</p>
                <p className="text-sm text-gray-600">{t('profile.paymentMethodsDesc')}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
          </button></div>
          <div className="px-4 py-4"><button onClick={showReferralProgram} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
              <div>
                <p className="font-medium text-gray-900">{t('profile.referFriends')}</p>
                <p className="text-sm text-gray-600">{t('profile.referFriendsDesc')}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
          </button></div>
          {/* Language Switcher */}
          
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{t('profile.supportHelp')}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="px-4 py-4"><button onClick={contactSupport} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
              <div>
                <p className="font-medium text-gray-900">{t('profile.customerSupport')}</p>
                <p className="text-sm text-gray-600">{t('profile.customerSupportDesc')}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
          </button></div>
          <div className="px-4 py-4"><button onClick={showFAQ} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
              <div>
                <p className="font-medium text-gray-900">{t('profile.faq')}</p>
                <p className="text-sm text-gray-600">{t('profile.faqDesc')}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
          </button></div>
          <div className="px-4 py-4"><button onClick={showTermsAndPrivacy} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>
              <div>
                <p className="font-medium text-gray-900">{t('profile.termsPrivacy')}</p>
                <p className="text-sm text-gray-600">{t('profile.termsPrivacyDesc')}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
          </button></div>
        </div>
      </div>

      <div className="mb-6">
        <button onClick={showLogoutConfirmation} className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
          {t('profile.logout')}
        </button>
      </div>

      {showLogoutConfirm && (
        <div style={{zIndex:99999}} className="fixed inset-0 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div ref={modalRef} className="relative bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('profile.confirmLogoutTitle')}</h3>
            <p className="text-sm text-gray-700 mb-4">{t('profile.confirmLogoutMessage')}</p>
            <div className="flex space-x-3">
              <button ref={confirmBtnRef} onClick={handleConfirmLogout} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded">{t('profile.logoutConfirm')}</button>
              <button onClick={handleCancelLogout} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div style={{zIndex:99999}} className="fixed inset-0 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('profile.paymentMethods')}</h3>
            <p className="text-sm text-gray-700 mb-4">{t('profile.notImplementedYet', 'This feature is not implemented yet')}</p>
            <div className="flex space-x-3">
              <button onClick={()=>setShowPaymentModal(false)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">{t('common.done')}</button>
              <button onClick={()=>setShowPaymentModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showReferralModal && (
        <div style={{zIndex:99999}} className="fixed inset-0 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('profile.referFriends')}</h3>
            <p className="text-sm text-gray-700 mb-4">{t('profile.notImplementedYet', 'This feature is not implemented yet')}</p>
            <div className="flex space-x-3">
              <button onClick={()=>setShowReferralModal(false)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">{t('common.done')}</button>
              <button onClick={()=>setShowReferralModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-gray-500 text-sm">
        <p className="mb-2">{t('profile.version', { version: '2.1.0' })}</p>
        <p>{t('profile.madeBy')}</p>
      </div>
    </div>
  )
}
