import * as pdfjsLib from 'pdfjs-dist'

// Worker must be specified in pdfjs-dist v5+
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

/**
 * Extracts raw text from all pages of a PDF file.
 * @param {File} file - PDF file from input
 * @returns {Promise<string>} concatenated text from all pages
 */
export async function extractText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise

  const textParts = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // Add space between items to preserve column separation
    const pageText = content.items.map(item => item.str).join(' ')
    textParts.push(pageText)
  }

  return textParts.join('\n')
}
