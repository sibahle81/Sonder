import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { I, T } from '@angular/cdk/keycodes';
import { PolicyNote } from 'projects/shared-models-lib/src/lib/policy/policy-note';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { UploadControlComponent } from 'projects/shared-components-lib/src/lib/upload-control/upload-control.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { QlinkTransaction } from '../../shared/entities/qlink-transaction';
import { QlinkResult } from '../../shared/entities/qlink-result';
import { QlinkRequest } from '../../shared/entities/qlink-request';
import { DocumentManagementService } from 'projects/shared-components-lib/src/lib/document-management/document-management.service';
import { HttpErrorResponse } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { Document } from 'projects/shared-components-lib/src/lib/document-management/document';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { QLinkTransactionTypeEnum } from 'projects/shared-models-lib/src/lib/enums/qlink-transaction-type-enum';
import { QlinkProcessResult } from '../../shared/entities/qlink-process-result';
import { DatePipe } from '@angular/common';
import { QLinkStatusCodeEnum } from 'projects/shared-models-lib/src/lib/enums/qLink-status-code-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { Constants } from 'projects/claimcare/src/app/constants';
import { Policy } from '../../shared/entities/policy';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';


@Component({
  selector: 'app-manual-qadd',
  templateUrl: './manual-qadd.component.html',
  styleUrls: ['./manual-qadd.component.css']
})
export class ManualQaddComponent implements OnInit {
  @ViewChild('uploadControl', { static: true }) uploadControlComponent: UploadControlComponent;
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;

