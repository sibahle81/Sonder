import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { PensionerInterviewForm } from '../../models/pensioner-interview-form-detail';
import { PensionClaim } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { CrudActionType } from '../../../shared/enums/crud-action-type';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { MedicareItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medicare-item-type-enum';

@Component({
  selector: 'app-pensioner-interview-form-list',
  templateUrl: './pensioner-interview-form-list.component.html',
  styleUrls: ['./pensioner-interview-form-list.component.css']
})
export class PensionerInterviewFormListComponent {

  @Input() passedPensionCase: PensionClaim;
  @Input() passedPensionerInterviewFormData: PensionerInterviewForm[];
  @Output() PensionerInterviewFormEmit: EventEmitter<PensionerInterviewForm> = new EventEmitter();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isReadOnly = false;
  pensionCaseId: number;
  pensionCaseNumber: string;
  pensionerId: number;
  claimId: number;
  pensionerInterviewFormId: number;
  isLoading: boolean;
  dataSource = new MatTableDataSource<PensionerInterviewForm>();

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'interviewDate', show: true },
      { def: 'relocation', show: true },
      { def: 'col', show: true },
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

  constructor(private readonly router: Router,public dialog: MatDialog) {

  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes?.passedPensionerInterviewFormData?.currentValue) {
      this.dataSource.data = changes?.passedPensionerInterviewFormData?.currentValue;
      this.dataSource = new MatTableDataSource<PensionerInterviewForm>(changes?.passedPensionerInterviewFormData?.currentValue);
    }

    if (changes?.passedPensionCase?.currentValue) {
      this.pensionCaseNumber = changes?.passedPensionCase?.currentValue?.pensionCaseNumber;
      this.claimId = changes?.passedPensionCase?.currentValue?.claimId;
      this.pensionerId = changes?.passedPensionCase?.currentValue?.pensionerId;
    }

  }

  listData() {

  }

  view($event: PensionerInterviewForm) {

    this.pensionerId = $event.pensionerId > 0 ? $event.pensionerId : 0;
    this.pensionCaseNumber = (!isNullOrUndefined(this.pensionCaseNumber) || !this.pensionCaseNumber || this.pensionCaseNumber === '') ? this.pensionCaseNumber : '0';
    this.pensionerInterviewFormId = $event.pensionerInterviewFormId;
    this.router.navigate(['/medicare/pmp-manager/pensioner-interview-form/', this.pensionerId, this.pensionCaseNumber, this.claimId, this.pensionerInterviewFormId, CrudActionType.read]);
  }


  add() {

    this.pensionCaseNumber = (!isNullOrUndefined(this.pensionCaseNumber) || !this.pensionCaseNumber || this.pensionCaseNumber === '') ? this.pensionCaseNumber : '0';
    this.pensionerId = this.pensionerId > 0 ? this.pensionerId : 0;
    this.claimId = this.claimId > 0 ? this.claimId : 0;
    this.pensionerInterviewFormId = this.pensionerInterviewFormId > 0 ? this.pensionerInterviewFormId : 0;
    this.router.navigate(['/medicare/pmp-manager/pensioner-interview-form/', this.pensionerId, this.pensionCaseNumber, this.claimId, this.pensionerInterviewFormId, CrudActionType.read]);

  }

  edit($event: PensionerInterviewForm) {

    this.pensionerId = $event.pensionerId > 0 ? $event.pensionerId : 0;
    this.pensionerInterviewFormId = $event.pensionerInterviewFormId;
    this.pensionCaseNumber = (!isNullOrUndefined(this.pensionCaseNumber) || !this.pensionCaseNumber || this.pensionCaseNumber === '') ? this.pensionCaseNumber : '0';
    this.router.navigate(['/medicare/pmp-manager/pensioner-interview-form/', this.pensionerId, this.pensionCaseNumber, this.claimId, this.pensionerInterviewFormId, CrudActionType.edit]);

  }

  openAuditDialog(item: PensionerInterviewForm) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.MediCareManager,
        clientItemType: MedicareItemTypeEnum.PensionerInterviewForm,
        itemId: item.pensionerInterviewFormId,
        heading: 'Pensioner Interview Form Audit Trail',
        propertiesToDisplay: [
          'Transporting', 'InfoBrochure', 'COL', 'IsInjury', 'OccupationaInjuryName', 'IsDisease', 'OccupationalDiseaseName', 'IsAmputee', 'IsWheelchairIssued', 'WheelchairIssued', 'MakeModel', 'ApplianceReviewDate', 'LimbAmputated', 'LevelOfAmputation', 'IsCAA', 'IsInstitutionalised', 'NameOfInstitution', 'ContactNoOfInstitution', 'ExplainedCalculation', 'ExplainedPayDates', 'ExplainedProofOfLife', 'ExplainedIncreases', 'ExplainedMedicalTreatment', 'ExplainedPreAuthorisation', 'ExplainedMaintenance', 'SuppliedBooklet', 'SuppliedContactDetails', 'ExplainedChronicMedication', 'ExplainedTransportation'
        ]
      }
    });
  }


}
