import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject } from 'rxjs';
import { MedicareMedicalInvoiceSwitchBatchService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service';
import { SwitchBatchDeleteReason } from '../../models/switch-batch-delete-reason';

@Component({
  selector: 'app-invoice-switch-batch-delete-reason',
  templateUrl: './invoice-switch-batch-delete-reason.component.html',
  styleUrls: ['./invoice-switch-batch-delete-reason.component.css']
})
export class InvoiceSwitchBatchDeleteReasonComponent implements OnInit {

  loading$ = new BehaviorSubject<boolean>(false);
  switchBatchInvoiceToDelete;
  form: UntypedFormGroup;
  deleteReasons = [];
  deletedReason: number = 0;
  editedSwitchBatchDeleteReason:number = 0;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<InvoiceSwitchBatchDeleteReasonComponent>,
    private router: Router,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly medicareMedicalInvoiceSwitchBatchService: MedicareMedicalInvoiceSwitchBatchService,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.switchBatchInvoiceToDelete = data.switchBatchInvoiceToDelete;
  }

  ngOnInit() {
    this.loading$.next(true)
    this.createForm();
    this.medicareMedicalInvoiceSwitchBatchService.getManualSwitchBatchDeleteReasons().subscribe(resp => {
      this.deleteReasons = resp;
      this.loading$.next(false);

    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      deleteReason: [''],
    });
  }

  onResetForm() {
    this.form.reset();
  }

  onDeleteReasonChange(e) {
    this.deletedReason = e.value;
  }

  onDeleteBatchInvoice() {
    this.loading$.next(true);

    let switchBatchDeleteReason:SwitchBatchDeleteReason = {
      switchBatchInvoiceId:this.switchBatchInvoiceToDelete.switchBatchInvoiceId,
      switchBatchDeleteReasonId:this.deletedReason
    }

    this.medicareMedicalInvoiceSwitchBatchService.SaveManualSwitchBatchDeleteReasonToDB(switchBatchDeleteReason).subscribe(resp => {
      this.loading$.next(false);
      this.dialogRef.close(true); 
      this.alertService.success(`Invoice deleted successfully`);

    });
  }

}




