import {ChangeDetectorRef, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import {BehaviorSubject, fromEvent, merge, Subscription} from 'rxjs';
import { PensionLedgerService } from '../../../pensioncase-manager/services/pension-ledger.service';
import { PensionCaseContextEnum } from '../../../shared-penscare/enums/pensioncase-context-enum';
import {MatDialog} from '@angular/material/dialog';
import {DatePipe} from '@angular/common';
import {AlertService} from '../../../../../../shared-services-lib/src/lib/services/alert/alert.service';
import {SftpRequestStatusTypeEnum} from '../../../../../../shared-models-lib/src/lib/enums/sftp-request-status-type-enum';
import {SftpRequest} from '../../../shared-penscare/models/sftp-request';
import {MatTableDataSource} from '@angular/material/table';
import {ProofOfLifeService} from '../../../pensioncase-manager/services/proof-of-life.service';
import {TebaFileData} from '../../../shared-penscare/models/teba-file-data';
import {TebaFileDataListComponent} from '../teba-file-data-list/teba-file-data-list.component';

@Component({
  selector: 'app-teba-sftp-file-request-list',
  templateUrl: './teba-sftp-file-request-list.component.html',
  styleUrls: ['./teba-sftp-file-request-list.component.css' ],
})
export class TebaSftpFileRequestListComponent implements OnInit{


  constructor(
    private readonly proofOfLifeService: ProofOfLifeService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private readonly alertService: AlertService,
    public dialog: MatDialog,
    private readonly datePipe: DatePipe
  ) { }

  elementKeyUp: Subscription;
  tebaSftpRequestForm: FormGroup;
  currentQuery: string;
  creatingWizard = false;
  pensionCaseContext = PensionCaseContextEnum;
  idType = IdTypeEnum;

  menus: { title: string, action: string, disable: boolean}[];
  displayedColumns = [
    'fileName',
    'sftpRequestStatus',
    'itemsInRequest',
    'noResponses',
    'requestedDate',
    'createdBy',
    'actions'
  ];

  editMode: boolean;
  showMemberTable = false;
  selectedSftpRequestStatusTypeId: number;
  selectedFromDate: Date;
  selectedToDate: Date;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tebaSftpRequestData: SftpRequest [];
  selectedTebaSftpRequestData: SftpRequest;
  requestProofOfLifeValidation: boolean;
  dataSource = new MatTableDataSource<SftpRequest>();
  @ViewChild('paginator', {read: MatPaginator}) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  sftpRequestStatusTypes: any[] = [];
  @ViewChild(TebaFileDataListComponent, { static: false }) tebaFileDataListComponent: TebaFileDataListComponent;
  protected  SftpRequestStatusTypeEnum = SftpRequestStatusTypeEnum;

  ngOnInit(): void {
    this.getLookups();
    this.getTebaSftpRequests();
  }

  getLookups() {
    this.tebaSftpRequestData = [];
    this.loadSftpRequestStatusTypes();
    this.createForm();
  }

  loadSftpRequestStatusTypes() {
    this.sftpRequestStatusTypes = this.ToArray(SftpRequestStatusTypeEnum);
  }

  createForm(): void {
    this.tebaSftpRequestForm = this.fb.group({
      sftpRequestStatus: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    });
  }

  BindDataSource(): void {
    this.dataSource.data = this.tebaSftpRequestData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  refreshDataSource(): void {
    this.dataSource.data = this.tebaSftpRequestData;
  }

  searchSftpFileRequests() {

    if ( !this.selectedSftpRequestStatusTypeId ){
      this.alertService.error(
        'Please select request status.',
      );
    }
    if (!this.selectedToDate  ){
      this.alertService.error(
        'Please select To date.',
      );
    }

    if (!this.selectedFromDate ){
      this.alertService.error(
        'Please select From date.',
      );
    }

    if ( this.selectedSftpRequestStatusTypeId && this.selectedToDate && this.selectedFromDate ){
      this.isLoading$.next(true);
      this.tebaSftpRequestData = [];
      this.proofOfLifeService
        .getTebaSftpRequestByDateRange( this.datePipe.transform(this.selectedFromDate, 'yyyy-MM-dd'), this.datePipe.transform(this.selectedToDate, 'yyyy-MM-dd'))
        .subscribe((results) => {
          if (results && results.length > 0){
            this.tebaSftpRequestData = results.filter(x => x.sftpRequestStatus ===  this.selectedSftpRequestStatusTypeId);
          }
          this.BindDataSource();
        });

      this.isLoading$.next(false);
    }

  }

getTebaSftpRequests(){
  this.isLoading$.next(true);
  this.tebaSftpRequestData = [];
  this.proofOfLifeService
    .getTebaSftpRequests()
    .subscribe((results) => {
      if (results && results.length > 0){
        this.tebaSftpRequestData = results;
      }
      this.BindDataSource();
    });
  this.isLoading$.next(false);
}

  onViewTebaSftpRequest(row: SftpRequest, i) {
    this.selectedTebaSftpRequestData = row;
    if (row) {
        this.showMemberTable = true;
        this.requestProofOfLifeValidation = false;
    }
  }

  onSftpRequestStatusTypeChange($event: any) {
    this.selectedSftpRequestStatusTypeId = Number(SftpRequestStatusTypeEnum[$event.value]) ;
  }

  fromDateChanged($event: any) {
    this.selectedFromDate = new Date($event.value);
  }

  toDateChanged($event: any) {
    this.selectedToDate = new Date($event.value);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookups();
  }
  ngAfterViewInit()
  {
    this.dataSource.paginator = this.paginator;
  }

  onHideMemberTable() {
    this.showMemberTable = false;
  }

  requestNewTebaSftpFileRequest() {
    this.requestProofOfLifeValidation = true;
    this.showMemberTable = true;
  }

  addNewSftpRequested($event: any) {
    const newSftpRequest = $event;
    if (newSftpRequest){
      this.tebaSftpRequestData.push(newSftpRequest);
      this.onHideMemberTable();
      this.BindDataSource();
      this.alertService.success(
        'File send to Teba for member validation.',
      );
    }
  }
}

