'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Lock, User, ArrowRight, ArrowLeft,
  CheckCircle2, Zap, ShieldCheck, Globe, KeyRound,
  MessagesSquare, Eye, EyeOff, RefreshCw, Loader2,
} from 'lucide-react';

/* ─── Animated Input with focus-pop icon & show-password ─── */
function AnimatedInput({ icon: Icon, type: initialType, placeholder, value, onChange, required, minLength, showToggle = false, autoFocus = false }) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  const type = initialType === 'password' ? (showPass ? 'text' : 'password') : initialType;

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          position: 'absolute', left: '16px', top: '50%',
          transform: focused ? 'translateY(-50%) scale(1.2)' : 'translateY(-50%) scale(1)',
          color: focused ? 'var(--accent-coral)' : 'var(--text-muted)',
          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer', zIndex: 2, display: 'flex',
        }}
      >
        <Icon size={18} />
      </div>
      <input
        ref={inputRef}
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          paddingLeft: '46px',
          paddingRight: showToggle ? '48px' : '16px',
          borderRadius: '24px',
          backgroundColor: 'var(--bg-panel)',
          borderColor: focused ? 'var(--accent-coral)' : undefined,
          boxShadow: focused ? '0 0 0 3px rgba(226,114,91,0.13)' : undefined,
        }}
        required={required}
        minLength={minLength}
      />
      {showToggle && (
        <button type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)}
          style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: showPass ? 'var(--accent-coral)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', transition: 'color 0.2s', padding: '4px' }}>
          {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      )}
    </div>
  );
}

