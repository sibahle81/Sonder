import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ActivatedRoute, Router} from '@angular/router';
import * as moment from 'moment';
import {ToastrManager} from 'ng6-toastr-notifications';
import {IdTypeEnum} from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import {Person} from 'projects/shared-components-lib/src/lib/models/person.model';
import {CertificateOfLifeStatusEnum} from 'projects/shared-models-lib/src/lib/enums/certificate-of-life-status-enum';
import {PensionLedgerStatusEnum} from 'projects/shared-models-lib/src/lib/enums/pension-ledger-status.enum';
import {BehaviorSubject, fromEvent, merge, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import {PensionLedgerService} from '../../../pensioncase-manager/services/pension-ledger.service';
import {PensionCaseContextEnum} from '../../../shared-penscare/enums/pensioncase-context-enum';
import {CertificateOfLifeDetail} from '../../../shared-penscare/models/certificate-of-life-detail';
import {TebaFileData} from '../../../shared-penscare/models/teba-file-data';
import {ProofOfLifeService} from '../../../pensioncase-manager/services/proof-of-life.service';
import {MatTableDataSource} from '@angular/material/table';
import {SftpRequest} from '../../../shared-penscare/models/sftp-request';
import {AppEventsManager} from '../../../../../../shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import {AuthService} from '../../../../../../shared-services-lib/src/lib/services/security/auth/auth.service';
import {ConfirmationDialogsService} from '../../../../../../shared-components-lib/src/lib/confirm-message/confirm-message.service';
import {AlertService} from '../../../../../../shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'app-teba-file-data-list',
  templateUrl: './teba-file-data-list.component.html',
  styleUrls: ['./teba-file-data-list.component.css'],
})

export class TebaFileDataListComponent implements OnInit {

  constructor(
    private readonly pensionLedgerService: PensionLedgerService,
    private readonly proofOfLifeService: ProofOfLifeService,
    private formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private readonly  confirmService: ConfirmationDialogsService,
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly authService: AuthService,
    private readonly activatedRoute: ActivatedRoute
  ) {
  }

  @Input() componentSftpRequestInputData: SftpRequest;
  @Input() requestProofOfLifeValidation: boolean;
  @ViewChild('searchField', {static: false}) filter: ElementRef;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  elementKeyUp: Subscription;
  form: UntypedFormGroup;
  currentQuery: string;
  creatingWizard = false;
  pensionCaseContext = PensionCaseContextEnum;
  idType = IdTypeEnum;
  pensionLedgerStatus = PensionLedgerStatusEnum;
  certificateOfLifeStatus = CertificateOfLifeStatusEnum;
  tebaFileData: TebaFileData [] = [];
  filteredTebaFileData: TebaFileData [] = [];
  isLoadingTebaData$: BehaviorSubject<boolean> = new BehaviorSubject(
    false,
  );
  public dataSource = new MatTableDataSource<TebaFileData>();
  menus: { title: string, action: string, disable: boolean }[];
  displayedColumns = [
    'description',
    'pensionRefNo',
    'industryNo',
    'names',
    'surname',
    'benefitCode',
    'status',
    'dateOfBirth',
    'idNo',
    'passportNo',
    'pensionStatus',
    'processedDate',
    'actions',

  ];
  selectedTebaFileData: TebaFileData;
  editMode: boolean;
  creatingFile = false;
  certificateOfLife: any;
  protected readonly CertificateOfLifeStatusEnum = CertificateOfLifeStatusEnum;
  @Output() emitNewSftpRequested = new EventEmitter<SftpRequest>();


  ngOnInit(): void {
    this.createForm();
    this.tebaFileData = [];
    this.isLoadingTebaData$.next(true);
    if (!this.requestProofOfLifeValidation) {
      this.getTebaFileData(this.componentSftpRequestInputData.sftpRequestId);
    } else {
      this.getProofOfLifeDataForValidation();
    }
    this.isLoadingTebaData$.next(false);
  }

  getTebaFileData(sftpRequestId: number) {
    if (sftpRequestId) {
      this.proofOfLifeService.getProofOfLifeDataSendForValidationBySourceRequestId(sftpRequestId).subscribe(result => {
        this.tebaFileData = result;
        this.BindDataSource(this.tebaFileData);
      });
    }
  }

  getProofOfLifeDataForValidation() {
    this.proofOfLifeService.getProofOfLifeDataForValidation().subscribe(result => {
      this.tebaFileData = result;
      this.BindDataSource(this.tebaFileData);
    });
  }

  BindDataSource(tebaFileData: TebaFileData []): void {
    this.dataSource.data = tebaFileData;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  refreshDataSource(): void {
    this.dataSource.data = this.tebaFileData;
  }

  createForm(): void {
    if (this.form) {
      return;
    }
    this.form = this.formBuilder.group({query: new UntypedFormControl('', [Validators.minLength(3), Validators.required])});
  }

  search(): void {
    if (this.form.valid) {
      this.currentQuery = this.readForm()?.toLowerCase();
      this.filteredTebaFileData = this.tebaFileData.slice();
      this.filteredTebaFileData = this.filteredTebaFileData.filter(x =>  x.benefitCode?.toLowerCase().includes(this.currentQuery)
        || x.idNo?.toLowerCase().includes(this.currentQuery ) || x.passportNo?.toLowerCase().includes(this.currentQuery ) || x.names?.toLowerCase().includes(this.currentQuery )
        || x.status?.toLowerCase().includes(this.currentQuery )  ||  x.pensionRefNo?.toLowerCase().includes(this.currentQuery)  || x.surname?.toLowerCase().includes(this.currentQuery )
        || x.industryNo?.toLowerCase().includes(this.currentQuery )
      );
      this.BindDataSource(this.filteredTebaFileData);
    }else{
      this.BindDataSource(this.tebaFileData);
    }
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
  }

  onRemoveTebaDataRecord(row: TebaFileData) {
    this.confirmService
      .confirmWithoutContainer(
        'Teba member validation',
        'Are you sure you want to remove the member from Teba validation list?',
        'Center',
        'Center',
        'Yes',
        'No',
      )
      .subscribe((result) => {
        if (result === true) {
          this.tebaFileData = this.tebaFileData.filter(x => x !== row);
          this.BindDataSource(this.tebaFileData);
        }
      });
  }

  onCreateValidationRequest(){

    if (this.tebaFileData.length === 0 ){
      this.alertService.error(
        'Cannot send empty list to Teba for member validation.',
      );
      return;
    }

    this.confirmService
      .confirmWithoutContainer(
        'Teba member validation',
        'Are you sure you want to send the member to Teba for validation?',
        'Center',
        'Center',
        'Yes',
        'No',
      )
      .subscribe((result) => {
        if (result === true) {
          this.isLoadingTebaData$.next(true);
          this.proofOfLifeService.requestProofOfLifeVerification(this.tebaFileData).subscribe((result: SftpRequest) => {
             if (result && result.sftpRequestId > 0){
               this.emitNewSftpRequested.emit(result);
             }
             this.isLoadingTebaData$.next(false);
          });
        }
      });
  }
  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}

