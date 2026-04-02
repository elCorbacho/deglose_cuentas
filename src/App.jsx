import { useState, useMemo } from 'react'
import FileUpload from './components/FileUpload.jsx'
import DateFilter from './components/DateFilter.jsx'
import CategoryList from './components/CategoryList.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import { extractText } from './lib/pdfParser.js'
import { parse } from './lib/transactionExtractor.js'
import { categorize } from './lib/categorizer.js'
import { group } from './lib/aggregator.js'
import { parseDate } from './lib/formatters.js'

export default function App() {
  const [rawTransactions, setRawTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [fileName, setFileName] = useState('')

  const handleFile = async (file) => {
    setLoading(true)
    setError('')
    setFileName(file.name)
    try {
      const text = await extractText(file)
      // Save extracted text for debugging
      window.__extractedText = text
      console.log('=== PDF TEXT EXTRACTED (first 3000 chars) ===')
      console.log(text.slice(0, 3000))
      console.log('=== END ===')
      const transactions = parse(text)
      if (transactions.length === 0) {
        setError('No se encontraron transacciones en el PDF.')
        setRawTransactions([])
      } else {
        const categorized = categorize(transactions)
        setRawTransactions(categorized)
      }
    } catch (err) {
      console.error('PDF Error:', err)
      setError(`Error al procesar el PDF: ${err.message}. Verifica que sea un estado de cuenta Santander.`)
      setRawTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = useMemo(() => {
    if (!desde && !hasta) return rawTransactions
    return rawTransactions.filter(tx => {
      const txDate = parseDate(tx.fecha)
      if (desde && txDate < new Date(desde)) return false
      if (hasta && txDate > new Date(hasta)) return false
      return true
    })
  }, [rawTransactions, desde, hasta])

  const { categories, grandTotal } = useMemo(
    () => group(filteredTransactions),
    [filteredTransactions]
  )

  console.log('=== APP: categories:', categories)
  console.log('=== APP: grandTotal:', grandTotal)

  return (
    <div className="min-h-screen bg-gray-50">
      <SummaryBar total={grandTotal} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Deglose de Cuentas
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Sube tu estado de cuenta Santander para ver tus gastos categorizados.
        </p>

        {rawTransactions.length === 0 && !loading && (
          <FileUpload onFileLoaded={handleFile} />
        )}

        {loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full mb-3"></div>
            <p>Procesando PDF...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {rawTransactions.length > 0 && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  📄 {fileName} — {rawTransactions.length} transacciones encontradas
                </p>
              </div>
              <button
                onClick={() => { setRawTransactions([]); setFileName(''); setDesde(''); setHasta('') }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Cargar otro PDF
              </button>
            </div>

            <DateFilter
              desde={desde}
              hasta={hasta}
              onDesdeChange={setDesde}
              onHastaChange={setHasta}
            />

            <CategoryList categories={categories} />
          </div>
        )}
      </main>
    </div>
  )
}