  @Input() policyNumber: string;

  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }

    if (this.processDataSource) {
      this.processDataSource.paginator = value;
    }
  }

  constructor(
    private policyService: PolicyService,
    private readonly alertService: AlertService,
    private readonly documentManagementService: DocumentManagementService,
    readonly authService: AuthService
  ) { }

  bulkPolicies = false;
  policyNumbers: string[] = [];
  qlinkRequest: QlinkRequest = new QlinkRequest();
  listOfPolicies: string = '';
  selectedOption: string;
  selectedDeduction: string;
  policyId: number = 0;
  policyNote: PolicyNote = new PolicyNote();
  isLoading: boolean = false;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  policyNoteText: string = '';
  searchResults: any[];
  showSearchResults: boolean = false;
  showProcesshResults: boolean = false;
  placeHolder = 'Enter Policy Number';
  notePlaceHolder = 'Please add a note';
  dataSource = new MatTableDataSource<any>();
  processDataSource = new MatTableDataSource<any>();
  qlinkTransactions: QlinkTransaction[] = [];
  qlinkTableData: QlinkResult[] = [];
  qlinkProcessTableData: QlinkProcessResult[] = [];
  disabled = false;
  hasList = false;
  selectedFile: File | null = null;
  csvContent: string | null = null;
  bulkPolicyNumbers: string[] = [];
  policy: Policy;
  bulkSubmitProcess: boolean = true;
  isProcessing: boolean = false;
  isValidSumbittion: boolean = false;
  allowQlinkProcess: boolean = false;

  createNewPolicy = false;
  errorMessage: string[] = [];

  ngOnInit() {
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.selectedFile = file;
    if (file) {
      this.readCsvData(file);
    }
  }

  readCsvData(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const text: string = reader.result?.toString() || '';
      this.csvContent = text;
      const lines: string[] = this.csvContent.split(/\r?\n/).filter((c: string) => c !== '');
      this.bulkPolicyNumbers = lines;
    };
    reader.readAsText(file);
  }

  search(): void {
    this.qlinkTableData = [];
    this.isLoading = true;
    this.showProcesshResults = false;
    if (!this.bulkPolicies) {
      if (this.policyNumber) {
        this.policyService.getSuccessfulQLinkTransactions(this.policyNumber)
          .subscribe(
            (result) => {
              result.forEach((item: QlinkTransaction) => {
                try {
                  const responseObject = JSON.parse(item.response);
                  const amount = responseObject.Amount;
                  var transactionType = responseObject.TransactionType;

                  const tableData = new QlinkResult();

                  if ((transactionType === QLinkTransactionTypeEnum.QADD) ||
                    (transactionType === QLinkTransactionTypeEnum.QAFA) ||
                    (transactionType === QLinkTransactionTypeEnum.QUPD) ||
                    (transactionType === QLinkTransactionTypeEnum.QAFU) ||
                    (transactionType === QLinkTransactionTypeEnum.QANA) ||
                    (transactionType === QLinkTransactionTypeEnum.QANU)) {
                    const startDate = this.convertStringToDate(responseObject.StartDate);
                    tableData.deductionStartDate = startDate;
                    tableData.deductionEndDate = null;
                  }
                  else {
                    const deductionEndDate = this.convertStringToDate(responseObject.EndDate);
                    tableData.deductionStartDate = null;
                    tableData.deductionEndDate = deductionEndDate;
                  }

                  tableData.premiumAmount = amount;
                  tableData.statusCode = item.statusCode;
                  tableData.policyNumber = item.policyNumber;
                  tableData.installmentPremium = item.policyPremium;
                  tableData.createdDate = item.createdDate;
                  tableData.qlinkType = this.mapQlinkTypeToEnumString(Number(responseObject.TransactionType));
                  tableData.policyStatus = this.getPolicyStatus(Number(item.policyStatus))
                  this.qlinkTableData.push(tableData);
                  this.isLoading = false;
                } catch (error) {
                  this.alertService.error(`Error fetching QLink transactions: ${error}`, 'Search failed');
                }
              });
              if (this.qlinkTableData.length !== 0)
                this.policyService.getNewPolicyByNumber(this.policyNumber).subscribe(searchResult => {
                  this.policy = searchResult;
                  this.alertService.success('Search completed successfully', 'Search complete');
                  this.dataSource.data = this.qlinkTableData;
                  this.showSearchResults = true;
                  this.isLoading = false;

                });

            },
            (error) => {
              this.alertService.error(`Error fetching QLink transactions: ${error}`, 'Search failed');
            }
          );
      }
    }
    else {
      this.isLoading = true;
      this.bulkPolicyNumbers.forEach(policyNumber => {
        this.policyService.getSuccessfulQLinkTransactions(policyNumber)
          .subscribe(
            (result) => {
              result.forEach((item: QlinkTransaction) => {
                try {
                  const responseObject = JSON.parse(item.response);
                  const amount = responseObject.Amount;
                  var transactionType = responseObject.TransactionType;
                  const tableData = new QlinkResult();

                  if ((transactionType === QLinkTransactionTypeEnum.QADD) ||
                    (transactionType === QLinkTransactionTypeEnum.QAFA) ||
                    (transactionType === QLinkTransactionTypeEnum.QUPD) ||
                    (transactionType === QLinkTransactionTypeEnum.QAFU) ||
                    (transactionType === QLinkTransactionTypeEnum.QANA) ||
                    (transactionType === QLinkTransactionTypeEnum.QANU)) {
                    const startDate = this.convertStringToDate(responseObject.StartDate);
                    tableData.deductionStartDate = startDate;
                    tableData.deductionEndDate = null;
                  }
                  else {
                    const deductionEndDate = this.convertStringToDate(responseObject.EndDate);
                    tableData.deductionStartDate = null;
                    tableData.deductionEndDate = deductionEndDate;
                  }

                  tableData.premiumAmount = amount;
                  tableData.statusCode = item.statusCode;
                  tableData.policyNumber = item.policyNumber;
                  tableData.installmentPremium = item.policyPremium;
                  tableData.createdDate = item.createdDate;
                  tableData.qlinkType = this.mapQlinkTypeToEnumString(Number(responseObject.TransactionType));
                  tableData.policyStatus = this.getPolicyStatus(Number(item.policyStatus))
                  this.qlinkTableData.push(tableData);
                } catch (error) {
                }
                finally {
                  this.isLoading = false;
                }
              });
              this.dataSource.data = this.qlinkTableData;
              this.showSearchResults = true;
            },
            (error) => {
              this.isLoading = false;
            }
          );
      });
      this.alertService.success('Search completed successfully', 'Search complete');
    }
  }

  processQadds(): void {
    this.qlinkProcessTableData = [];
    this.isLoading = true;
    this.isProcessing = true;
    try {
      if (this.selectedOption === 'update' || this.selectedOption === 'activate' || this.selectedOption === 'cancel') {
        this.showSearchResults = true;
        this.qlinkRequest.qLinkTransactionType = QLinkTransactionTypeEnum.QADD;

        if (this.selectedOption === 'update') {
          this.qlinkRequest.qLinkTransactionType = QLinkTransactionTypeEnum.QUPD;
        }

        if (this.selectedOption === 'cancel') {
          this.qlinkRequest.qLinkTransactionType = QLinkTransactionTypeEnum.QDEL;
        }

        if (!this.bulkPolicies) {
          this.policyNumbers = this.policyNumber.split(',');
          this.qlinkRequest.policyNumbers = this.policyNumbers;
          if (this.qlinkRequest.qLinkTransactionType === QLinkTransactionTypeEnum.QDEL) {
            if (this.checkIfStatusAllowsForQdel(this.getLastDigits(this.policyNumber)) == false) {
              this.alertService.error('Policy Status must be Pending Cancelled OR Cancelled', 'Cannot process QDEL');
              this.isLoading = false;
              this.showProcesshResults = false;
              return;
            }
          }

          this.policyService.processManualQadds(this.qlinkRequest)
            .subscribe(
              (result) => {
                try {
                  if (result == null || result.length === 0) {
                    this.alertService.error('No response from Qlink for request: ' + this.qlinkRequest, 'Cannot process');
                    this.isLoading = false;
                    this.showProcesshResults = false;

                    return;
                  }
                  result.forEach(item => {
                    this.policyId = item.itemId;
                    if (item.statusCode == QLinkStatusCodeEnum.Unavailable) {
                      this.alertService.error('Please note that the QLink service is currently unavailable', 'System unavailable');
                      this.isLoading = false;
                      this.showProcesshResults = false;
                      return;
                    }
                    if (this.policyId > 0) {
                      this.policyNote.policyId = this.policyId
                      const processResponseObject = JSON.parse(item.response);

                      if (!isNaN(this.policyNote.policyId) && processResponseObject != null) {

                        this.policyNote.text = this.policyNoteText;
                        this.policyNote.createdBy = this.authService.getUserEmail();
                        this.policyNote.modifiedBy = this.authService.getUserEmail();
                        this.policyNote.isDeleted = false;
                        this.policyNote.createdDate = new Date();
                        this.policyNote.modifiedDate = new Date();;

                        const processTableData = new QlinkProcessResult();
                        processTableData.policyNumber = this.policyNumber;
                        processTableData.message = processResponseObject.Message;
                        this.qlinkProcessTableData.push(processTableData);
                        this.processDataSource.data = this.qlinkProcessTableData;

                        if (item.statusCode === QLinkStatusCodeEnum.Success) {
                          this.addNote();
                        }

                        this.alertService.success('Processing completed successfully', 'Process complete');

                        this.showProcesshResults = true;
                        this.isLoading = false;

                      } else {
                        this.alertService.error('PolicyId is not a valid number', 'Warning');
                        this.isLoading = false;
                      }
                    }
                  });
                } catch (error) {
                  this.alertService.error(`Error processing result: ${error}`, 'Error');
                  this.isLoading = false;
                  this.showProcesshResults = false;
                }
              },
              (error) => {
                this.alertService.error(`Error processing result: ${error}`, 'Error');
                this.isLoading = false;
                this.showProcesshResults = false;
              }
            );
        } else {
          if (this.bulkPolicyNumbers && this.bulkPolicyNumbers.length > 0) {
            this.bulkPolicyNumbers.forEach((policy) => {
            });

            if (!this.bulkSubmitProcess) {
              this.alertService.clear();
              this.alertService.error('Policies do not confirm bulk Qlink submission', 'Cannot process Qlink');
              this.isLoading = false;
              this.showProcesshResults = false;
            }
            else {
              this.qlinkRequest.policyNumbers = this.bulkPolicyNumbers;
              this.policyService.processManualQadds(this.qlinkRequest)
                .subscribe(result => {
                  result.forEach((item) => {
                    this.policyId = item.itemId;
                    if (this.policyId > 0) {
                      this.policyNote.policyId = Number(item.itemId);
                      const processResponseObject = JSON.parse(item.response);

                      if (item.statusCode === QLinkStatusCodeEnum.Success) {
                        if (!isNaN(this.policyNote.policyId) && processResponseObject != null) {
                          this.policyNote.text = this.policyNoteText;
                          this.policyNote.createdBy = this.authService.getUserEmail();
                          this.policyNote.modifiedBy = this.authService.getUserEmail();
                          this.policyNote.isDeleted = false;
                          this.policyNote.createdDate = new Date();
                          this.policyNote.modifiedDate = new Date();
                          this.addNote();
                        }
                      }
                      this.save();
                      const processTableData = new QlinkProcessResult();
                      processTableData.policyNumber = this.qlinkRequest.policyNumbers.filter(f => f.includes(item.itemId))[0];
                      processTableData.message = processResponseObject.Message;
                      this.qlinkProcessTableData.push(processTableData);
                      this.processDataSource.data = this.qlinkProcessTableData;
                      this.showProcesshResults = true;
                    }
                  });

                  this.dataSource.data = this.qlinkTableData;
                  this.showSearchResults = false;
                  this.isLoading = false;
                  this.showProcesshResults = true;
                  this.isProcessing = false;

                }, (error) => {
                  this.alertService.error(`${error}`, 'Error adding policy note');
                  this.isLoading = false;
                });
            }
          }
        }
      }
    } catch (error) {
      this.reloadPage();
      this.alertService.error(`${error}`, 'Error processing result');
      this.isLoading = false;
    }
  }

  addNote(): void {
    this.policyService.addPolicyNote(this.policyNote)
      .subscribe((response) => {
        this.alertService.success('Policy Note added successfully', 'Success');
      }, (error) => {
        this.alertService.error(`${error}`, 'Error adding policy note');
      });
  }

  getSuccessfulQlinkTransactions(policyNumber: string): void {
    this.policyService.getSuccessfulQLinkTransactions(policyNumber)
      .subscribe((response) => {
        this.alertService.success('Qlink Transactions fetched successfully', 'Success');
      }, (error) => {
        this.alertService.error(`${error}`, 'Error when fetching qlink transactions');
      });
  }

  onSelectionChange(): void {

    this.allowQlinkProcess = true;
    if (this.selectedOption === 'cancel' && !this.bulkPolicies && this.policy !== null) {
      this.doSingleQDelTransactionValidation();
    }
    if (this.selectedOption !== 'cancel' && !this.bulkPolicies && this.policy !== null) {
      this.doSingleAddTransactionValidation();
    }
    if (this.selectedOption === 'cancel' && this.bulkPolicies && this.bulkPolicyNumbers !== null) {
      this.doBulkQDELTransactionValidation();
    }
    if (this.selectedOption !== 'cancel' && this.bulkPolicies && this.bulkPolicyNumbers !== null) {
      this.doBulkAddTransactionValidation();
    }
  }

  doBulkAddTransactionValidation(): void {
    this.alertService.clear();
    this.bulkPolicyNumbers.forEach(policy => {
      this.policyService.getNewPolicyByNumber(policy).subscribe(policySearchResult => {
        if (!this.isActivePolicyStatus(policySearchResult.policyStatus)) {
          this.alertService.error('Policy Number: ' + policy + ' is not allowed for current policy status', 'Not allowed to process');
          this.isLoading = false;
          this.showProcesshResults = false;
          this.bulkSubmitProcess = false;
          this.allowQlinkProcess = false;
          return
        }
        else {
          this.allowQlinkProcess = true;
        }
      });
    });
  }

  doBulkQDELTransactionValidation(): void {
    this.alertService.clear();
    this.bulkPolicyNumbers.forEach(policy => {
      this.policyService.getNewPolicyByNumber(policy).subscribe(policySearchResult => {
        if (!this.isCancelledPolicyStatus(policySearchResult.policyStatus)) {

          this.alertService.error('Policy Number: ' + policy + 'is not allowed for deleting', 'Not allowed to process');
          this.isLoading = false;
          this.showProcesshResults = false;
          this.bulkSubmitProcess = false;
          return
        }
        else {
          this.allowQlinkProcess = true;
        }
      });
    });
  }

  isCancelledPolicyStatus(policyStatus: PolicyStatusEnum): boolean {

    switch (policyStatus) {
      case PolicyStatusEnum.PendingCancelled:
      case PolicyStatusEnum.Cancelled:
        return true;
      default: return false;
    }
  }

  isActivePolicyStatus(policyStatus: PolicyStatusEnum): boolean {

    switch (policyStatus) {
      case PolicyStatusEnum.PendingCancelled:
      case PolicyStatusEnum.Cancelled:
        return false;
      default: return true;
    }
  }

  doSingleAddTransactionValidation(): void {
    if (!this.validateIfStatusAllowsForAdd()) {
      this.alertService.error('QADD and QUPD only allowed Active policy', 'Cannot process QADD or QUPD');
      this.isLoading = false;
      this.showProcesshResults = false;
      this.isValidSumbittion = false;
      this.policyNote = null;
      this.allowQlinkProcess = false;
      return;
    }
    else {
      this.allowQlinkProcess = true;
    }
  }

  doSingleQDelTransactionValidation(): void {
    if (!this.validateIfStatusAllowsForQdel()) {
      this.alertService.error('Policy Status must be Pending Cancelled OR Cancelled', 'Cannot process QDEL');
      this.isLoading = false;
      this.showProcesshResults = false;
      this.isValidSumbittion = false;
      this.policyNote = null;
      this.allowQlinkProcess = false;
      return;
    }
    else {
      this.allowQlinkProcess = true;
    }
  }
  resetAdditionalDropdown(): void { }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'policyNumber', show: true },
      { def: 'installmentPremium', show: true },
      { def: 'premium', show: true },
      { def: 'deductionStartDate', show: true },
      { def: 'deductionEndDate', show: true },
      { def: 'qlinkTransactionType', show: true },
      { def: 'createdDate', show: true },
      { def: 'policyStatus', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getProcessDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'policyNumber', show: true },
      { def: 'message', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  save(): void {
    let file = this.selectedFile;
    if (file == null) { return; }

    const reader = new FileReader();
    reader.onload = (event: Event) => {
      const text: string = reader.result?.toString() || '';
      this.csvContent = text;
      const fileContent = <string>reader.result;
      const identifier = 'base64,';
      const index = fileContent.indexOf(identifier);

      if (index >= 0) {
        const fileData = fileContent.substring(index + identifier.length);
        const binaryString: string = atob(fileData);
        const doc = this.getUploadDocument(file.name, 'application/vnd.ms-excel', fileData);
        this.documentManagementService.UploadDocument(doc).subscribe();
      }
    };
  }

  private getUploadDocument(fileName: string, fileExtension: string, fileContent: string): Document {
    const doc = new Document();
    let dateTime = new Date()
    doc.docTypeId = DocumentTypeEnum.PremiumListing;
    doc.systemName = 'PolicyManager';
    doc.fileName = fileName;
    doc.keys = { name: `${fileName}` + '${dateTime}' };
    doc.documentStatus = DocumentStatusEnum.Received;
    doc.documentStatusText = DocumentStatusEnum[DocumentStatusEnum.Received];
    doc.fileExtension = fileExtension;
    doc.documentSet = DocumentSetEnum[DocumentSetEnum.PolicyDocumentsGroup];
    doc.fileAsBase64 = fileContent;
    doc.createdBy = this.authService.getUserEmail();
    return doc;
  }

  mapQlinkTypeToEnumString(qlinkType: number): string {
    switch (qlinkType) {
      case QLinkTransactionTypeEnum.QADD: return 'QADD';
      case QLinkTransactionTypeEnum.QUPD: return 'QUPD';
      case QLinkTransactionTypeEnum.QDEL: return 'QDEL';
      case QLinkTransactionTypeEnum.QFIX: return 'QFIX';
      case QLinkTransactionTypeEnum.QANA: return 'QANA';
      case QLinkTransactionTypeEnum.QANU: return 'QANU';
      case QLinkTransactionTypeEnum.QPHA: return 'QPHA';
      case QLinkTransactionTypeEnum.QPHC: return 'QPHC';
      case QLinkTransactionTypeEnum.QPHU: return 'QPHU';
      case QLinkTransactionTypeEnum.QPHD: return 'QPHD';
      case QLinkTransactionTypeEnum.QAFA: return 'QAFA';
      case QLinkTransactionTypeEnum.QAFU: return 'QAFU';
      case QLinkTransactionTypeEnum.QCAN: return 'QCAN';
      case QLinkTransactionTypeEnum.QTOT: return 'QTOT';
      case QLinkTransactionTypeEnum.QTOD: return 'QTOD';
      case QLinkTransactionTypeEnum.QTOL: return 'QTOL';
      case QLinkTransactionTypeEnum.QTOS: return 'QTOS';
      case QLinkTransactionTypeEnum.QTOR: return 'QTOR';
      default: return 'Unknown';
    }
  }

  convertStringToDate(dateString: string): Date {
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1;
    const day = parseInt(dateString.substring(6, 8), 10);
    return new Date(year, month, day);
  }

  isPolicyNoteTextPopulated(): boolean {
    return !!this.policyNoteText.trim();;
  }

  allowSubmit(): boolean {
    return this.isValidSumbittion;
  }

  checkIfStatusAllowsForQdel(policyId: number): any {
    this.policyService.getPolicy(policyId)
      .subscribe(policy => {
        this.policy = policy;
        switch (this.policy.policyStatus) {
          case PolicyStatusEnum.Cancelled: return true;
          case PolicyStatusEnum.PendingCancelled: return true;
          default: return false;
        }
      }
      );
  }

  validateIfStatusAllowsForQdel(): boolean {

    switch (this.policy.policyStatus) {
      case PolicyStatusEnum.Cancelled: return true;
      case PolicyStatusEnum.PendingCancelled: return true;
      default: return false;
    }
  }

  validateIfStatusAllowsForAdd(): boolean {

    switch (this.policy.policyStatus) {
      case PolicyStatusEnum.Cancelled: return false;
      case PolicyStatusEnum.PendingCancelled: return false;
      default: return true;
    }
  }

  checkIfStatusAllowsForAdds(policyId: number,): any {
    if (this.selectedOption !== 'cancel') {
      return true
    }

    this.policyService.getPolicy(policyId)
      .subscribe(policy => {
        this.policy = policy;
        switch (this.policy.policyStatus) {
          case PolicyStatusEnum.Cancelled: return false;
          case PolicyStatusEnum.PendingCancelled: return false;
          default: return true;
        }
      }
      );
  }

  getPolicyStatus(policyStatus: PolicyStatusEnum) {
    return this.formatLookup(PolicyStatusEnum[policyStatus])
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  getLastDigits(policyNumber: string): number {
    const parts = policyNumber.split('-');
    return Number(parts[parts.length - 1]);
  }

  reloadPage() {
    window.location.reload();
  }

}
