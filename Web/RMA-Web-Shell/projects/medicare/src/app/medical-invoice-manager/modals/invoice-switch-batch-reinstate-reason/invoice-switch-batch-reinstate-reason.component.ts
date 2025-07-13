import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject } from 'rxjs';
import { ToastrManager } from 'ng6-toastr-notifications';
import { MedicareMedicalInvoiceSwitchBatchService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service';
import { SwitchBatchInvoiceReinstateParams } from '../../models/switch-batch-invoice-reinstate-params';

@Component({
  selector: 'app-invoice-switch-batch-reinstate-reason',
  templateUrl: './invoice-switch-batch-reinstate-reason.component.html',
  styleUrls: ['./invoice-switch-batch-reinstate-reason.component.css']
})
export class InvoiceSwitchBatchReinstateReasonComponent implements OnInit {

  form: UntypedFormGroup;
  loading$ = new BehaviorSubject<boolean>(false);
  switchBatchInvoicesToReinstate;
  reinstateReason;
  switchBatchInvoiceReinstateParams: SwitchBatchInvoiceReinstateParams;
  canSubmit: boolean = false;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<InvoiceSwitchBatchReinstateReasonComponent>,
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly medicareMedicalInvoiceSwitchBatchService: MedicareMedicalInvoiceSwitchBatchService,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.switchBatchInvoicesToReinstate = data.switchBatchInvoicesToReinstate;
    this.switchBatchInvoiceReinstateParams =  new SwitchBatchInvoiceReinstateParams();
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
        reinstateReason: [''],
    });
  }

  onResetForm() {
    this.form.reset();
  }

  onSubmitClick() {
    this.loading$.next(true);
    this.switchBatchInvoiceReinstateParams.switchBatchInvoiceIds = this.switchBatchInvoicesToReinstate;
    if (this.form.value.reinstateReason != "")
    {
        this.switchBatchInvoiceReinstateParams.reinstateReason = this.form.value.reinstateReason;

        this.medicareMedicalInvoiceSwitchBatchService.reinstateSwitchBatchInvoices(this.switchBatchInvoiceReinstateParams).subscribe(res =>{
            this.loading$.next(false);
            this.dialogRef.close(true);
            this.alertService.success(`Re-instated successfully`);
        })    
    }
    else
    {
        this.loading$.next(false);
        this.toastr.infoToastr('Please provide Reinstate Reason');
    }
  }

}