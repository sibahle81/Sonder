import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AgeAnalysisNotesComponent } from '../age-analysis-notes/age-analysis-notes.component';
import { AgeAnalysisService } from '../../../shared/services/age-analysis.service';
import { AgeAnalysisNote } from '../../../shared/models/age-analysis-note';
import { AgeAnalysis } from '../../../shared/models/age-analysis';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AgeAnalysisRequest } from '../../../shared/models/age-analysis-request';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { CollectionsService } from '../../services/collections.service';
import { CollectionsAgeing } from '../../../shared/models/collections-ageing';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { AgeAnalysisDatasource } from '../age-analysis/age-analysis.datasource';

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
  selector: 'app-collection-ageing',
  templateUrl: './collection-ageing.component.html',
  styleUrls: ['./collection-ageing.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_FORMATS }
  ]
})

export class CollectionAgeingComponent implements OnInit {
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
  industries: Lookup[] = [];
  loadingIndustries = true;
  loadingProducts = true;

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
  placeHolder = 'Search by Account Number or Client Name';
  format = 'excel';
  products: Product[] = [];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly ageAnalysisService: AgeAnalysisService,
    private readonly lookupService: LookupService,
    private readonly userService: UserService,
    public dataSource: AgeAnalysisDatasource,
    private dialogBox: MatDialog,
    private toastr: ToastrManager,
    private readonly collectionsService: CollectionsService,
    private readonly productService: ProductService
  ) { this.createForm(); }

  ngOnInit(): void {
    const today = new Date();
    this.maxDate = today;
    this.dataSource.setControls(this.paginator, this.sort);
    this.getCollectionAgents();
    this.getIndustries();
    this.getProducts();
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
      industry: [''],
      includeNotes: [''],
      includeInterest: [''],
      product: [''],
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
    ageAnalysisRequest.productId = formModel.product as number;
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
      industry: 4,
      includeNotes: true,
      includeInterest: true
    });
    this.displayEndDate = new Date();
  }

  getIndustries(): void {
    this.loadingIndustries = true;
    this.lookupService.getIndustryClasses().subscribe(
      data => {
        this.industries = data
        const index = this.industries.findIndex(item => {
          return item.name === 'All';
        });
        this.industries.splice(index, 1);
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

  getProducts() {
    this.loadingProducts = true;
    this.productService.getProducts().subscribe(results => {
      this.products = results;
      this.loadingProducts = false;
    });
  }

  getDisplayColumns(): string[] {
    const columns: string[] = ['selected', 'productName', 'accountNumber', 'clientName', 'industry'];
    if (this.includeNotes) {
      columns.push('collectionAgent');
      // columns.push('debtorsClerk');
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

    const ageAnalysisRequest = this.readForm();

    this.ageAnalysisService.getAgeAnalysis(ageAnalysisRequest).subscribe(results => {
      this.dataSource.getData(results);
      this.isLoading = false;
    },
      error => {
        this.toastr.errorToastr(error, 'View Report Error');
        this.isLoading = false;
      });
  }

  searchData(data) {
    this.applyFilter(data);
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.paginator.length = this.dataSource.filteredData.length;
    this.dataSource.paginator.firstPage();
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  downloadReport(): void {
    this.errors = [];
    this.showReport = false;
    this.isDownloading = true;
    this.showReport = false;
    const value = this.form.getRawValue();
    const endDate = this.parseDate(value.endDate);
    this.includeNotes = value.includeNotes;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.counter++;
        this.parametersAudit = {
          clientTypeId: value.clientType,
          ageTypeId: value.ageType,
          debtorStatus: value.debtorStatus,
          assignedStatus: value.assignedStatus,
          balanceTypeId: value.balanceType,
          industryId: value.industry,
          endDate,
          includeInterest: value.includeInterest ? 1 : 0,
          includeNotes: value.includeNotes ? 1 : 0,
          counter: this.counter,
          productId: value.product
        };
        this.reportServerAudit = data;
        this.reportUrlAudit = 'RMA.Reports.FinCare/RMAAgeAnalysis';
        this.showParametersAudit = 'true';
        this.languageAudit = 'en-us';
        this.widthAudit = 10;
        this.heightAudit = 10;
        this.toolbarAudit = 'false';
        this.format = 'excel';
        this.showReport = true;
      },
      error => {
        this.toastr.errorToastr(error, 'Error downloading report');
        this.isLoading = false;
      }
    );
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

  assignSelectedRows(): void {
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
      industryId: filters.industry,
      endDate: this.parseDate(filters.endDate)
    };
    this.ageAnalysisService.assignCollectionAgent(assignments).subscribe(
      count => {
        this.showSection('filters');
        this.toastr.successToastr(`${count} accounts have been assigned to ${agent.displayName}`);
      },
      error => {
        this.toastr.errorToastr(error);
      }
    );
  }

  completeDownload(event: any): void {
    this.isDownloading = !event;
  }

  downloadAgeAnalysisSummaryReport(): void {
    this.errors = [];
    this.showReport = false;
    this.isDownloading = true;
    const value = this.form.getRawValue();
    const endDate = this.parseDate(value.endDate);
    this.includeNotes = value.includeNotes;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.counter++;
        this.parametersAudit = {
          clientTypeId: value.clientType,
          ageTypeId: value.ageType,
          debtorStatus: value.debtorStatus,
          assignedStatus: value.assignedStatus,
          balanceTypeId: value.balanceType,
          industryId: value.industry,
          endDate,
          includeInterest: value.includeInterest ? 1 : 0,
          includeNotes: value.includeNotes ? 1 : 0,
          counter: this.counter,
          ProductId: value.product
        };
        this.reportServerAudit = data;
        this.reportUrlAudit = 'RMA.Reports.FinCare/RMASummaryAgeAnalysisReport';
        this.showParametersAudit = 'true';
        this.languageAudit = 'en-us';
        this.widthAudit = 10;
        this.heightAudit = 10;
        this.toolbarAudit = 'false';
        this.showReport = true;
        this.format = 'excel';
      },
      error => {
        this.toastr.errorToastr(error, 'Error downloading report');
        this.isLoading = false;
      }
    );
  }

  exportCollectionAgeingReport(): void {
    this.isDownloading = true;
    const value = this.form.getRawValue();
    if (value.product) {
      const endDate = this.parseDate(value.endDate);
      this.collectionsService.getCollectionsAgeing(value.balanceType, value.clientType, value.debtorStatus, endDate, value.industry, value.product).subscribe(
        (reportData: CollectionsAgeing[]) => {
          this.isDownloading = false;
          const reportDataSource = {
            data: reportData
          };
          DataGridUtil.downloadExcel(reportDataSource, 'CollectionsAgeingReport.xlsx');
          this.done('Collections ageing records exported successfully');
        },
        error => {
          this.toastr.errorToastr(error.Error ? error.Error : error, 'Error downloading collections ageing report');
          this.isDownloading = false;
        }
      );
    }
  }

  done(statusMassage: string) {
    this.toastr.successToastr(statusMassage, 'Success');
  }

}
