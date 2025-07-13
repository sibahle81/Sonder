import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import * as saveAs from 'file-saver';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  templateUrl: './mail-attachement-viewer-dialog.component.html',
  styleUrls: ['./mail-attachement-viewer-dialog.component.css']
})

export class MailAttachementViewerDialogComponent {

  mailAttachment: MailAttachment;
  objectUrl: string;

  supportedDocumentTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];

  constructor(
    public dialogRef: MatDialogRef<MailAttachementViewerDialogComponent>,
    private readonly alert: ToastrManager,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mailAttachment = data.mailAttachment;
  }

  download() {
    if (this.mailAttachment) {
      const byteCharacters = atob(this.mailAttachment.attachmentByteData);

      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const b: any = new Blob([byteArray], { type: this.mailAttachment.fileType });

      saveAs(b, this.mailAttachment.fileName);
    }
  }

  openInNewTab() {
    if(!this.supportedDocumentTypes.includes(this.mailAttachment.fileType)) 
    {
      this.alert.infoToastr('only pdf, jpg, png & plain text documents are supported when opening in a new tab');
      return;
    }

    if (this.objectUrl) {
      window.open(this.objectUrl, '_blank');
    }
  }

  setObjectUrl($event: string) {
    this.objectUrl = $event;
  }

  cancel() {
    this.dialogRef.close();
  }
}
