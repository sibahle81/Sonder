import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { PagedParams } from '../../../entities/personEvent/paged-parameters';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { ClaimPagedEstimatesDataSource } from './claim-paged-estimates.datasource';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';

@Component({
  selector: 'claim-paged-estimates',
  templateUrl: './claim-paged-estimates.component.html',
  styleUrls: ['./claim-paged-estimates.component.css']
})
export class ClaimPagedEstimatesComponent extends PermissionHelper implements OnChanges {

  @Input() user: User;
  @Input() personEvent: PersonEventModel;
  @Input() showMinimalView = false;
  @Input() claimInvoice: ClaimInvoice;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Output() refreshLoading = new EventEmitter<boolean>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: ClaimPagedEstimatesDataSource;

  menus: { title: string; url: string; disable: boolean }[];
  params = new PagedParams();
  slaItemType = SLAItemTypeEnum.Claim;
  currentQuery = '';

  constructor(
    private readonly claimInvoiceService: ClaimInvoiceService,
    public userService: UserService
  ) {
    super();
  }

  ngOnChanges() {
    this.setPaginatorOnSortChanges();
    this.dataSource.personEventId = this.personEvent.personEventId;

    if (this.claimInvoice) {
      const estimateTypeQuery = this.getClaimEstimateTypeQueryMapping(this.claimInvoice.claimInvoiceType);
      if (estimateTypeQuery !== null) {
        this.currentQuery = estimateTypeQuery;
      }
      this.getData();
    }
  }

  setPaginatorOnSortChanges() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new ClaimPagedEstimatesDataSource(this.claimInvoiceService);
    this.dataSource.rowCount$.subscribe((count) => this.paginator.length = count);
  }

  getData() {
    this.setParams();
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery)
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'claimEstimateId';
    this.params.direction = this.sort.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.currentQuery ? this.currentQuery : '';
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'estimatedValue', show: true },
      { def: 'estimatedDaysOff', show: true },
      { def: 'allocaAmount', show: true },
      { def: 'authAmount', show: true },
      { def: 'outstandingValue', show: true },
      { def: 'outstandingDaysOff', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getClaimInvoiceType(id: number) {
    return this.formatText(ClaimInvoiceTypeEnum[id]);
  }

  getClaimInvoiceStatus(id: number) {
    if (!id) { return };
    return this.formatText(ClaimInvoiceStatusEnum[id]);
  }

  formatMoney(value: string): string {
    return value && value.length > 0 ? value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") : '-';
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'No data';
  }

  AddCheckedItems($event: any) {
    if ($event > -1) {

    }
  };

  refresh() {
    this.getData();
  }

  getClaimEstimateTypeQueryMapping(claimInvoiceType: ClaimInvoiceTypeEnum): string {
    switch (claimInvoiceType) {
      case +ClaimInvoiceTypeEnum.DaysOffInvoice:
        return EstimateTypeEnum[EstimateTypeEnum.TTD];
      case +ClaimInvoiceTypeEnum.MedicalInvoice:
        return EstimateTypeEnum[EstimateTypeEnum.Medical];
      case +ClaimInvoiceTypeEnum.PDAward:
        return EstimateTypeEnum[EstimateTypeEnum.PDLumpSum];
      case +ClaimInvoiceTypeEnum.FuneralExpenses:
        return EstimateTypeEnum[EstimateTypeEnum.Funeral];
      case +ClaimInvoiceTypeEnum.WidowLumpSumAward:
        return EstimateTypeEnum[EstimateTypeEnum.WidowsLumpSum];
      case +ClaimInvoiceTypeEnum.SundryInvoice:
        return EstimateTypeEnum[EstimateTypeEnum.Sundry];
        case +ClaimInvoiceTypeEnum.FatalLumpSumAward:
          return EstimateTypeEnum[EstimateTypeEnum.PDLumpSum];
      default:
        return null; 
    };
  }
}
