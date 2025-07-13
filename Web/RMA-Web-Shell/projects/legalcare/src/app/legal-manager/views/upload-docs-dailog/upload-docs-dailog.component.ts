import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-upload-docs-dailog',
  templateUrl: './upload-docs-dailog.component.html',
  styleUrls: ['./upload-docs-dailog.component.css']
})
export class UploadDocumentDialogComponent implements OnInit {

  base64File: any = null;
  filename: any = null;

  constructor() { }

  ngOnInit(): void {
  }

  onFileSelect(e: any): void {
    try {
      const file = e.target.files[0];
      const fReader = new FileReader()
      fReader.readAsDataURL(file)
      fReader.onloadend = (_event: any) => {
        this.filename = file.name;
        this.base64File = _event.target.result;
      }
    } catch (error) {
      this.filename = null;
      this.base64File = null;
    }
  }

}



