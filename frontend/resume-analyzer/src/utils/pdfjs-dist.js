import { getDocument } from "pdfjs-dist";

const PdfParser = async (file) => {
    const pdf = await getDocument(file).promise;
    
    console.log("pdf pages: ", pdf.numPages);

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = page.getTextContent();
        console.log(textContent);
    }
}

export default PdfParser;