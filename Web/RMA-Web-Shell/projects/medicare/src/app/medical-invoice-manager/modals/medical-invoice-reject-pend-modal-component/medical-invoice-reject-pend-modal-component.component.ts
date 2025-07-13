import { Component, Inject } from '@angular/core';
import { SwitchBatchDeleteReason } from '../../models/switch-batch-delete-reason';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MedicareMedicalInvoiceSwitchBatchService } from '../../services/medicare-medical-invoice-switch-batch.service';
import { InvoiceSwitchBatchDeleteReasonComponent } from '../invoice-switch-batch-delete-reason/invoice-switch-batch-delete-reason.component';
import { InvoiceDetails } from '../../models/medical-invoice-details';
import { InvoiceStatusEnum } from '../../enums/invoice-status.enum';
import { MedicalUnderAssessReasonServiceService } from '../../services/medical-under-assess-reason-service.service';
import { InvoiceUnderAssessReason } from '../../models/invoice-under-assess-reason';
import { UnderAssessReason } from '../../models/under-assess-reason';
import { InvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-type-enum';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';

@Component({
  selector: 'app-medical-invoice-reject-pend-modal-component',
  templateUrl: './medical-invoice-reject-pend-modal-component.component.html',
  styleUrls: ['./medical-invoice-reject-pend-modal-component.component.css']
})
export class MedicalInvoiceRejectPendModalComponentComponent {

  loading$ = new BehaviorSubject<boolean>(true);
  switchBatchInvoiceToDelete;
  form: UntypedFormGroup;
  deleteReasons = [];
  deletedReason: UnderAssessReason;
  editedSwitchBatchDeleteReason: number = 0;
  invoiceDataSelected: InvoiceDetails;
  actionData:string;
  rejectPendHeader = "";
  labelNote:string =  "";
  showDropdownRejectPend: boolean = true;
  switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;//default val used if not set/passed
  rejectPendArray: Array<Object> = [
    { id: InvoiceStatusEnum.Rejected, name: 'Reject' },
    { id: InvoiceStatusEnum.Pending, name: 'Pend' },
    { id: InvoiceStatusEnum.Deleted, name: 'Delete' }
  ];

  constructor(private readonly formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<InvoiceSwitchBatchDeleteReasonComponent>,
    private router: Router,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly medicareMedicalInvoiceSwitchBatchService: MedicareMedicalInvoiceSwitchBatchService,
    private readonly medicalUnderAssessReasonServiceService: MedicalUnderAssessReasonServiceService,
    @Inject(MAT_DIALOG_DATA) public invoiceDataClicked: any) {
      this.invoiceDataSelected = invoiceDataClicked.invoiceDataClicked;
      this.actionData=invoiceDataClicked.actionData
      this.switchBatchType = invoiceDataClicked.switchBatchType;
    }


  ngOnInit() {
    this.loading$.next(true)
    this.createForm();
    this.onRejectPendChange(this.actionData)
  }

  createForm() {
    this.form = this.formBuilder.group({
      rejectPend: new UntypedFormControl(''),
      deleteReason: new UntypedFormControl(''),
      description: new UntypedFormControl('', [Validators.minLength(10)]),
    });
  }

  onResetForm() {
    this.form.reset();
  }

  onRejectPendChange($event) {
    let action:InvoiceStatusEnum = typeof $event == "object" ? $event.value : $event;
    this.PopulateDropdown(action);
    switch (action) {
      case InvoiceStatusEnum.Deleted:
        this.rejectPendHeader = "Delete ";
        this.showDropdownRejectPend = false;
        this.labelNote = "Deleting an Invoice will set the Invoice status to Deleted and the Invoicing Party will be Notified via Portal";
        break;
      case  InvoiceStatusEnum.Rejected:
        this.rejectPendHeader = "Reject ";
        this.showDropdownRejectPend = true;
        this.labelNote = "Rejecting an Invoice will set the Invoice status to Rejected and the Invoicing Party will be Notified via Portal";
        break;
      case  InvoiceStatusEnum.Pending:
        this.rejectPendHeader = "Pend ";
        this.labelNote = "Pending an Invoice will set the Invoice status to Pending and the Invoicing Party will be Notified via Portal";
        this.showDropdownRejectPend = true;
        break;
    }
  }

  PopulateDropdown(action:InvoiceStatusEnum){
    this.loading$.next(true);
      this.medicalUnderAssessReasonServiceService.getUnderAssessReasonsByInvoiceStatus(action).subscribe(resp => {
        this.deleteReasons = resp;
        this.loading$.next(false);
      });
  }

  onReasonChange(e) {
    this.deletedReason = e.value;
  }

  onSubmit() {
    this.loading$.next(true);
    let InvoiceStatusSet:InvoiceStatusEnum = this.form.value.rejectPend;
    //refectoring - implimentation to come later
    let setUnderAssessReason: UnderAssessReason = {
      underAssessReasonId: this.deletedReason.underAssessReasonId,
      code: '',
      description: '',
      invoiceType: this.switchBatchType == SwitchBatchType.MedEDI ? InvoiceTypeEnum.Medical : InvoiceTypeEnum.Teba,
      invoiceStatus: InvoiceStatusSet,
      overrideAuditObjectTypeId: 0,
      confirmAuditObjectTypeId: 0,
      canReinstate: false,
      action: '',
      firstNotification: '',
      secondNotification: '',
      thirdNotification: '',
      isLineItemReason: false,
      invoiceId: this.switchBatchType == SwitchBatchType.MedEDI ? this.invoiceDataSelected.invoiceId : null,
      tebaInvoiceId: this.switchBatchType == SwitchBatchType.Teba ? this.invoiceDataSelected.invoiceId : null,
      underAssessReasonText: this.deletedReason.description,
      comments: this.form.value.description,
      id: 0,
      createdBy: '',
      modifiedBy: '',
      createdDate: undefined,
      modifiedDate: undefined,
      isActive: true,
      isDeleted: false,
      canEdit: false,
      canAdd: false,
      canRemove: false,
      permissionIds: []
    }
  
    this.medicalUnderAssessReasonServiceService.setInvoiceUnderAssessReason(setUnderAssessReason).subscribe(resp => {
      this.loading$.next(false);
      this.dialogRef.close(true);
      this.alertService.success(this.rejectPendHeader+`:Invoice successfully`);

    });
  }

}
