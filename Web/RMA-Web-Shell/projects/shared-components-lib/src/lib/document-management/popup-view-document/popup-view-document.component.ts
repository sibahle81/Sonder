import { Component, OnInit, Inject,OnChanges, Input, Output, EventEmitter, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl , UntypedFormGroup, UntypedFormBuilder} from '@angular/forms';
import { DocumentType } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/document-type.model';
import { DocumentsRequest } from '../documents-request';
import { DocumentManagementService } from '../document-management.service';
import { AdditionalDocument } from '../additional-document';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'app-popup-view-document',
  templateUrl: './popup-view-document.component.html',
  styleUrls: ['./popup-view-document.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class PopupViewDocumentComponent implements OnInit {
  form: UntypedFormGroup;
  documentTypes: DocumentType[];
  documentIds: number[];
  communicationMethodId = 1;
  test: DocumentsRequest;
  source: Uint8Array;
  sourceData: any;

  @Output('error') onError = new EventEmitter<any>();

  constructor(
    public dialogRef: MatDialogRef<PopupViewDocumentComponent>,
    private documentManagementService: DocumentManagementService,
    private readonly formBuilder: UntypedFormBuilder,
    private privateAppEventsManager: AppEventsManager,
    private sanitizer: DomSanitizer,
    private httpClient: HttpClient,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    }
    fileSource: SafeResourceUrl;
    top: string[] = [];

    ngOnInit() {
        this.fileSource = '';

        var documentDetails = this.data;
        console.log(documentDetails);
        //this.getData(documentDetails);
        this.getDataPDF(documentDetails);
    }


    getData(documentDetails: any){
        //this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl('http://www.africau.edu/images/default/sample.pdf');
        // this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);

        const byteCharacters = atob(documentDetails.documentRequest.fileAsBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob: any = new Blob([byteArray], {type: documentDetails.documentRequest.mimeType});

        if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE
            window.navigator.msSaveOrOpenBlob(blob, documentDetails.documentRequest.fileName);
            // window.navigator.msSaveOrOpenBlob(blob, documentDetails.fileName);
          } else { //Chrome & Firefox
            //const a = document.createElement('a');
            const url = window.URL.createObjectURL(blob);
            this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          }
    }
    
    getDataPDF(documentDetails: any){
        //this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl('http://www.africau.edu/images/default/sample.pdf');
        // this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl);

        const byteCharacters = atob(documentDetails.documentRequest.fileAsBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob: any = new Blob([byteArray], {type: documentDetails.documentRequest.mimeType});
        if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE
            window.navigator.msSaveOrOpenBlob(blob, documentDetails.documentRequest.fileName);
            // window.navigator.msSaveOrOpenBlob(blob, documentDetails.fileName);
          } else { //Chrome & Firefox
            //const a = document.createElement('a');
            const url = window.URL.createObjectURL(blob);
            //a.href = url;
            // a.download = documentDetails.documentRequest.fileName;
            // a.click();
            this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            // window.URL.revokeObjectURL(url);
            // a.remove();           
          }
    }

    onNoClick(): void {
    this.dialogRef.close(null);
  }

}