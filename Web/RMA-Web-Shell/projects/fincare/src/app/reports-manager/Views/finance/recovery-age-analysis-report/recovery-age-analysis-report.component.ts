import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { RecoveryAgeAnalysisReportDatasource } from './recovery-age-analysis-report.datasource';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AgeAnalysisRequest } from 'projects/fincare/src/app/shared/models/age-analysis-request';
import { AgeAnalysis } from 'projects/fincare/src/app/shared/models/age-analysis';
import { AgeAnalysisNote } from 'projects/fincare/src/app/shared/models/age-analysis-note';
import { AgeAnalysisService } from 'projects/fincare/src/app/shared/services/age-analysis.service';
import { Format } from 'projects/shared-utilities-lib/src/lib/pipes/format';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import { RecoveryAgeAnalysisNotesComponent } from '../recovery-age-analysis-notes/recovery-age-analysis-notes.component';
import { DatePipe } from '@angular/common';


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
  templateUrl: './recovery-age-analysis-report.component.html',
  styleUrls: ['./recovery-age-analysis-report.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_FORMATS }
  ]
})
export class RecoveryAgeAnalysisReportComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

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
  formResult: UntypedFormGroup;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly ageAnalysisService: AgeAnalysisService,
    private readonly alertService: AlertService,
    private readonly userService: UserService,
    private readonly datePipe: DatePipe,
    public dataSource: RecoveryAgeAnalysisReportDatasource,
    private dialogBox: MatDialog
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const today = new Date();
    this.maxDate = today;
    this.displayEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.dataSource.setControls(this.paginator, this.sort);
    this.getCollectionAgents();
    this.populateForm();
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
      includeNotes: [''],
      includeInterest: [''],
      txtDateChoosen: [''],
    });
    this.formResult = this.formBuilder.group({
      txtDateChoosen: [''],
    });
  }

  readForm(): AgeAnalysisRequest {
    const formModel = this.form.getRawValue();

    const ageAnalysysRequest = new AgeAnalysisRequest();
    ageAnalysysRequest.ageTypeId = formModel.ageType as number;
    ageAnalysysRequest.assignedStatusId = formModel.assignedStatus as number;
    ageAnalysysRequest.balanceTypeId = formModel.balanceType as number;
    ageAnalysysRequest.clientTypeId = formModel.clientType as number;
    ageAnalysysRequest.debtorStatusId = formModel.debtorStatus as number;
    ageAnalysysRequest.endDate = formModel.endDate as Date;
    ageAnalysysRequest.includeInterest = formModel.includeInterest as boolean;
    ageAnalysysRequest.includeNotes = formModel.includeNotes as boolean;
    ageAnalysysRequest.counter = this.counter++;

    return ageAnalysysRequest;
  }

  populateForm(): void {
    const today = new Date();
    const period = new Date(today.getFullYear(), today.getMonth(), 1);
    this.form.patchValue({
      period,
      endDate: this.displayEndDate,
      clientType: 0,
      ageType: 0,
      debtorStatus: 0,
      assignedStatus: 0,
      balanceType: 0,
      includeNotes: true,
      includeInterest: true
    });
  }

  getCollectionAgents(): void {
    this.userService.getUsersByRoleName('Collection Agent').subscribe(
      data => {
        this.collectionAgents = data;
      }
    );
  }

  getDisplayColumns(): string[] {
    const columns: string[] = ['selected', 'accountNumber', 'clientName', 'policyNumber', 'policyStatus'];
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

  loadAgeAnalysisReport() {
    this.isLoading = true;
    this.section = 'report';
    this.selectAll = false;

    const value = this.form.getRawValue();
    this.includeNotes = value.includeNotes;
    this.dataSource.filter = '';

    const ageAnalysysRequest = this.readForm();
    this.formResult.controls.txtDateChoosen.setValue(this.datePipe.transform(ageAnalysysRequest.endDate, 'yyyy-MM-dd'));
    this.ageAnalysisService.getRecoveryAgeAnalysis(ageAnalysysRequest).subscribe(results => {
      this.dataSource.getData(results);
      this.isLoading = false;
    },
      error => {
        this.alertService.parseError(error, 'View Report Error');
        this.isLoading = false;
      });
  }

  downloadReport(): void {
    const columnDefinitions = [
      { display: 'Account Number', def: 'accountNumber', show: true },
      { display: 'Client Name', def: 'clientName', show: true },
      { display: 'Policy Number', def: 'policyNumber', show: true },
      { display: 'Status', def: 'policyStatus', show: true },
      { display: 'Collection Agent', def: 'collectionAgent', show: true },
      { display: 'Balance', def: 'balance', show: true },
      { display: 'Interest', def: 'interest', show: true },
      { display: 'Current', def: 'current', show: true },
      { display: '30 Days', def: 'balance30Days', show: true },
      { display: '60 Days', def: 'balance60Days', show: true },
      { display: '90 Days', def: 'balance90Days', show: true },
      { display: '120 Days', def: 'balance120Days', show: true },
      { display: '120+ Days', def: 'balance120PlusDays', show: true }
    ];

    const def: any[] = [];
    const exprtcsv: any[] = [];
    if (this.dataSource.data.length === 0) {
      this.dataSource.data.push('no data');
    }
    (JSON.parse(JSON.stringify(this.dataSource.data)) as any[]).forEach(x => {
      const obj = new Object();
      const frmt = new Format();
      for (let i = 0; i < columnDefinitions.map(cd => cd.def).length; i++) {
        const transfrmVal = frmt.transform(x[columnDefinitions[i].def], '');
        obj[columnDefinitions[i].display] = transfrmVal;
      }
      exprtcsv.push(obj);
    });

    DataGridUtil.downloadcsv(exprtcsv, def, 'Recovery_' + 'Report');
    this.alertService.success('Report downloaded successfully');
  }

  selectRecords(event: any): void {
    this.dataSource.data.forEach(aa => aa.selected = event.checked);
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
    const dialog = this.dialogBox.open(RecoveryAgeAnalysisNotesComponent, config);
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
        this.alertService.error(error);
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

  clearAssignment(): void {
    this.errors = [];
    this.isAssigning = false;
    this.dataSource.filter = '';
  }

  assignCollections(): void {
    this.errors = [];
    const records = this.dataSource.data.filter(r => r.selected);
    if (records.length === 0) {
      this.errors.push('Please select at least one record.');
    }
    if (this.errors.length === 0) {
      this.isAssigning = true;
      this.dataSource.filter = 'selected_row';
    }
  }

  showFiltersSection(): void {
    this.showSection('filters');
  }

  assignSelectedRows(): void {
    this.isLoading = true;
    const filters = this.form.getRawValue();
    const records = this.dataSource.data.filter(r => r.selected);
    const agent = this.collectionAgents.find(a => a.id === this.collectionAgentId);
    const assignments = {
      agent: {
        id: agent.id,
        displayName: agent.displayName,
        email: agent.email,
        userTypeId: agent.userTypeId
      },
      accountIds: records.map(r => r.accountId),
      clientTypeId: filters.clientType,
      ageTypeId: filters.ageType,
      balanceTypeId: filters.balanceType,
      endDate: this.parseDate(filters.endDate)
    };
    this.ageAnalysisService.assignCollectionAgent(assignments).subscribe(
      count => {
        this.showSection('filters');
        this.alertService.success(`${count} accounts have been assigned to ${agent.displayName}`);
        this.loadAgeAnalysisReport();
        this.isAssigning = false;
      },
      error => {
        this.alertService.error(error);
        this.isLoading = false;
      }
    );
  }
}
