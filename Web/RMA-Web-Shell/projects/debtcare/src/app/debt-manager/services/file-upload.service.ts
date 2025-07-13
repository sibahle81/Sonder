import { Injectable } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';
import { Observable, ReplaySubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  async generatePdfWithSignature(pdfData: Uint8Array, imageDataUrl: string, pageIndex: number): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfData);
    for (let i = 0; i < pdfDoc.getPages().length; i++){
      const page = pdfDoc.getPages()[i];
      const base64Data = imageDataUrl.split(',')[1];
      const signatureImageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      page.drawImage(signatureImage, {
        x: 500,
        y: 75,
        width: 100,
        height: 50,
        opacity: 0.5, 
      });
    }
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

getBase64Format(file : File) : Observable<string>{
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

}
