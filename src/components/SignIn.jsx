import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setProfile } from '../utils/profile'

function getUsers(){
  try{ const raw = localStorage.getItem('trimtime_users'); return raw ? JSON.parse(raw) : [] }catch(e){ return [] }
}

export default function SignIn({ onLogin }){
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [phone, setPhone] = React.useState('9999999999')
  const [password, setPassword] = React.useState('123456')
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  function validatePhone(p){ return String(p).replace(/\D/g,'').length >= 10 }

  async function handleLogin(e){
    e && e.preventDefault()
    setError('')
    if(!validatePhone(phone)) return setError(t('auth.enterValidPhone'))
    if(!password) return setError(t('auth.enterPassword'))
    setLoading(true)
    // simulate async auth
    setTimeout(()=>{
      const users = getUsers()
      const u = users.find(x => x.phone === phone)
      if(!u){ setError(t('auth.accountNotFound')); setLoading(false); return }
      if(u.password !== password){ setError(t('auth.invalidPassword')); setLoading(false); return }
      const profile = { name: u.name, phone: u.phone, email: u.email || '' }
      setProfile(profile)
      setSuccess(t('auth.loggedIn'))
      if(typeof onLogin === 'function') onLogin()
      setLoading(false)
      setTimeout(()=> navigate('/'), 400)
    }, 900)
  }

  return (
    <div className="auth-container min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="auth-card w-full max-w-xs sm:max-w-sm rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="brand-logo text-2xl sm:text-3xl font-bold mb-1">{t('common.brand')}</h1>
          <p className="text-gray-600 text-xs sm:text-sm">{t('auth.yourBeautyOurPriority')}</p>
        </div>

        <div className="flex mb-4 sm:mb-5 border-b border-gray-200">
          <button className="tab-btn active flex-1 py-2 sm:py-2.5 px-2 sm:px-3 text-center font-semibold text-xs sm:text-sm">{t('auth.signIn')}</button>
          <Link to="/signup" className="tab-btn flex-1 py-2 sm:py-2.5 px-2 sm:px-3 text-center font-semibold text-xs sm:text-sm">{t('auth.signUp')}</Link>
        </div>

        {error && <div className="mb-3"><div className="error-message text-white px-4 py-2 rounded-lg text-sm font-medium">{error}</div></div>}
        {success && <div className="mb-3"><div className="success-message text-white px-4 py-2 rounded-lg text-sm font-medium">{success}</div></div>}

        <form id="login-form" onSubmit={handleLogin} className="form-container active" autoComplete="off">
          {/* Hidden dummy inputs to discourage browser autofill/autopaste */}
          <input type="text" name="-username" autoComplete="off" style={{display:'none'}} />
          <input type="password" name="-password" autoComplete="new-password" style={{display:'none'}} />
          <div className="relative">
            <input autoComplete="off" type="tel" id="login-phone" name="phone" required placeholder=" " value={phone} onChange={e=>setPhone(e.target.value)} className="input-field w-full px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none text-sm sm:text-base" />
            <label htmlFor="login-phone" className="floating-label">{t('auth.phoneNumber')} <span className="required-asterisk">*</span></label>
          </div>

          <div className="relative mt-3">
            <input autoComplete="new-password" type={showPassword ? 'text' : 'password'} id="login-password" name="password" required placeholder=" " value={password} onChange={e=>setPassword(e.target.value)} className="input-field w-full px-3 py-2 sm:py-2.5 pr-10 rounded-lg focus:outline-none text-sm sm:text-base" />
            <label htmlFor="login-password" className="floating-label">{t('auth.password')} <span className="required-asterisk">*</span></label>
            <button type="button" onClick={()=>setShowPassword(s=>!s)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              )}
            </button>
          </div>

          <button type="submit" id="login-btn" className="auth-btn w-full py-2 sm:py-2.5 px-4 rounded-lg text-white font-semibold text-sm sm:text-base mt-6" disabled={loading}>
            <span id="login-text" className={loading ? 'hidden' : ''}>{t('auth.signIn')}</span>
            <div id="login-spinner" className={loading ? 'loading-spinner mx-auto' : 'loading-spinner hidden'}></div>
          </button>

          <div className="text-center mt-3">
            <Link to="/forgot" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium underline">{t('auth.forgotPassword')}</Link>
          </div>
        </form>
        <div className="mt-3 sm:mt-4 text-center text-xs text-gray-500"><span className="required-asterisk">*</span> {t('auth.requiredFields')}</div>
      </div>
    </div>
  )
}

