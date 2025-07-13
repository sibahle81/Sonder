import { Component, EventEmitter, Input, OnInit, AfterViewInit, ElementRef, Output, ViewChild, ChangeDetectorRef, SimpleChanges, HostListener } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { MedicalSwitchBatchSearchPersonEvent } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch-search-person-event';
import { isNullOrUndefined } from 'util';
import { PersonEventSearchNavigationEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/person-event-search-navigation.enum';
import { MedicalInvoiceSwitchBatchPersonEventSearchDatasourceService } from 'projects/medicare/src/app/medical-invoice-manager/datasources/medical-invoice-switch-batch-person-event-search-datasource.service';
import { MedicalInvoiceClaimService } from 'projects/medicare/src/app/medical-invoice-manager/services/medical-invoice-claim.service';
import { DatePipe } from '@angular/common';

export enum SelectType {
  single,
  multiple
}

@Component({
  selector: 'app-invoice-switch-batch-search-pev-table-results',
  templateUrl: './invoice-switch-batch-search-pev-table-results.component.html',
  styleUrls: ['./invoice-switch-batch-search-pev-table-results.component.css']
})
export class InvoiceSwitchBatchSearchPevTableResultsComponent implements OnInit {

  personEventSearchNavigationEnum = PersonEventSearchNavigationEnum;
  @Output() selectedPersonEventSearchResultsEvent = new EventEmitter<any>();
  @Output() newSearchQuery = new EventEmitter<number>();
  @Output() formSearchControlVisibleState = new EventEmitter<number>();
  @Input() showPEVTableEventInput: boolean;
  @Input() personEventResultsTableData: any[] = [];
  @Input() medicalSwitchBatchSearchPersonEvent: MedicalSwitchBatchSearchPersonEvent;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  medicalInvoiceDetailsList: MedicalSwitchBatchSearchPersonEvent[] = [];
  dataSourceInvoiceDetails = new MatTableDataSource<MedicalSwitchBatchSearchPersonEvent>(this.medicalInvoiceDetailsList);
  loading$ = new BehaviorSubject<boolean>(false);
  personEventResultsTableShow: number = this.personEventSearchNavigationEnum.HideOption;
  dataSource: MedicalInvoiceSwitchBatchPersonEventSearchDatasourceService;

  displayedColumnsInvoiceDetails: string[] = [
    'select',
    'dateOfEvent',
    'mainClaimRefNo',
    'fullFirstName',
    'industryNumber',
    'idNumber',
    'otherIdentification',
    'dateOfBirth',
    'pensionNumber'
  ];

  constructor(
    public lookupService: LookupService,
    public readonly datepipe: DatePipe,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly medicalInvoiceClaimService: MedicalInvoiceClaimService,
    public dialog: MatDialog) {
  }

  ngOnInit() {
    this.personEventResultsTableShow = this.personEventSearchNavigationEnum.HideOption;
    this.dataSource = new MedicalInvoiceSwitchBatchPersonEventSearchDatasourceService(this.medicalInvoiceClaimService);
  }

  ngAfterViewInit(): void {
    this.dataSource.rowCount$.subscribe(count => {
      this.paginator.length = count
    });

    this.sort.sortChange.subscribe(() => {
      this.loadData();
    });

    this.paginator.page.subscribe(() => {
      this.loadData();
    });
    
  }

  isEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  }


  ngOnChanges(changes: SimpleChanges) {

    if (this.paginator.length > 0) {
      this.personEventResultsTableShow = this.personEventSearchNavigationEnum.ShowOption;
    }

    if (!isNullOrUndefined(changes.personEventResultsTableData.currentValue) && !this.isEmpty(changes.personEventResultsTableData.currentValue)) {//need to relook
      this.medicalSwitchBatchSearchPersonEvent = changes.medicalSwitchBatchSearchPersonEvent.currentValue;
      this.loadData()
    }
  }

  selection = new SelectionModel<MedicalSwitchBatchSearchPersonEvent>(true, []);

  selectType = [
    { text: "Single", value: SelectType.single },
    { text: "Multiple", value: SelectType.multiple }
  ];

  displayType = SelectType.single;

  selectHandler(row: MedicalSwitchBatchSearchPersonEvent) {
    if (this.displayType == SelectType.single) {
      if (!this.selection.isSelected(row)) {
        this.selection.clear();
      }
    }
    this.selection.toggle(row);
    this.selectedPersonEventSearchResultsEvent.emit(this.selection.selected)
    this.personEventResultsTableShow = this.personEventSearchNavigationEnum.HideOption;

  }

  onNewSearch() {
    this.newSearchQuery.emit(this.personEventSearchNavigationEnum.ShowOption);
    this.personEventResultsTableShow = this.personEventSearchNavigationEnum.HideOption;
  }


  loadData(): void {
  
    let searchParams: MedicalSwitchBatchSearchPersonEvent = {
     industryNumber: this.medicalSwitchBatchSearchPersonEvent.industryNumber,
     coEmployeeNo: this.medicalSwitchBatchSearchPersonEvent.coEmployeeNo,
     surname: this.medicalSwitchBatchSearchPersonEvent.surname,
     pensionNumber: this.medicalSwitchBatchSearchPersonEvent.pensionNumber,
     fullFirstName: this.medicalSwitchBatchSearchPersonEvent.fullFirstName,
     passPortNumber: this.medicalSwitchBatchSearchPersonEvent.passPortNumber,
     initials: this.medicalSwitchBatchSearchPersonEvent.initials,
     passportNationality: this.medicalSwitchBatchSearchPersonEvent.passportNationality,
     idNumber: this.medicalSwitchBatchSearchPersonEvent.idNumber,
     eventId: this.medicalSwitchBatchSearchPersonEvent.eventId,
     personEventId: 0,
     claimId: 0,
     claimReferenceNumber: '',
     otherIdentification: this.medicalSwitchBatchSearchPersonEvent.otherIdentification,
     mainClaimRefNo: this.medicalSwitchBatchSearchPersonEvent.mainClaimRefNo,
     dateOfBirth: this.medicalSwitchBatchSearchPersonEvent.dateOfBirth,
     dateOfEvent: this.medicalSwitchBatchSearchPersonEvent.dateOfEvent,
     eventDescription: '',
     accidentDetailPersonEventId: 0,
     isFatal: false
    }

    let searchParamsData = JSON.stringify(searchParams);

    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, searchParamsData);

    this.dataSource.rowCount$.subscribe(count => {

      if (count < 0) {
        this.personEventResultsTableShow = this.personEventSearchNavigationEnum.HideOption;
      }
      else {
        this.personEventResultsTableShow = this.personEventSearchNavigationEnum.ShowOption;
        this.formSearchControlVisibleState.emit(this.personEventSearchNavigationEnum.HideOption);
      }
    });

  }


}
