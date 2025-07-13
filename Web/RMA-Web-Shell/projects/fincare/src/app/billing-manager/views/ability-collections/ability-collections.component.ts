import { AbilityCollectionsService } from 'projects/fincare/src/app/shared/services/ability-collections.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbilityCollections } from 'projects/fincare/src/app/billing-manager/models/ability-collections';
import { ProductCrossRefTranType } from 'projects/admin/src/app/configuration-manager/shared/productCrossRefTranType.model';
import { ProductCrossRefTranTypeService } from 'projects/admin/src/app/configuration-manager/shared/productCrossRefTranType.service';
import { AbilityCollectionsAudit } from 'projects/fincare/src/app/billing-manager/models/ability-collections-audit';
import { AbilityCollectionsDatasource } from 'projects/fincare/src/app/billing-manager/views/ability-collections/ability-collections.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AbilityCollectionPostingRequest } from '../../models/ability-collections-posting-request';
import { MatDialog } from '@angular/material/dialog';
import { AbilityCollectionsDetailsDialogComponent } from './ability-collections-details-dialog/ability-collections-details-dialog.component';
import { BillingService } from '../../services/billing.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ability-collections',
  templateUrl: './ability-collections.component.html',
  styleUrls: ['./ability-collections.component.css']
})
export class AbilityCollectionsComponent implements OnInit {
  totalPremiums: number = 0;
  totalReceipts: number = 0;
  canExport: number;
  canPost: number;
  isSending = false;
  abilityCollections: AbilityCollections;
  productCrossRefTranTypes: ProductCrossRefTranType[];
  abilityCollectionsAudit: AbilityCollectionsAudit;
  abilityCollectionsAudits: AbilityCollectionsAudit[];
  searchText: string;
  placeHolder = 'Search by Reference, IS Chart No or BS Chart No';
  @ViewChild('table', { static: true }) table: ElementRef;
  displayedColumns = [
    'reference', 
    'createdDate', 
    'lineCount', 
    'companyNo', 
    'branchNo', 
    'level3',
    'processed', 
    'bankAccountNumber', 
    'dailyTotal', 
    'Actions'
  ];
  amountFormat = Constants.amountFormat;
  startDateSelected: boolean;
  endDateSelected: boolean;
  startDateParameter: string;
  endDateParameter: string;
  version = 'standard';
  dateFormat = 'yyyy-MM-dd';
  startDate: Date;
  endDate: Date;
  minDate: Date;
  maxDate: Date;
  controlNumberParameter: string;
  abilityChartParameter: string;
  companyNo: number = -1;
  branchNo: number = -1;
  controlNo: number = -1;
  selectedCollectionIds = [];
  selectedCollections = [];
  selectedCompanyNumber = -1;
  selectedBranchNumber = -1;
  companies: { id: number, name: string }[] = [];
  branches: { id: number, name: string }[] = [];
  form: UntypedFormGroup;
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  controls: { id: number, number: number, name: string }[] = [];
  selectedControlNumber: number;

  constructor(public readonly dataSource: AbilityCollectionsDatasource,
    private readonly abilityCollectionsService: AbilityCollectionsService,
    private readonly router: Router,
    private readonly toastr: ToastrManager, public dialog: MatDialog,
    private readonly billingService: BillingService,
    private readonly productCrossRefTranTypeService: ProductCrossRefTranTypeService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly datePipe: DatePipe) {
    this.createForm();
  }

