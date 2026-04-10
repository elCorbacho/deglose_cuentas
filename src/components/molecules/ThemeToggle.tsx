/**
 * ThemeToggle Molecule
 * Switch between light and dark mode
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21c9.504 0 9.996-10.002 9.002-9.998Z" />
  </svg>
)

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('deglose-theme')
    if (stored) {
      setTheme(stored)
      document.documentElement.setAttribute('data-theme', stored)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('deglose-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="theme-icon-wrapper theme-icon--active"
          style={{ display: 'flex' }}
        >
          {theme === 'light' ? <SunIcon /> : <MoonIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
