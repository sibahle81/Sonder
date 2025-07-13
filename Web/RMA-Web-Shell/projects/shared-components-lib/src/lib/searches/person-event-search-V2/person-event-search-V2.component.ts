import { trigger, state, style, transition, animate } from '@angular/animations';
import { KeyValue } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { debounceTime } from 'rxjs/operators';
import { PersonEventSearchV2DataSource } from './person-event-search-V2.datasource';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { SuspiciousTransactionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PersonEventSearch } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/person-event-search';
import { PersonEventSearchParams } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/person-event-search-parameters';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { Constants } from 'projects/clientcare/src/app/constants';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { PreDefinedDateFilterEnum } from '../../report-viewers/ssrs-report-viewer-V2/ssrs-report-filters/date-range-filter/models/pre-defined-range-date-filter.enum';
import { RemittanceReportDialogComponent } from '../../dialogs/remittance-report-dialog/remittance-report-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'person-event-search-V2',
  templateUrl: './person-event-search-V2.component.html',
  styleUrls: ['./person-event-search-V2.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat },
  ],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', visibility: 'hidden' })
      ),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition(
        'isExpanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class PersonEventSearchV2Component extends UnSubscribe implements OnChanges {
  @Input() title = 'Search Person Event';
  @Input() rolePlayerId: number = -1;
  @Input() showRemittanceMenuOption = false;
  @Input() autoSearch: boolean = true

  @Output() PEVSelectedEmit = new EventEmitter<PersonEventModel>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading person events...please wait');
  triggerReset: boolean;
  currentQuery: any;
  form: UntypedFormGroup;
  dataSource: PersonEventSearchV2DataSource;
  searchedManually: boolean = false;

  menus: { title: string; url: string; disable: boolean }[];
  params = new PersonEventSearchParams();
  searchTerm = '';
  currentUser: User; 

  defaultDateRange = PreDefinedDateFilterEnum.ThisYear;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimCareService: ClaimCareService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog
  ) {
    super();
    this.dataSource = new PersonEventSearchV2DataSource(this.claimCareService);
    this.currentUser = this.authService.getCurrentUser();

    this.params.isStp = Constants.stpDropdownDefault;
    this.params.stm = Constants.stpDropdownDefault;
    this.params.claimStatus = Constants.statusesDefault;
    this.params.liabilityStatus = Constants.statusesDefault;
    this.params.viewAll = false;
    this.params.filter = true; 
  }

  ngOnInit(): void {    
    this.createForm();
    this.configureSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
      this.params.rolePlayerId = this.rolePlayerId;
    }

    this.reset();
  }

  createForm(): void {
    if(this.form){
      return;
    }
    if(this.autoSearch){
      this.form = this.formBuilder.group({
        searchTerm: new UntypedFormControl('')
      });    
    }else{
      this.form = this.formBuilder.group({
        searchTerm: new UntypedFormControl('', [Validators.minLength(3), Validators.required])
      });    
    }
  }

  get hasError(): boolean {

    var formError = this.form.get("searchTerm").hasError('required') || this.form.get("searchTerm").hasError('minlength');
    return formError;
  }  

  configureSearch(): void {
    if(this.autoSearch){
      this.form
        .get('searchTerm')
        .valueChanges.pipe(debounceTime(1500))
        .subscribe((response) => {
          this.search(response as string);
        });
    }
  }

  maualSearch(searchTerm: string): void {
    if(searchTerm.length < 3){
      return;
    }
    
    this.searchedManually = true
    this.search(searchTerm)
  }

  displayNotFound(): boolean {
    if(this.autoSearch) {
      return true;
    }
    if(this.searchedManually) {
      return true;
    }
    return false;
  }

  search(searchTerm: string): void {
    this.currentQuery = searchTerm;

    if (this.currentQuery.length >= 3) {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
      this.dataSource.rowCount$.subscribe(
        (count) => (this.paginator.length = count)
      );
      this.currentQuery = this.currentQuery.trim();
      this.paginator.pageIndex = 0;
      this.getData();
    }
    if (!this.currentQuery || this.currentQuery === '') {
      this.getData();
    }
  }

  setData(filter: string, filteredList: any, originalList: any, type: any) : void {
    if (String.isNullOrEmpty(filter)) {
      return (filteredList = originalList);
    } else {
      if (type === 'code') {
        return filteredList.filter((option) =>
          option.code.toLocaleLowerCase().includes(filter)
        );
      }
      if (type === 'name') {
        return filteredList.filter((option) =>
          option.name.toLocaleLowerCase().includes(filter)
        );
      }
    }
  }

  setParameters($event: KeyValue<string, string>[]): void {
    this.params.rolePlayerId = this.rolePlayerId;
    this.params.startDate = $event.find(item => item.key === 'StartDate')?.value;
    this.params.endDate = $event.find(item => item.key === 'EndDate')?.value;
    this.params.viewAll = (this.params.startDate == 'all' && this.params.endDate == 'all');
    if(this.autoSearch){
      this.getData();
    }
  }

  getData(): void {
    this.setParams();
    this.dataSource.setData(this.params);
  }

  getLiabilityStatus(id: number): string {
    return this.formatText(ClaimLiabilityStatusEnum[id]);
  }

  formatText(text: string): string {
    return text?.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  setParams(): void {
    this.params.pageIndex = this.paginator.pageIndex
      ? this.paginator.pageIndex + 1
      : 1;
    this.params.pageSize = this.paginator.pageSize
      ? this.paginator.pageSize
      : 5;
    this.params.orderBy =
      this.sort.active && this.sort.active !== undefined
        ? this.sort.active
        : 'PersonEventNumber';
    this.params.direction = this.sort.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.currentQuery ? this.currentQuery : '';
  }

  filterMenu(item: PersonEventSearch): void {
    this.menus = [];

    this.menus = [
      {
        title: 'View',
        url: '',
        disable: !userUtility.hasPermission('View Claim') && !userUtility.hasPermission('Claim View')
      }];

    if (this.showRemittanceMenuOption) {
      this.menus.push(
        {
          title: 'Remittance',
          url: '',
          disable: !item.claimId
        });
    }
  }

  onMenuSelect(item: PersonEventSearch, menu: any): void {
    switch (menu.title) {
      case 'View':        
        this.getPersonEvent(item.personEventNumber);
        break;
      case 'Remittance':
        this.openRemittanceViewDialog(item);
        break;
    }
  }

  reset(): void {
    if(!this.form){
      return;
    }
    this.triggerReset = !this.triggerReset

    this.form.patchValue({
      searchTerm: this.searchTerm
    });

    this.paginator.firstPage();
    this.getData();
  }

  getSuspiciousTransactionStatus(id: number): string {
    return this.format(SuspiciousTransactionStatusEnum[id]);
  }

  format(text: string): string {
    if (text && text.length > 0) {
      const status = text
        .replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1')
        .trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
  }

  getDisplayedColumns(): string[]  {
    const columnDefinitions = [
      { def: 'personEventNumber', show: true },
      { def: 'eventDate', show: true },
      { def: 'memberNumber', show: this.currentUser?.isInternalUser },
      { def: 'memberName', show: this.currentUser?.isInternalUser },
      { def: 'insuredLife', show: true },
      { def: 'identificationNumber', show: true },
      { def: 'claimLiabilityStatus', show: true },
      { def: 'createdDate', show: true },
      { def: 'isStraightThroughProcess', show: true },
      { def: 'suspiciousTransactionStatus', show: this.currentUser?.isInternalUser },
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getPersonEvent(personEventId: number): void {
    this.isLoading$.next(true);
    this.loadingMessage$.next('loading selected person event...please wait');
    this.claimCareService.getPersonEvent(personEventId).subscribe(result => {
      this.PEVSelectedEmit.emit(result);
      this.isLoading$.next(false);
    });
  }

  openRemittanceViewDialog(item: PersonEventSearch) {
    const dialogRef = this.dialog.open(RemittanceReportDialogComponent, {
      width: '80%',
      disableClose: true,
      data: {
        title: `Remittance Report: ${item.claimNumber}`,
        report: { key: 'Remittance', value: 'RMA.Reports.FinCare/Remittance/RMARemittanceMemberV2Report' },
        parameters: [
          { key: 'ClaimId', value: item.claimId.toString() },
        ]
      }
    });
  }
}