/* ─── OTP Input: 6 separate boxes ─── */
function OTPInput({ value, onChange }) {
  const inputsRef = useRef([]);
  const digits = (value + '      ').slice(0, 6).split('');

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;
    const newDigits = [...digits];
    newDigits[i] = val[0];
    onChange(newDigits.join('').trim());
    if (i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      const newDigits = [...digits];
      if (newDigits[i].trim()) {
        newDigits[i] = ' ';
        onChange(newDigits.join('').trim());
      } else if (i > 0) {
        inputsRef.current[i - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    if (pasted.length === 6) inputsRef.current[5]?.focus();
    e.preventDefault();
  };

  const isComplete = value.trim().length === 6;

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      {digits.map((d, i) => {
        const hasVal = Boolean(d.trim());
        const borderColor = isComplete
          ? '#10B981'
          : hasVal
          ? 'var(--accent-coral)'
          : 'var(--border-color)';

        const bgColor = isComplete
          ? '#ECFDF5'
          : hasVal
          ? 'var(--accent-coral-light)'
          : 'var(--bg-panel)';

        const textColor = isComplete
          ? '#047857'
          : 'var(--text-primary)';

        return (
          <input
            key={i}
            ref={el => inputsRef.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d.trim()}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            autoFocus={i === 0}
            style={{
              width: '48px', height: '56px',
              textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
              border: `2px solid ${borderColor}`,
              borderRadius: '14px',
              backgroundColor: bgColor,
              color: textColor,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isComplete ? '0 0 0 4px rgba(16, 185, 129, 0.18)' : 'none',
              transform: isComplete ? 'scale(1.03)' : 'scale(1)',
            }}
          />
        );
      })}
    </div>
  );
}

export default function LoginPage() {
  // mode: 'login' | 'signup' | 'signup-otp' | 'forgot' | 'forgot-otp'
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formKey, setFormKey] = useState(0);

  const { login, sendSignupOTP, verifySignupOTP, sendResetOTP, verifyResetOTP, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'hidden'; };
  }, []);

  useEffect(() => { if (user) router.push('/'); }, [user, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        router.push('/');

      } else if (mode === 'signup') {
        await sendSignupOTP(name, email, password);
        setSuccess('OTP sent! Check your email inbox.');
        setOtp('');
        setFormKey(k => k + 1);
        setMode('signup-otp');

      } else if (mode === 'signup-otp') {
        await verifySignupOTP(email, otp);
        setSuccess('Account created successfully! Opening Chatify...');
        setPassword('');
        setOtp('');
        setTimeout(() => {
          router.push('/');
        }, 1000);

      } else if (mode === 'forgot') {
        await sendResetOTP(email);
        setSuccess('OTP sent! Check your email inbox.');
        setOtp('');
        setFormKey(k => k + 1);
        setMode('forgot-otp');

      } else if (mode === 'forgot-otp') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const res = await verifyResetOTP(email, otp, password);
        setSuccess(res.message || 'Password reset! Redirecting...');
        setTimeout(() => switchMode('login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    try {
      if (mode === 'signup-otp') {
        await sendSignupOTP(name, email, password);
      } else {
        await sendResetOTP(email);
      }
      setSuccess('A new OTP has been sent to your email.');
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setOtp('');
    setFormKey(k => k + 1);
  };

  const isOtpMode = mode === 'signup-otp' || mode === 'forgot-otp';

  const features = [
    { icon: <Zap size={18} />, text: 'Real-time messaging & read receipts', bg: 'var(--accent-teal-light)', color: 'var(--accent-teal)' },
    { icon: <Globe size={18} />, text: 'Online status & typing indicators', bg: 'var(--accent-coral-light)', color: 'var(--accent-coral)' },
    { icon: <ShieldCheck size={18} />, text: 'OTP-verified secure authentication', bg: 'var(--accent-teal-light)', color: 'var(--accent-teal)' },
  ];

  return (
    <div className="auth-page-wrapper" style={{ minHeight: '100vh', width: '100vw', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: '1040px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'center' }}>

        {/* ── LEFT COLUMN ── */}
        <div className="auth-branding-col slide-in-left" style={{ paddingRight: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div className="icon-float" style={{ width: '60px', height: '60px', borderRadius: '20px', backgroundColor: 'var(--accent-coral)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(226,114,91,0.35)' }}>
              <MessagesSquare size={34} />
            </div>
            <h1 className="brand-font" style={{ fontSize: '3.8rem', color: 'var(--accent-coral)', lineHeight: 1 }}>Chatify</h1>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: '16px' }}>
            Connect with people you care about — instantly.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '32px' }}>
            Send messages, share images, and stay connected in real-time. Chatify makes conversations feel natural, fast, and beautifully simple.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((f, i) => (
              <div key={i} className="feature-pill slide-in-left" style={{ animationDelay: `${0.15 + i * 0.1}s`, opacity: 0 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</div>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="auth-form-col" style={{ maxWidth: '420px', width: '100%', justifySelf: 'center' }}>

          {/* Mobile Logo */}
          <div className="mobile-brand slide-in-up" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', marginBottom: '28px', gap: '10px' }}>
            <div className="icon-float" style={{ width: '64px', height: '64px', borderRadius: '22px', backgroundColor: 'var(--accent-coral)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 28px rgba(226,114,91,0.38)' }}>
              <MessagesSquare size={36} />
            </div>
            <h1 className="brand-font" style={{ fontSize: '3rem', color: 'var(--accent-coral)', lineHeight: 1 }}>Chatify</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'center' }}>Real-time messaging beautifully designed</p>
          </div>

          {/* Header */}
          <div className="slide-in-right" style={{ marginBottom: '22px' }}>
            <h3 className="brand-font" style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '5px', textAlign: 'center', lineHeight: 1 }}>
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Get Started'}
              {mode === 'signup-otp' && 'Verify Email'}
              {mode === 'forgot' && 'Forgot Password'}
              {mode === 'forgot-otp' && 'Enter OTP & New Password'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {mode === 'login' && 'Log in to continue chatting.'}
              {mode === 'signup' && 'Create your free Chatify account.'}
              {mode === 'signup-otp' && `We sent a 6-digit code to ${email}`}
              {mode === 'forgot' && 'Enter your email to receive a reset code.'}
              {mode === 'forgot-otp' && `Enter the code sent to ${email} and set a new password.`}
            </p>
          </div>

          {/* Login / Signup tabs */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="slide-in-right" style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: '28px', padding: '4px', marginBottom: '22px', border: '1px solid var(--border-color)' }}>
              {['login', 'signup'].map((m) => (
                <button key={m} type="button" onClick={() => switchMode(m)}
                  style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '24px', backgroundColor: mode === m ? 'var(--bg-panel)' : 'transparent', color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: mode === m ? 700 : 500, fontSize: '0.92rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.25s ease', boxShadow: mode === m ? 'var(--shadow-sm)' : 'none' }}>
                  {m === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="slide-in-up" style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 500, marginBottom: '18px', textAlign: 'center' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="slide-in-up" style={{ padding: '12px 16px', backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 500, marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> {success}
            </div>
          )}

          {/* Form */}
          <form key={formKey} onSubmit={handleSubmit} className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── SIGNUP fields ── */}
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '7px' }}>Full Name</label>
                <AnimatedInput icon={User} type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required autoFocus />
              </div>
            )}

            {/* ── Email (all modes except otp steps after entry) ── */}
            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div>
                <label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '7px' }}>Email Address</label>
                <AnimatedInput icon={Mail} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            )}

            {/* ── Password ── */}
            {(mode === 'login' || mode === 'signup') && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => switchMode('forgot')} style={{ background: 'none', border: 'none', fontSize: '0.82rem', color: 'var(--accent-coral)', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'var(--font-sans)' }}>
                      Forgot Password?
                    </button>
                  )}
                </div>
                <AnimatedInput icon={Lock} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} showToggle />
              </div>
            )}

            {/* ── OTP Input ── */}
            {isOtpMode && (
              <div>
                <label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '12px', textAlign: 'center' }}>Enter 6-digit OTP</label>
                <OTPInput value={otp} onChange={setOtp} />
              </div>
            )}

            {/* ── New password on forgot-otp ── */}
            {mode === 'forgot-otp' && (
              <>
                <div>
                  <label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '7px' }}>New Password</label>
                  <AnimatedInput icon={Lock} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} showToggle />
                </div>
                <div>
                  <label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '7px' }}>Confirm Password</label>
                  <AnimatedInput icon={KeyRound} type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} showToggle />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button type="submit" disabled={loading || (isOtpMode && otp.trim().length < 6)} className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '24px', marginTop: '8px', opacity: (isOtpMode && otp.trim().length < 6) ? 0.6 : 1 }}>
              {loading ? (
                <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                  <Loader2 size={19} className="spin-loader" />
                  Please wait...
                </span>
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Send Verification Code'}
                  {mode === 'signup-otp' && 'Verify & Create Account'}
                  {mode === 'forgot' && 'Send Reset Code'}
                  {mode === 'forgot-otp' && 'Reset Password'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Resend OTP */}
            {isOtpMode && (
              <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                style={{ background: 'none', border: 'none', fontSize: '0.86rem', color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent-coral)', fontWeight: 600, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '4px 0', fontFamily: 'var(--font-sans)' }}>
                <RefreshCw size={14} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            )}

            {/* Back links */}
            {(isOtpMode || mode === 'forgot') && (
              <button type="button" onClick={() => switchMode(mode === 'forgot-otp' ? 'forgot' : 'signup')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '4px 0', fontFamily: 'var(--font-sans)' }}>
                <ArrowLeft size={16} />
                {mode === 'forgot' ? 'Back to Log In' : 'Change Email'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
