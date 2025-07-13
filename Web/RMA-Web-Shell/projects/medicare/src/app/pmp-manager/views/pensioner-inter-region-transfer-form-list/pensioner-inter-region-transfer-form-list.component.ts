import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { PmpRegionTransfer } from '../../models/pmp-region-transfer';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CrudActionType } from '../../../shared/enums/crud-action-type';
import { PensionClaim } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { MedicareItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medicare-item-type-enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-pensioner-inter-region-transfer-form-list',
  templateUrl: './pensioner-inter-region-transfer-form-list.component.html',
  styleUrls: ['./pensioner-inter-region-transfer-form-list.component.css']
})
export class PensionerInterRegionTransferFormListComponent {

  @Input() passedPensionCase: PensionClaim;
  @Input() passedPmpRegionTransferData: PmpRegionTransfer[];
  @Output() PensionerInterviewFormEmit: EventEmitter<PmpRegionTransfer> = new EventEmitter();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isReadOnly = false;
  pensionCaseId: number;
  pensionCaseNumber: string;
  pensionerId: number;
  claimId: number;
  pmpRegionTransferId: number;
  isLoading: boolean;
  dataSource = new MatTableDataSource<PmpRegionTransfer>();
  pmpRegions: Lookup[];
  allReferringAndReceivingUsers: User[];

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'referringMcaId', show: true },
      { def: 'receivingMcaId', show: true },
      { def: 'referringPaId', show: true },
      { def: 'receivingPaId', show: true },
      { def: 'referringPmpRegionId', show: true },
      { def: 'healthCareProviderId', show: true },
      { def: 'expDateOfArrival', show: true },
      { def: 'createdDate', show: true },
      { def: 'createdBy', show: true },
      { def: 'modifiedDate', show: true },
      { def: 'modifiedBy', show: true },
      { def: 'actions', show: true },
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  constructor(private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly userService: UserService,
    private lookupService: LookupService,) {
    this.loadAllReferringAndReceivingUsers();
    this.getPMPRegions();
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes?.passedPmpRegionTransferData?.currentValue) {
      this.dataSource.data = changes?.passedPmpRegionTransferData?.currentValue;
      this.dataSource = new MatTableDataSource<PmpRegionTransfer>(changes?.passedPmpRegionTransferData?.currentValue);
    }

    if (changes?.passedPensionCase?.currentValue) {
      this.pensionCaseNumber = changes?.passedPensionCase?.currentValue?.pensionCaseNumber;
      this.claimId = changes?.passedPensionCase?.currentValue?.claimId;
      this.pensionerId = changes?.passedPensionCase?.currentValue?.pensionerId;
    }

  }

  listData() {

  }

  view($event: PmpRegionTransfer) {

    this.pensionCaseNumber = (!isNullOrUndefined(this.pensionCaseNumber) || !this.pensionCaseNumber || this.pensionCaseNumber === '') ? this.pensionCaseNumber : '0';
    this.pmpRegionTransferId = $event.pmpRegionTransferId;
    this.router.navigate(['/medicare/pmp-manager/pensioner-inter-region-transfer/', this.pensionerId, this.pensionCaseNumber, this.claimId, this.pmpRegionTransferId, CrudActionType.read]);
  }


  add() {

    this.pensionCaseNumber = (!isNullOrUndefined(this.pensionCaseNumber) || !this.pensionCaseNumber || this.pensionCaseNumber === '') ? this.pensionCaseNumber : '0';
    this.pensionerId = this.pensionerId > 0 ? this.pensionerId : 0;
    this.claimId = this.claimId > 0 ? this.claimId : 0;
    this.pmpRegionTransferId = this.pmpRegionTransferId > 0 ? this.pmpRegionTransferId : 0;
    this.router.navigate(['/medicare/pmp-manager/pensioner-inter-region-transfer/', this.pensionerId, this.pensionCaseNumber, this.claimId, this.pmpRegionTransferId, CrudActionType.create]);

  }

  edit($event: PmpRegionTransfer) {

    this.pensionCaseNumber = (!isNullOrUndefined(this.pensionCaseNumber) || !this.pensionCaseNumber || this.pensionCaseNumber === '') ? this.pensionCaseNumber : '0';
    this.pmpRegionTransferId = $event.pmpRegionTransferId;
    this.router.navigate(['/medicare/pmp-manager/pensioner-inter-region-transfer/', this.pensionerId, this.pensionCaseNumber, this.claimId, this.pmpRegionTransferId, CrudActionType.edit]);

  }


  loadAllReferringAndReceivingUsers(): void {
    this.isLoading = true;

    const roles = [RoleEnum.PensionServiceAdministrator.toString(),
    RoleEnum.PensionerMedicalCaseAuditor.toString(),
    RoleEnum.PensionLiaisonOfficer.toString(),
    RoleEnum.PensionsManager.toString(),
    RoleEnum.GeneralManagerPension.toString(),
    RoleEnum.HealthCareProvider.toString(),
    ]

    this.userService.getUsersByRoleIds(roles).subscribe(
      data => {
        this.isLoading = false;
        if (data) {
          this.allReferringAndReceivingUsers = data;
        }
      }
    );
  }

  getPMPRegions(): void {
    this.isLoading = true;
    this.lookupService.getPMPRegions().subscribe(
      data => {
        this.pmpRegions = data;
        this.isLoading = false;
      }
    );
  }

  getUserNameById(id: number): string {
    if (!isNullOrUndefined(this.allReferringAndReceivingUsers)) {
      const firstUser = this.allReferringAndReceivingUsers.find(user => user.id == id);
      return !isNullOrUndefined(firstUser) ? firstUser.displayName : 'N/A';
    }
    else {
      return "loading..."
    }
  }

  getRegionNameById(id: number): string {
    if (!isNullOrUndefined(this.pmpRegions)) {
      const firstRegion = this.pmpRegions.find(r => r.id == id);
      return !isNullOrUndefined(firstRegion) ? firstRegion.name : 'N/A';
    }
    else {
      return "loading..."
    }
  }

  openAuditDialog(item: PmpRegionTransfer) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.MediCareManager,
        clientItemType: MedicareItemTypeEnum.PmpRegionTransfer,
        itemId: item.pmpRegionTransferId,
        heading: 'PMP Region Transfer Audit Trail',
        propertiesToDisplay: [
          'IsUDS', 'IsSpousalTraining', 'DateOfTransfer', 'ExpDateOfArrival', 'DateOfReferral', 'PassportVisaRenewalDate', 'ConfDateOfArrival', 'ReferringMCAId', 'ReceivingMCAId', 'ReferringPAId', 'ReceivingPAId', 'ReferringPMPRegionId', 'ReceivingPMPRegionId', 'Comments', 'ReasonForReferral', 'TreatmentReceived', 'Daigonsis', 'MedicationSundriesIssued', 'IssuedDate', 'IssuedMonth', 'IsAcute'
        ]
      }
    });
  }

}
