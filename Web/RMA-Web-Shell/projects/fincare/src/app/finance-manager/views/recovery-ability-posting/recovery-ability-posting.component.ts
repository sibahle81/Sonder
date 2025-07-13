import { AbilityCollectionsService } from 'projects/fincare/src/app/shared/services/ability-collections.service';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ProductCrossRefTranType } from 'projects/admin/src/app/configuration-manager/shared/productCrossRefTranType.model';
import { ProductCrossRefTranTypeService } from 'projects/admin/src/app/configuration-manager/shared/productCrossRefTranType.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import * as XLSX from 'xlsx';
import { RecoveryAbilityPostingDatasource } from 'projects/fincare/src/app/finance-manager/views/recovery-ability-posting/recovery-ability-posting.datasource';
import { AbilityCollectionsAudit } from 'projects/fincare/src/app/billing-manager/models/ability-collections-audit';
import { AbilityCollections } from 'projects/fincare/src/app//billing-manager/models/ability-collections';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Subscription } from 'rxjs';
import { UntypedFormBuilder } from '@angular/forms';
import { BaseSearchComponent } from 'projects/shared-components-lib/src/lib/base-search/base-search.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-recovery-ability-posting',
  templateUrl: './recovery-ability-posting.component.html',
  styleUrls: ['./recovery-ability-posting.component.css']
})

export class RecoveryAbilityPostingComponent extends BaseSearchComponent implements OnInit, OnDestroy {
  searchText: string;
  canExport: number;
  canPost: number;
  isSending = false;
  abilityCollections: AbilityCollections;
  abilityCollectionsAudit: AbilityCollectionsAudit;
  @ViewChild('table', { static: true }) table: ElementRef;
  private postSubscribe: Subscription;
  placeHolder = 'Search by Reference, IS Chart No or BS Chart No';

  columns: any[] = [
    { display: 'REFERENCE', def: 'reference', show: true },
    { display: 'Transaction Date', def: 'createdDate', show: true },
    { display: 'NO. OF TRANSACTIONS', def: 'lineCount', show: true },
    { display: 'COMPANY', def: 'companyNo', show: true },
    { display: 'BRANCH', def: 'branchNo', show: true },
    { display: 'PRODUCT', def: 'level1', show: true },
    { display: 'COST CENTRE', def: 'level2', show: true },
    { display: 'IS CHART NO', def: 'chartISNo', show: true },
    { display: 'IS CHART NAME', def: 'ChartISName', show: true },
    { display: 'BS CHART NO', def: 'chartBSNo', show: true },
    { display: 'BS CHART NAME', def: 'ChartBSName', show: true },
    { display: 'PROCESSED', def: 'processed', show: true },
    { display: 'DAILY TOTAL', def: 'dailyTotal', show: true },
    { display: 'Action', def: 'Actions', show: true },
  ];

  constructor(
    formBuilder: UntypedFormBuilder,
    public readonly dataSource: RecoveryAbilityPostingDatasource,
    private readonly abilityCollectionsService: AbilityCollectionsService,
    public readonly router: Router,
    private readonly datePipe: DatePipe,
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager,
    private readonly authService: AuthService) {
    super(dataSource, formBuilder, router,
      '',
      []);
  }

  ngOnInit() {
    this.dataSource.startLoading('Loading collections...');
    this.dataSource.ngOnInit();
    this.canExport = 0;
    this.canPost = 0;
    this.getAbilityPostings();
    this.getExtraPostings();
  }

  public ngOnDestroy(): void {
    if (this.postSubscribe) {
      this.postSubscribe.unsubscribe();
    }
  }

  getDisplayedColumns(): any[] {
    return this.columns
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  searchData(searchFilter) {
    this.applyFilter(searchFilter);
  }

  getAbilityPostings(): void {
    // this.router.navigate(['fincare/finance-manager/']);
    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);
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

  getExtraPostings(): void {
    // this.router.navigate(['fincare/billing-manager/ability-collections-list']);
    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);
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




  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.paginator.length = this.dataSource.filteredData.length;
    this.dataSource.paginator.firstPage();
  }

  post() {
    this.isSending = true;
    this.postSubscribe = this.abilityCollectionsService.postRecoveries().subscribe(result => {
    }, (error) => { // error
      this.toastr.errorToastr('Posting To Ability Unsuccessful', 'Unsuccessfully Posted');
      this.isSending = false;
    }, () => { // complete
      this.toastr.successToastr('Posting To Ability Successful', 'Successfully Posted');
      this.dataSource.isEnabled = false;
      this.isSending = false;
      this.dataSource.getData();
    });

  }


  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
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
    });
    const workSheet = XLSX.utils.json_to_sheet(this.dataSource.data, { header: [] });
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, 'AbilitySummaries.xlsx');
    this.toastr.successToastr('Transactions exported successfully', 'Successful Export');
  }

  clear() {
    this.router.navigate(['fincare/finance-manager/']);
  }

  onViewDetails(abilityCollections: AbilityCollections): void {
    this.router.navigate(['fincare/finance-manager/posted-recoveries-list/', abilityCollections.id]);
  }

  hasPermissionPostToAbility(): boolean {
    return userUtility.hasPermission('Post To Ability');
  }

}
