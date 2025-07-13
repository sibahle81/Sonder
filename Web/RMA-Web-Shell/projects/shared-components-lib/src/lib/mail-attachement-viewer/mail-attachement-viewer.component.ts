import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'mail-attachement-viewer',
  templateUrl: './mail-attachement-viewer.component.html',
  styleUrls: ['./mail-attachement-viewer.component.css']
})
export class MailAttachementViewerComponent implements OnChanges {

  @Input() mailAttachment: MailAttachment;
  @Output() objectUrlEmit: EventEmitter<string> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  safeResourceUrl: SafeResourceUrl;
  objectUrl: string;

  constructor(
    private readonly domSanitizer: DomSanitizer,
    private readonly alert: ToastrManager
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.mailAttachment) {
      this.isLoading$.next(true);
      this.handleDocument();
    }
  }

  handleDocument() {
    if (this.mailAttachment.attachmentByteData && this.mailAttachment.fileType) {
      try {
        const byteArray = this.base64ToUint8Array(this.mailAttachment.attachmentByteData);
        const blob = new Blob([byteArray], { type: this.mailAttachment.fileType });
        this.objectUrl = URL.createObjectURL(blob);
        this.safeResourceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);

        this.objectUrlEmit.emit(this.objectUrl);

        this.isLoading$.next(false);
      } catch (error) {
        this.alert.errorToastr('Error creating blob or object URL');
        this.isLoading$.next(false);
      }
    } else {
      this.alert.errorToastr('Invalid mail attachment data');
      this.isLoading$.next(false);
    }
  }

  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
