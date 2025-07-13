import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { ToastrManager } from 'ng6-toastr-notifications';
import { AgeAnalysisNotesComponent } from 'projects/fincare/src/app/billing-manager/views/age-analysis-notes/age-analysis-notes.component';
import { AgeAnalysis } from 'projects/fincare/src/app/shared/models/age-analysis';
import { AgeAnalysisNote } from 'projects/fincare/src/app/shared/models/age-analysis-note';
import { AgeAnalysisRequest } from 'projects/fincare/src/app/shared/models/age-analysis-request';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';

export const MONTH_FORMATS = {
  parse: {
    dateInput: 'MMMM YYYY',
  },
  display: {
    dateInput: 'MMMM YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-trial-balance-recon',
  templateUrl: './trial-balance-recon.component.html',
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_FORMATS }
  ]
})
export class TrialBalanceReconComponent implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  errors: string[] = [];
  counter = 1;

  collectionAgents: User[] = [];
  collectionAgentId = 0;
  industries: Lookup[] = [];
  loadingIndustries = true;

  form: UntypedFormGroup;
  displayEndDate: Date;
  maxDate: Date;
  section = 'filters';
  includeNotes = true;
  showReport = false;
  isLoading = false;
  isDownloading = false;
  isAssigning = false;
  selectAll = false;
  searchText: string;
  startDate: any;
  placeHolder = 'Search by Account Number or Client Name';
  format = 'pdf';
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  ssrsBaseUrl: string;
  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly userService: UserService,
    private dialogBox: MatDialog,
    private toastr: ToastrManager
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const today = new Date();
    this.maxDate = today;
    this.getCollectionAgents();
    this.getIndustries();
    this.populateForm();

    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
      this.isLoading$.next(false);
    },
      error => {
        this.toastr.errorToastr(error.message);
        this.isLoading$.next(false);
      });
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      period: [''],
      endDate: [''],
      clientType: [''],
      ageType: [''],
      debtorStatus: [''],
      assignedStatus: [''],
      balanceType: [''],
      industry: [''],
      includeNotes: [''],
      includeInterest: ['']
    });
  }

  readForm(): AgeAnalysisRequest {
    const formModel = this.form.getRawValue();
    this.counter++;
    const ageAnalysisRequest = new AgeAnalysisRequest();
    ageAnalysisRequest.clientTypeId = formModel.clientType as number;
    ageAnalysisRequest.ageTypeId = formModel.ageType as number;
    ageAnalysisRequest.debtorStatusId = formModel.debtorStatus as number;
    ageAnalysisRequest.assignedStatusId = formModel.assignedStatus as number;
    ageAnalysisRequest.balanceTypeId = formModel.balanceType as number;
    ageAnalysisRequest.industryId = formModel.industry as number;
    ageAnalysisRequest.endDate = formModel.endDate as Date;
    ageAnalysisRequest.includeInterest = formModel.includeInterest as boolean;
    ageAnalysisRequest.includeNotes = formModel.includeNotes as boolean;
    ageAnalysisRequest.counter = this.counter;
    return ageAnalysisRequest;
  }

  populateForm(): void {
    const today = new Date();
    const period = new Date(today.getFullYear(), today.getMonth(), 1);
    this.form.patchValue({
      period: null,
      endDate: new Date(),
      clientType: 0,
      ageType: 0,
      debtorStatus: 0,
      assignedStatus: 0,
      balanceType: 0,
      industry: 0,
      includeNotes: true,
      includeInterest: true
    });
    this.displayEndDate = new Date();
  }

  getIndustries(): void {
    this.loadingIndustries = true;
    this.lookupService.getIndustryClasses().subscribe(
      data => {
        this.industries = data;
        this.industries.unshift({ id: 0, name: 'All' } as Lookup);
        this.loadingIndustries = false;
      }
    );
  }

  getCollectionAgents(): void {
    this.userService.getUsersByRoleName('Collection Agent').subscribe(
      data => {
        this.collectionAgents = data;
      }
    );
  }

  getDisplayColumns(): string[] {
    const columns: string[] = ['selected', 'accountNumber', 'clientName', 'industry'];
    if (this.includeNotes) {
      columns.push('collectionAgent');
    }
    columns.push('balance');
    columns.push('interest');
    columns.push('current');
    columns.push('balance30Days');
    columns.push('balance60Days');
    columns.push('balance90Days');
    columns.push('balance120Days');
    columns.push('balance120PlusDays');
    if (this.includeNotes) {
      columns.push('notes');
    }
    return columns;
  }

  getNotesLink(row: AgeAnalysis): string {
    let count = 0;
    if (row.note1 && row.note1 !== '') { count++; }
    if (row.note2 && row.note2 !== '') { count++; }
    if (row.note3 && row.note3 !== '') { count++; }
    switch (count) {
      case 0: return '';
      case 1: return '1 note';
      default: return `${count} notes`;
    }
  }

  chosenYearHandler(selectedDate: any) {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const period = new Date(this.form.get('period').value);
    const month = period.getMonth();
    this.setDateValues(year, month);
  }

  chosenMonthHandler(selectedDate: any, datepicker: MatDatepicker<Date>) {
    datepicker.close();
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    this.setDateValues(year, month);
  }

  setDateValues(year: number, month: number): void {
    const today = new Date();
    const startDate = new Date(year, month, 1);
    this.startDate = this.parseDate(startDate);
    let endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    if (endDate > today) {
      endDate = today;
    }
    this.form.patchValue({
      period: startDate,
      endDate
    });
    this.displayEndDate = endDate;
  }

  updateEndDate(event: any): void {
    this.displayEndDate = new Date(event);
  }

  showSection(name: string): void {
    this.errors = [];
    this.section = name;
  }

  loadReport() {
    this.isLoading = true;
    this.section = 'report';
    this.selectAll = false;
    this.showReport = false;
    this.isDownloading = true;
    const value = this.form.getRawValue();
    const EndDate = this.parseDate(value.endDate);
    const StartDate = this.startDate;
    this.includeNotes = value.includeNotes;
    this.counter++;
    this.parametersAudit = {
      StartDate,
      EndDate,
      clientTypeId: value.clientType,
      ageTypeId: value.ageType,
      debtorStatus: value.debtorStatus,
      assignedStatus: value.assignedStatus,
      balanceTypeId: value.balanceType,
      industryId: value.industry,
      includeInterest: value.includeInterest ? true : false,
      includeNotes: value.includeNotes ? true : false,
      counter: this.counter
    };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/RMATBReconReport';
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 150;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.isLoading$.next(false);
    this.showReport = true;
  }

  searchData(data) {
    this.applyFilter(data);
  }

  applyFilter(filterValue: any) {
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  downloadReport(): void {
    this.section = 'filters';
    this.selectAll = false;
    this.showReport = false;
    this.isDownloading = true;
    const value = this.form.getRawValue();
    const EndDate = this.parseDate(value.endDate);
    const StartDate = this.startDate;
    this.includeNotes = value.includeNotes;
    this.counter++;
    this.parametersAudit = {
      StartDate,
      EndDate,
      clientTypeId: value.clientType,
      ageTypeId: value.ageType,
      debtorStatus: value.debtorStatus,
      assignedStatus: value.assignedStatus,
      balanceTypeId: value.balanceType,
      industryId: value.industry,
      includeInterest: value.includeInterest ? true : false,
      includeNotes: value.includeNotes ? true : false,
      counter: this.counter
    };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/RMATBReconReport';
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 150;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.format = 'excel';
    this.isLoading$.next(false);
    this.showReport = false;
  }

  selectRecords(event: any): void {
  }

  addNote(row: AgeAnalysis): void {
    this.showAgeAnalysisNotes(row, 'add');
  }

  showNotes(row: AgeAnalysis): void {
    this.showAgeAnalysisNotes(row, 'list');
  }

  showAgeAnalysisNotes(row: AgeAnalysis, section: string) {
    const notes: AgeAnalysisNote[] = [
      { id: row.noteId1, rolePlayerId: row.accountId, createdBy: row.user1, createdDate: row.date1, text: row.note1 } as AgeAnalysisNote,
      { id: row.noteId2, rolePlayerId: row.accountId, createdBy: row.user2, createdDate: row.date2, text: row.note2 } as AgeAnalysisNote,
      { id: row.noteId3, rolePlayerId: row.accountId, createdBy: row.user3, createdDate: row.date3, text: row.note3 } as AgeAnalysisNote
    ];

    const config = new MatDialogConfig();
    config.data = {
      section,
      rolePlayerId: row.accountId,
      notes: notes.filter(n => n.text && n.text !== '')
    };
    config.disableClose = true;
    const dialog = this.dialogBox.open(AgeAnalysisNotesComponent, config);
    dialog.afterClosed().subscribe(
      data => {
        if (data.notes && data.notes.length > 0) {
          for (let i = 0; i < data.notes.length; i++) {
            const note = data.notes[i];
            row[`noteId${i + 1}`] = note.id;
            row[`user${i + 1}`] = note.createdBy;
            row[`date${i + 1}`] = note.createdDate;
            row[`note${i + 1}`] = note.text;
          }
        }
      },
      error => {
        this.toastr.errorToastr(error);
        this.isLoading = false;
      }
    );
  }

  parseDate(date: Date): string {
    const dtm = new Date(date);
    const month = this.padLeft(dtm.getMonth() + 1);
    const day = this.padLeft(dtm.getDate());
    return `${dtm.getFullYear()}-${month}-${day}`;
  }

  padLeft(value: number): string {
    let result = `0${value}`;
    result = result.substring(result.length - 2);
    return result;
  }

  completeDownload(event: any): void {
    this.isDownloading = !event;
  }
}

