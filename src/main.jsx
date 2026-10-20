
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldCheck,
  Clock3
} from 'lucide-react';
import './styles.css';

const DEMO_USERNAME = 'meow';
const DEMO_PASSWORD = '1234';
const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 30_000;
const STORAGE_KEY = 'fardad-network-security-demo';

function readState() {
  try {
    const state = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '{}'
    );

    return {
      attempts:
        Number.isInteger(state.attempts) && state.attempts >= 0
          ? Math.min(state.attempts, MAX_ATTEMPTS)
          : 0,
      lockedUntil: Number.isFinite(state.lockedUntil)
        ? state.lockedUntil
        : 0,
    };
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function App() {
  const initial = readState();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(initial.attempts);
  const [lockedUntil, setLockedUntil] = useState(initial.lockedUntil);
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState('');

  const isLocked = lockedUntil > now;
  const secondsLeft = Math.max(
    0,
    Math.ceil((lockedUntil - now) / 1000)
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ attempts, lockedUntil })
    );
  }, [attempts, lockedUntil]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setNow(Date.now()),
      250
    );

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lockedUntil && lockedUntil <= now) {
      setLockedUntil(0);
      setAttempts(0);
      setMessage('زمان قفل تمام شد؛ دوباره تلاش کنید.');
    }
  }, [lockedUntil, now]);

  function handleSubmit(event) {
    event.preventDefault();

    if (isLocked) return;

    if (
      username.trim() === DEMO_USERNAME &&
      password === DEMO_PASSWORD
    ) {
      setMessage('ورود آزمایشی موفق بود.');
      setAttempts(0);
      setLockedUntil(0);
      setPassword('');
      return;
    }

    const next = attempts + 1;
    setPassword('');

    if (next >= MAX_ATTEMPTS) {
      setAttempts(MAX_ATTEMPTS);
      setLockedUntil(Date.now() + LOCK_DURATION_MS);
      setMessage('سه تلاش ناموفق؛ ورود برای ۳۰ ثانیه قفل شد.');
    } else {
      setAttempts(next);
      setMessage(
        `اطلاعات ورود اشتباه است؛ ${MAX_ATTEMPTS - next} تلاش باقی مانده.`
      );
    }
  }

  function resetDemo() {
    setAttempts(0);
    setLockedUntil(0);
    setUsername('');
    setPassword('');
    setMessage('دمو بازنشانی شد.');
    setNow(Date.now());
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <main className="page">
      <section className="layout">

        <aside className="intro">
          <div className="crest">
            <ShieldCheck size={34} strokeWidth={1.7} />
          </div>

          <p className="course-label">پروژه درس</p>
          <h1>امنیت شبکه</h1>
          <h2>استاد فرداد</h2>

          <div className="rule" />

          <p className="designer-label">طراح و پیاده‌ساز</p>
          <p className="designer-name">پویا صمیمی</p>
        </aside>

        {/* سمت چپ: فرم ورود */}
        <section className="login-panel" aria-label="فرم ورود">
          <div className="panel-heading">
            <div className="panel-icon">
              <LockKeyhole size={22} />
            </div>

            <div>
              <h3>ورود به سامانه</h3>
              <p style={{ display: 'none' }}>نام کاربری و رمز عبور را وارد کنید</p>
            </div>
          </div>

          {isLocked && (
            <div className="lock-message">
              <Clock3 size={19} />
              <span>ورود موقتاً قفل است</span>
              <strong>
                ۰۰:{String(secondsLeft).padStart(2, '0')}
              </strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">نام کاربری</label>

            <div className="input-box">
              <UserRound size={18} />

              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نام کاربری"
                autoComplete="username"
                disabled={isLocked}
                required
              />
            </div>

            <label htmlFor="password" className="password-label">
              رمز عبور
            </label>

            <div className="input-box">
              <LockKeyhole size={18} />

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور"
                autoComplete="current-password"
                disabled={isLocked}
                required
              />

              <button
                type="button"
                className="eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'
                }
              >
                {showPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />}
              </button>
            </div>

            <div className="attempts">
              <span>تلاش‌های ناموفق</span>

              <div className="dots">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={i < attempts ? 'dot used' : 'dot'}
                  />
                ))}
              </div>

              <strong>{attempts} از {MAX_ATTEMPTS}</strong>
            </div>

            {message && (
              <p
                className={`message ${message.includes('موفق')
                  ? 'success'
                  : message.includes('اشتباه') ||
                    message.includes('قفل')
                    ? 'error'
                    : ''
                  }`}
                role="status"
              >
                {message}
              </p>
            )}

            <button
              className="submit"
              type="submit"
              disabled={isLocked}
            >
              {isLocked ? (
                <>
                  <Clock3 size={18} />
                  قفل شده · {secondsLeft} ثانیه
                </>
              ) : (
                <>
                  <LockKeyhole size={18} />
                  ورود
                </>
              )}
            </button>
          </form>

          <button
            className="reset"
            type="button"
            onClick={resetDemo}
          >
            <RotateCcw size={16} />
            ریست
          </button>
        </section>
      </section>

      <footer className='made'>Made by Pooya Samimi</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
