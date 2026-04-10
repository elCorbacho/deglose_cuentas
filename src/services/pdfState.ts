/**
 * PDF State Persistence Service
 * 
 * Handles persistence of PDF-related state (rawTransactions and fileName)
 * across configuration saves and page reloads using localStorage/sessionStorage fallback.
 */

const STORAGE_KEY = 'pdfState'
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // ~5MB limit

/**
 * Determines which storage mechanism is available
 * @returns {'localStorage' | 'sessionStorage' | null}
 */
function getAvailableStorage() {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return 'localStorage'
  } catch (e) {
    // localStorage not available
  }

  try {
    const testKey = '__storage_test__'
    sessionStorage.setItem(testKey, testKey)
    sessionStorage.removeItem(testKey)
    return 'sessionStorage'
  } catch (e) {
    // sessionStorage also not available
  }

  return null
}

/**
 * Safely get storage instance
 * @returns {Storage|null}
 */
function getStorage(): Storage | null {
  const storageType = getAvailableStorage()
  if (!storageType) return null
  return storageType === 'localStorage' ? localStorage : sessionStorage
}

/**
 * Validate rawTransactions data structure
 * @param {any} data - Data to validate
 * @returns {boolean} - True if valid
 */
function isValidTransactions(data: unknown): data is PdfState['rawTransactions'] {
  if (!Array.isArray(data)) return false
  // Check first few items to validate structure
  const sampleSize = Math.min(data.length, 5)
  for (let i = 0; i < sampleSize; i++) {
    const item = data[i]
    if (typeof item !== 'object' || item === null) return false
    // Must have at least fecha and monto properties
    if (!('fecha' in item) || !('monto' in item)) return false
  }
  return true
}

/**
 * Validate fileName
 * @param {any} name - Name to validate
 * @returns {boolean} - True if valid string
 */
function isValidFileName(name: unknown): name is string {
  return typeof name === 'string' && name.length > 0 && name.length <= 255
}

/**
 * Check if data would exceed storage limits
 * @param {string} data - JSON stringified data
 * @returns {boolean} - True if exceeds limit
 */
function exceedsStorageLimit(data: string): boolean {
  return data.length > MAX_STORAGE_SIZE
}

/**
 * Save PDF state to storage
 * @param {Object} state - State to save { rawTransactions, fileName }
 * @returns {{ success: boolean, warning?: string }}
 */
export function savePdfState(state: Partial<PdfState>): SavePdfStateResult {
  const storage = getStorage()
  
  if (!storage) {
    console.warn('PDF state persistence: No storage available')
    return { success: false }
  }

  try {
    const { rawTransactions, fileName } = state

    // Validate inputs
    if (rawTransactions !== undefined && !isValidTransactions(rawTransactions)) {
      console.warn('PDF state persistence: Invalid rawTransactions format')
      return { success: false }
    }

    if (fileName !== undefined && !isValidFileName(fileName)) {
      console.warn('PDF state persistence: Invalid fileName format')
      return { success: false }
    }

    // Check size before saving
    const jsonData = JSON.stringify(state)
    if (exceedsStorageLimit(jsonData)) {
      console.warn('PDF state persistence: Data exceeds storage limit (~5MB)')
      return { success: false, warning: 'Data too large for persistence' }
    }

    storage.setItem(STORAGE_KEY, jsonData)
    return { success: true }

  } catch (error) {
    console.error('PDF state persistence: Save failed:', error)
    // Quota exceeded or other error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      return { success: false, warning: 'Storage quota exceeded' }
    }
    return { success: false }
  }
}

/**
 * Load PDF state from storage
 * @returns {{ rawTransactions: array, fileName: string }|null}
 */
export function loadPdfState(): PdfState | null {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  try {
    const stored = storage.getItem(STORAGE_KEY)
    
    if (!stored) {
      return null
    }

    const state = JSON.parse(stored) as Partial<PdfState>

    // Validate loaded data
    if (state.rawTransactions !== undefined && !isValidTransactions(state.rawTransactions)) {
      console.warn('PDF state persistence: Corrupted transactions data, clearing...')
      clearPdfState()
      return null
    }

    if (state.fileName !== undefined && !isValidFileName(state.fileName)) {
      console.warn('PDF state persistence: Corrupted fileName data, clearing...')
      clearPdfState()
      return null
    }

    // Return only valid properties
    return {
      rawTransactions: state.rawTransactions || [],
      fileName: state.fileName || ''
    }

  } catch (error) {
    console.warn('PDF state persistence: Load failed, clearing corrupted data:', error)
    clearPdfState()
    return null
  }
}

/**
 * Clear PDF state from storage
 */
export function clearPdfState() {
  const storage = getStorage()
  if (storage) {
    storage.removeItem(STORAGE_KEY)
  }
}

/**
 * Check if PDF state exists in storage
 * @returns {boolean}
 */
export function hasPdfState() {
  const storage = getStorage()
  if (!storage) return false
  
  try {
    return storage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}
import type { PdfState, SavePdfStateResult } from '../types'