  ngOnInit() {
    this.dataSource.startLoading('Loading collections...');
    this.dataSource.ngOnInit();
    this.canExport = 0;
    this.canPost = 0;

    this.getCompanyNumbers();
    this.getControls();
    this.getExtraPostings();

    const today = new Date();
    this.maxDate = today;
    this.minDate = new Date(today.getFullYear(), today.getMonth(), 1);

    this.totalPremiums = this.calculateTotalPremiums();
    this.totalReceipts = this.calculateTotalReceipts();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      company: [''],
      branch: [''],
      control: [''],
      chartISNo: [''],
      chartISName: [''],
      chartBSNo: [''],
      chartBSName: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  getAbilityPostings(): void {
    this.router.navigate(['fincare/billing-manager/']);
    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.setBranchNo(this.selectedBranchNumber);
    this.dataSource.setCompanyNo(this.selectedCompanyNumber);
    this.dataSource.getData();
    this.dataSource.isLoading = false;
    if (this.dataSource.data != null) {
      this.canExport = 1;
    }
    if (this.dataSource.data.filter(x => x.isProcessed === false) != null) {
      this.canPost = 1;
    } else {
      this.canPost = 0;
    }
  }

  trimWord(text: string): string {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > 0 ? words[0] : '';
  }

  getExtraPostings(): void {
    this.router.navigate(['fincare/billing-manager/ability-collections-list']);
    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.setBranchNo(this.selectedBranchNumber);
    this.dataSource.setCompanyNo(this.selectedCompanyNumber);

    this.dataSource.getData();
    this.dataSource.isLoading = false;
    this.dataSource.stopLoading();
    
    if (this.dataSource.data != null) {
      this.canExport = 1;
    }
    if (this.dataSource.data.filter(x => x.isProcessed === false) != null) {
      this.canPost = 1;
    } else {
      this.canPost = 0;
    }
  }

  done(statusMesssage: string) {
    this.toastr.successToastr(statusMesssage, 'Success');
    this.dataSource.isLoading = true;
    this.dataSource.getData();
  }

  searchData(data) {
    this.applyFilters(data);
  }


applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.paginator) {
        this.paginator.length = this.dataSource.filteredData.length;
        this.dataSource.paginator.firstPage();
    }
}

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  post() {
    this.isSending = true;
    this.abilityCollectionsService.postToAbility().subscribe(() => {
      this.done('Posting To Ability Successful');
      this.isSending = false;
    });
  }

  process() {
    this.isSending = true;
    this.abilityCollectionsService.processTransaction().subscribe(() => {
      this.done('Posting To Ability Successful');
      this.isSending = false;
    });
  }

  exporttoCSV(): void {
    this.dataSource.data.forEach(element => {
      delete element.id;
      delete element.benefitCode;
      delete element.isDeleted;
      delete element.isActive;
      delete element.createdBy;
      delete element.createdDate;
      delete element.modifiedBy;
      delete element.modifiedDate;
      delete element.isExpanded;
    });

    const workSheet = XLSX.utils.json_to_sheet(this.dataSource.data, { header: [] });
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, 'AbilitySummaries.xlsx');
    this.toastr.successToastr('Transactions exported successfully');
  }

  clear() {
    this.router.navigate(['fincare/billing-manager/']);
  }

  onViewDetails(abilityCollections: AbilityCollections): void {
    this.router.navigate(['fincare/billing-manager/ability-collections-list-group/', abilityCollections.id]);
  }

  hasPermissionPostToAbility(): boolean {
    return userUtility.hasPermission('Post To Ability');
  }

  collectionTransactionChecked(event: any, item: AbilityCollections) {
    if (event.checked) {
      this.selectedCollectionIds.push(item.id);
      this.selectedCollections.push(item);
    } else {
      this.unTickCollectionItem(item.id);
    }
  }

  unTickCollectionItem(itemId: number) {
    for (let i = 0; i < this.selectedCollectionIds.length; i++) {
      if ((this.selectedCollectionIds[i] === itemId)) {
        this.selectedCollectionIds.splice(i, 1);
        const itemIndex = this.selectedCollections.findIndex(c => c.transactionId === itemId);
        this.selectedCollections.splice(itemIndex, 1);
        break;
      }
    }
  }

  collectionAllChecked(event: any) {
    if (event.checked) {
      this.selectedCollectionIds = [];
      [...this.dataSource.data].forEach(element => {
        this.selectedCollectionIds.push(element.id);
        this.selectedCollections.push(element);
      });

    } else {
      this.selectedCollectionIds = [];
      this.selectedCollections = [];
    }
  }

  postCollectionSummariesToAbility() {
    this.isSending = true;
    let request = new AbilityCollectionPostingRequest();
    request.collectionIds = [...this.selectedCollectionIds];
    this.abilityCollectionsService.postCollectionSummaryToAbility(request).subscribe(() => {
      this.done('Posting To Ability Successful');
      this.isSending = false;
      this.selectedCollectionIds = [];
      this.selectedCollections = [];
    });
  }

  shouldDisableSelect(item: AbilityCollections): boolean {
    if (item.processed.toLowerCase() === 'yes') {
      return true;
    }
    if (!item.bankAccountNumber) {
      return true;
    }
    if (item.bankAccountNumber && item.bankAccountNumber.length === 0) {
      return true;
    }
    return false;
  }

  showMoreInformation(item: AbilityCollections) {
    const dialogRef = this.dialog.open(AbilityCollectionsDetailsDialogComponent, {
      width: "60%",
      data: { item },
    });
  }

  getCompanyNumbers(){
    this.billingService.getCompanies().subscribe(
      (data: {companyNumber: number, companyName:string}[]) => {
        if(data && data.length > 0) {
          this.companies.push({id: -1, name: 'All'});
          [...data].sort((a,b) => a.companyNumber - b.companyNumber).forEach(item => {
            if(this.companies.findIndex(c=>c.id === item.companyNumber) < 0)
              this.companies.push({id: item.companyNumber, name: item.companyNumber.toString()});
          });
        }
      }
    );
  }

  getBranchesByCompanyNumber(){
    this.billingService.getBrachesByCompany(this.selectedCompanyNumber).subscribe(
      (data: {branchNumber: number, branchName:string}[]) => {
        if (data && data.length > 0) {

          this.branches.push({id: -1, name: 'All'});

          [...data].forEach(item => {
            if(this.branches.findIndex(c=>c.id === item.branchNumber) < 0)
              this.branches.push({id: item.branchNumber, name: item.branchNumber.toString()});
          });

          if(this.branches && this.branches.length > 0){
            this.selectedBranchNumber = this.branches[0].id;
            this.form.get('branch').setValue(this.selectedBranchNumber);

            this.getExtraPostings();
          }
        }
      }
    );
  }

  companyChanged(event: any): void {
    this.selectedCompanyNumber = +event.value;
    this.getBranchesByCompanyNumber();
  }

  branchChanged(event: any): void {
    this.selectedBranchNumber = +event.value;
    this.getExtraPostings();
  }

  getTotalPremiums(): number {
    if (!this.dataSource.data) return 0;

    const premiumTransactionTypes = [
      'Debit Note',
      'Credit Note',
      'Invoice',
      'Invoice Reversal'
    ];

    return this.dataSource.data
      .filter(item => premiumTransactionTypes.includes(item.transactionType))
      .reduce((sum, item) => {
        return sum + (item.dailyTotal || 0);
      }, 0);
  }

  getTotalReceipts(): number {
    if (!this.dataSource.data) return 0;

    const receiptTransactionTypes = [
      'Payment Received',
      'Payment Reversal',
      'Reallocation',
      'Inter-debtor transfers',
      'Refunds'
    ];

 
    return this.dataSource.data
      .filter(item => receiptTransactionTypes.includes(item.transactionType))
      .reduce((sum, item) => {
        return sum + (item.dailyTotal || 0);
      }, 0);
  }

  calculateTotalPremiums(): number {
    return this.getTotalPremiums();
  }

  calculateTotalReceipts(): number {
    return this.getTotalReceipts();
  }

  getControls(){
    this.productCrossRefTranTypeService.getProductCrossRefTranTypes().subscribe({
      next: (response: ProductCrossRefTranType[]) => {
        if (!response || response.length === 0) {
          this.toastr.warningToastr('No controls available', 'Warning');
          return;
        }
        
        const uniqueControls = [...new Set(response
          .filter(x => x.level3 != null) 
          .map(x => x.level3))]
          .sort((a, b) => a - b);

        this.controls = uniqueControls.map(level3 => ({
          id: level3,
          number: level3,
          name: level3.toString()
        }));

        this.controls.unshift({
          id: -1,
          number: -1,
          name: 'All'
        });

      },
      error: (error) => {
        this.toastr.errorToastr('Failed to load controls. Please check the console for details.', 'Error');
      }
    });
  }

  applyFilters(filters: any): void {
    this.selectedCompanyNumber = filters.company || -1;
    this.selectedBranchNumber = filters.branch || -1;
    this.selectedControlNumber = filters.controlNumber || -1;

    this.dataSource.applyFilters({
      companyNo: this.selectedCompanyNumber,
      branchNo: this.selectedBranchNumber,
      controlNumber: this.selectedControlNumber,
      startDate: filters.startDate ? this.datePipe.transform(filters.startDate, 'yyyy-MM-dd') : null,
      endDate: filters.endDate ? this.datePipe.transform(filters.endDate, 'yyyy-MM-dd') : null,
      searchText: filters.searchText || ''
    });

    if (this.selectedCompanyNumber !== -1) {
      this.getBranchesByCompanyNumber();
    }

    this.dataSource.controlNumber = this.selectedControlNumber;
    
    this.getExtraPostings();
  }

  clearFilters(): void {
    this.selectedCompanyNumber = -1;
    this.selectedBranchNumber = -1;
    this.selectedControlNumber = -1;
    this.dataSource.clearFilters();
    this.getExtraPostings();
  }

  
}
