import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { HealthcareProviderService } from '../../../medi-manager/services/healthcareProvider.service';
import { PreauthViewModalComponent } from '../../modals/preauth-view-modal/preauth-view-modal.component';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';

@Component({
  selector: 'app-medical-invoice-linked-preauth-list',
  templateUrl: './medical-invoice-linked-preauth-list.component.html',
  styleUrls: ['./medical-invoice-linked-preauth-list.component.css']
})
export class MedicalInvoiceLinkedPreauthListComponent implements OnInit {

  @Input() linkPreAuthDetails: PreAuthorisation[];
  @Input() switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;//default val used if not set/passed

  preAuthStatus = PreAuthStatus;
  preauthType = PreauthTypeEnum;

  displayedColumns: string[] = [
    'preAuthNumber',
    'preAuthType',
    'preAuthStatus',
    'dateAuthorisedFrom',
    'dateAuthorisedTo',
    'dateAuthorised',
    'authorisedAmount',
    'injuryDate',
    'isClaimLinked',
    'isPatientVerified',
    'preAuthContactNumber',
    'viewMoreInfo'
  ]

  form: UntypedFormGroup;
  startDate = new Date();
  currentUser: string;

  hideForm = true;
  hasPermission = true;
  requiredPermission = '';

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly healthCareProvider: HealthcareProviderService,
    public dialog: MatDialog,
    public readonly datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      preAuthNumber: [{ value: '', disabled: true }],
      preAuthType: [{ value: '', disabled: true }],
      preAuthStatus: [{ value: '', disabled: true }],
      dateAuthorisedFrom: [{ value: '', disabled: true }],
      dateAuthorisedTo: [{ value: '', disabled: true }],
      dateAuthorised: [{ value: '', disabled: true }],
      authorisedAmount: [{ value: '', disabled: true }],
      injuryDate: [{ value: '', disabled: true }],
      isClaimLinked: [{ value: '', disabled: true }],
      isPatientVerified: [{ value: '', disabled: true }],
      preAuthContactNumber: [{ value: '', disabled: true }]
    });
  }

  //open preAuth modal on list view click
  openPreauthViewModal(preAuthId): void {
    const dialogRef = this.dialog.open(PreauthViewModalComponent, {
      width: '85%',
      data: { id: preAuthId, switchBatchType: this.switchBatchType }
    });
  }

}
