import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set the worker source for pdf.js
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PdfParser = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText.trim();
}

export default PdfParser;