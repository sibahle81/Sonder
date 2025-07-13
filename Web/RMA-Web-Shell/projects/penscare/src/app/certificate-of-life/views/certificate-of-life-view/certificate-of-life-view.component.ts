import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-certificate-of-life-view',
  templateUrl: './certificate-of-life-view.component.html',
  styleUrls: ['./certificate-of-life-view.component.css']
})
export class CertificateOfLifeViewComponent implements OnInit {
  loadedTab = 'teba-sftp-file-request-list';
  isLoading = false;

  constructor() { }

  ngOnInit(): void {
  }

  loadCerticateOfLifeList() {
    this.loadedTab = 'certificate-of-life-list';
  }

  loadTebaFiles() {
    this.loadedTab = 'certificate-of-life-vendor-documents';
  }

  loadTebaSftpFileRequestList(){
  this.loadedTab = 'teba-sftp-file-request-list';
  }

  close() {

  }

}


