import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DocumentsRequest } from '../documents-request';
import { DocumentManagementService } from '../document-management.service';
import { AdditionalDocument } from '../additional-document';
import { OutstandingDocumentsDatasource } from './outstanding-documents.datasource';
import { Document } from '../document';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { ValidateEmail } from 'src/app/shared-utilities/validators/email.validator';
import { ValidatePhoneNumber } from 'src/app/shared-utilities/validators/phone-number.validator';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-popup-outstanding-documents',
  templateUrl: './popup-outstanding-documents.component.html',
  styleUrls: ['./popup-outstanding-documents.component.css']
})
export class PopupOutstandingDocumentsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  documents: Document[];
  form: FormGroup;
  documentTypes: DocumentType[];
  documentIds: number[];
  communicationMethodId = 1;
  test: DocumentsRequest;
  dataSource: OutstandingDocumentsDatasource;
  communicationType: number;
  // @Output() clicked  = new EventEmitter<string>();

  columnDefinitions: any[] = [
    { display: 'Document Type', def: 'documentTypeName', show: true },
    { display: 'Status', def: 'status', show: true },
  ];


  constructor(
    public dialogRef: MatDialogRef<PopupOutstandingDocumentsComponent>,
    private documentManagementService: DocumentManagementService,
    private readonly formBuilder: FormBuilder,
    private privateAppEventsManager: AppEventsManager,
    private alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataSource = new OutstandingDocumentsDatasource(privateAppEventsManager, alertService, documentManagementService);
  }

  top: string[] = [];

  ngOnInit() {
    this.createForm();
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.clearData();
    this.dataSource.loadData(this.data.documentRequest);
  }

  get isLoading(): boolean {
    return this.dataSource.isLoading;
  }

  get isError(): boolean {
    return this.dataSource.isError;
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  getDisplayedColumns(): any[] {
    return this.columnDefinitions.filter(cd => cd.show).map(cd => cd.def);
  }

  communicationTypeChanged($event: any) {
    this.communicationType = $event.value as number;
    this.setCommunicationValidators($event);
  }

  setCommunicationValidators(event: any) {
    this.form.get('emailAddress').setValidators([ValidateEmail]);
    switch (event.value) {
      case 1: // Email
        this.form.get('emailAddress').setValidators([Validators.required, ValidateEmail]);
        break;
      case 2: // Phone
        this.form.get('emailAddress').setValidators([Validators.required, ValidatePhoneNumber]);
        break;
      case 3: // SMS
        this.form.get('emailAddress').setValidators([Validators.required, ValidatePhoneNumber]);
        break;
      case 5: // Whats app
        this.form.get('emailAddress').setValidators([Validators.required, ValidatePhoneNumber]);
        break;
    }
    this.form.get('emailAddress').updateValueAndValidity();
  }

  send() {
    const additionalDocumentModel = this.readForm();
    this.dialogRef.close(additionalDocumentModel);
  }

  createForm() {
    this.form = this.formBuilder.group({
      emailAddress: new FormControl('', [Validators.required, ValidateEmail]),
      communicationMethod: new FormControl('')
    });
  }

  readForm() {
    this.form.disable();
    const formModel = this.form.value;
    const additionalDocumentModel = new AdditionalDocument();
    additionalDocumentModel.documentTypeIds = [];
    additionalDocumentModel.claimId = this.data.documentRequest.personEventId;
    additionalDocumentModel.email = formModel.emailAddress as string;
    this.dataSource.documents.forEach(a => additionalDocumentModel.documentTypeIds.push(a.docTypeId));
    additionalDocumentModel.documentSet = this.data.documentRequest.documentSet;
    additionalDocumentModel.keys = this.data.documentRequest.keys;
    additionalDocumentModel.system = this.data.documentRequest.system;
    additionalDocumentModel.communicationType = this.communicationMethodId;
    return additionalDocumentModel;
  }

}
