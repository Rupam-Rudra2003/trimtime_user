import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setProfile } from '../utils/profile'

function getUsers(){
  try{ const raw = localStorage.getItem('trimtime_users'); return raw ? JSON.parse(raw) : [] }catch(e){ return [] }
}

function saveUsers(users){
  try{ localStorage.setItem('trimtime_users', JSON.stringify(users)) }catch(e){}
}

export default function SignUp({ onLogin }){
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [showOtpSection, setShowOtpSection] = React.useState(false)
  const [otpBoxes, setOtpBoxes] = React.useState(['','','',''])

  function validatePhone(p){ return String(p).replace(/\D/g,'').length >= 10 }

  function sendSignupOtp(e){
    e && e.preventDefault()
    setError('')
    if(!name || !validatePhone(phone) || !password) return setError(t('auth.fillRequired', 'Please fill name, phone and password'))
    if(password.length < 6) return setError(t('auth.passwordLength', 'Password must be at least 6 characters'))
    setLoading(true)
    setTimeout(()=>{
      setLoading(false)
      setShowOtpSection(true)
      setSuccess(t('auth.otpSent'))
      setTimeout(()=>setSuccess(''),3000)
    },900)
  }

  function verifySignupOtp(){
    const fullOtp = otpBoxes.join('')
    if(fullOtp !== '1234') return setError(t('auth.invalidOtp'))
    setLoading(true)
    setTimeout(()=>{
      const users = getUsers()
      if(users.some(u=>u.phone===phone)){ setError(t('auth.accountExists')); setLoading(false); return }
      const newUser = { id: Date.now().toString(), name, phone, password, email }
      users.push(newUser)
      saveUsers(users)
      setProfile({ name: newUser.name, phone: newUser.phone, email: newUser.email })
      setSuccess(t('auth.accountCreated'))
      if(typeof onLogin === 'function') onLogin()
      setLoading(false)
      setTimeout(()=> navigate('/'), 700)
    },900)
  }

  function onOtpChange(idx, val){
    const v = val.replace(/[^0-9]/g,'').slice(0,1)
    const next = [...otpBoxes]
    next[idx] = v
    setOtpBoxes(next)
    if(v && idx < 3){
      const el = document.getElementById('otp-' + (idx+2))
      el && el.focus()
    }
  }

  return (
    <div className="auth-container min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="auth-card w-full max-w-xs sm:max-w-sm rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="brand-logo text-2xl sm:text-3xl font-bold mb-1">{t('common.brand')}</h1>
          <p className="text-gray-600 text-xs sm:text-sm">{t('auth.yourBeautyOurPriority')}</p>
        </div>

        <div className="flex mb-4 sm:mb-5 border-b border-gray-200">
          <Link to="/signin" className="tab-btn flex-1 py-2 sm:py-2.5 px-2 sm:px-3 text-center font-semibold text-xs sm:text-sm">{t('auth.signIn')}</Link>
          <button className="tab-btn active flex-1 py-2 sm:py-2.5 px-2 sm:px-3 text-center font-semibold text-xs sm:text-sm">{t('auth.signUp')}</button>
        </div>

        {error && <div className="mb-3"><div className="error-message text-white px-4 py-2 rounded-lg text-sm font-medium">{error}</div></div>}
        {success && <div className="mb-3"><div className="success-message text-white px-4 py-2 rounded-lg text-sm font-medium">{success}</div></div>}

        <form id="signup-form" onSubmit={sendSignupOtp} className={`form-container ${!showOtpSection ? 'active' : ''}`}>
          <div className="relative"><input type="text" id="signup-name" name="name" required placeholder=" " value={name} onChange={e=>setName(e.target.value)} className="input-field w-full px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none text-sm sm:text-base" /> <label htmlFor="signup-name" className="floating-label">{t('auth.fullName')} <span className="required-asterisk">*</span></label>
          </div>
          <div className="relative mt-3"><input type="tel" id="signup-phone" name="phone" required placeholder=" " value={phone} onChange={e=>setPhone(e.target.value)} className="input-field w-full px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none text-sm sm:text-base" /> <label htmlFor="signup-phone" className="floating-label">{t('auth.phoneNumber')} <span className="required-asterisk">*</span></label>
          </div>
          <div className="relative mt-3"><input type="email" id="signup-email" name="email" placeholder=" " value={email} onChange={e=>setEmail(e.target.value)} className="input-field w-full px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none text-sm sm:text-base" /> <label htmlFor="signup-email" className="floating-label">{t('auth.emailAddress')}</label>
          </div>
          <div className="relative mt-3"><input type="password" id="signup-password" name="password" required placeholder=" " value={password} onChange={e=>setPassword(e.target.value)} className="input-field w-full px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none text-sm sm:text-base" /> <label htmlFor="signup-password" className="floating-label">{t('auth.password')} <span className="required-asterisk">*</span></label>
          </div>
          <div className="mt-4">
            <button type="submit" id="send-signup-otp-btn" className="auth-btn w-full py-2 sm:py-2.5 px-4 rounded-lg text-white font-semibold text-sm sm:text-base" disabled={loading}>
              <span id="send-signup-otp-text" className={loading ? 'hidden' : ''}>{t('auth.sendOtp')}</span>
              <div id="send-signup-otp-spinner" className={loading ? 'loading-spinner mx-auto' : 'loading-spinner hidden'}></div>
            </button>
          </div>
        </form>

        <div id="signup-otp-section" className={`mt-4 ${showOtpSection ? '' : 'hidden'}`}>
          <div className="text-center mb-4">
            <h4 className="text-sm font-semibold text-gray-800">{t('auth.verifyPhoneTitle')}</h4>
            <p className="text-xs text-gray-600 mt-1">{t('auth.verifyPhoneSubtitle')}</p>
          </div>
          <div className="flex justify-center space-x-2 mb-4">
            {[0,1,2,3].map(i=> (
              <input key={i} id={`otp-${i+1}`} value={otpBoxes[i]} onChange={e=>onOtpChange(i,e.target.value)} maxLength={1} className="otp-box w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
            ))}
          </div>
          <button type="button" id="verify-signup-otp-btn" onClick={verifySignupOtp} className="auth-btn w-full py-2 sm:py-2.5 px-4 rounded-lg text-white font-semibold text-sm sm:text-base"> <span id="verify-signup-otp-text">{t('auth.verifyCreateAccount')}</span>
          </button>
          <div className="text-center mt-3"><button type="button" onClick={()=>{ setShowOtpSection(false); setOtpBoxes(['','','','']) }} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium underline">{t('common.back')}</button></div>
        </div>

        <div className="mt-3 sm:mt-4 text-center text-xs text-gray-500"><span className="required-asterisk">*</span> {t('auth.requiredFields')}</div>
      </div>
    </div>
  )
}

