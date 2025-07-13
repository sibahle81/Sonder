import { Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { InvoiceSwitchBatchDeleteReasonComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/invoice-switch-batch-delete-reason/invoice-switch-batch-delete-reason.component';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisationUnderAssessReason } from '../../models/preauthorisation-underassessreason';
import { PreAuthRejectReason } from '../../../medi-manager/models/preAuthRejectReason';

@Component({
  selector: 'app-preauth-delete-modal',
  templateUrl: './preauth-delete-modal.component.html',
  styleUrls: ['./preauth-delete-modal.component.css']
})

export class PreauthDeleteModalComponent {

  loading$ = new BehaviorSubject<boolean>(true);
  switchBatchInvoiceToDelete;
  form: UntypedFormGroup;
  deleteReasons = [];
  deletedReason: PreAuthRejectReason;
  preauthDataSelected: PreAuthorisation;
  actionData:string;
  preauthHeader = "";
  labelNote:string =  "";
  showDropdownRejectPend: boolean = true;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    public dialogRef: MatDialogRef<InvoiceSwitchBatchDeleteReasonComponent>,
    private router: Router,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    @Inject(MAT_DIALOG_DATA) public preauthData: any) {
      console.log(this.preauthData);
      this.preauthDataSelected = preauthData.preauthDataClicked;
      this.preauthHeader = preauthData.header;
    }

    ngOnInit() {
      this.loading$.next(true)
      this.createForm();
      this.PopulateDropdown();
      this.loading$.next(false);
    }
  
    createForm() {
      this.form = this.formBuilder.group({
        deleteReason: new UntypedFormControl(''),
        description: new UntypedFormControl('', [Validators.minLength(10)]),
      });
    }

    onResetForm() {
      this.form.reset();
    }

    getPreauthStatus(preAuthStatus: number): string {
      return PreAuthStatus[preAuthStatus];
    }

    PopulateDropdown(){
      this.loading$.next(true);
        this.mediCarePreAuthService.getPreAuthRejectReasonList().subscribe(resp => {
          this.deleteReasons = resp;
          this.loading$.next(false);
        });
    }

    onReasonChange(e) {
      this.deletedReason = e.value;
    }

    onSubmit() {
      this.loading$.next(true);
      let preAuthorisationUnderAssessReason: PreAuthorisationUnderAssessReason = {
        preAuthorisationUnderAssessReasonId: 0,
        preAuthId: this.preauthDataSelected.preAuthId,
        underAssessReasonId: this.deletedReason.preAuthRejectReasonId,
        underAssessReason: this.deletedReason.name,
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
      this.mediCarePreAuthService.deletePreauthorisation(this.preauthDataSelected.preAuthId).subscribe(resp =>{
        this.mediCarePreAuthService.addPreAuthorisationUnderAssessReason(preAuthorisationUnderAssessReason).subscribe(reason => {
            this.loading$.next(false);
            this.dialogRef.close(true);
            this.alertService.success(this.preauthHeader+`:Preauthorisation deleted successfully`);  
        });
      });
    }
}
