import * as pdfjsLib from 'pdfjs-dist';

// Worker must be specified in pdfjs-dist v5+
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export async function extractText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Add space between items to preserve column separation
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .filter(Boolean)
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n');
}
