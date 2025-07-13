import { Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InvoiceSwitchBatchDeleteReasonComponent } from 'projects/medicare/src/app/medical-invoice-manager/modals/invoice-switch-batch-delete-reason/invoice-switch-batch-delete-reason.component';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { MedicareTravelauthService } from '../../services/medicare-travelauth.service';
import { TravelAuthorisation } from '../../models/travel-authorisation';
import { AuthorisedPartyEnum } from '../../models/authorised-party-enum';
import { MedicalWorkPoolModel } from 'projects/medicare/src/app/medi-manager/models/medical-work-pool.model';

@Component({
  selector: 'app-travelauth-delete-modal',
  templateUrl: './travelauth-delete-modal.component.html',
  styleUrls: ['./travelauth-delete-modal.component.css']
})

export class TravelauthDeleteModalComponent {

  loading$ = new BehaviorSubject<boolean>(true);
  switchBatchInvoiceToDelete;
  form: UntypedFormGroup;
  deleteReasons = [];
  travelauthDataSelected: TravelAuthorisation;
  actionData:string;
  travelauthHeader = "";
  labelNote:string =  "";
  showDropdownRejectPend: boolean = true;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    public dialogRef: MatDialogRef<InvoiceSwitchBatchDeleteReasonComponent>,
    private router: Router,
    private readonly alertService: AlertService,
    private readonly medicareTravelAuthService: MedicareTravelauthService,
    readonly confirmservice: ConfirmationDialogsService,
    @Inject(MAT_DIALOG_DATA) public travelauthData: any) {
      console.log(this.travelauthData);
      this.travelauthDataSelected = travelauthData.travelauthDataClicked;
      this.travelauthHeader = travelauthData.header;
    }

    ngOnInit() {
      this.loading$.next(true)
      this.createForm();
      this.loading$.next(false);
    }
  
    createForm() {
      this.form = this.formBuilder.group({
        description: new UntypedFormControl('', [Validators.minLength(10)]),
      });
    }

    onResetForm() {
      this.form.reset();
    }

    getAuthorisedParty(id: number): string {
        return this.formatText(AuthorisedPartyEnum[id]);
    }

    formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'No data';
    }

    formatLookup(lookup: string) {
      return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    onSubmit() {
      this.loading$.next(true);      
      this.medicareTravelAuthService.deleteTravelAuthorisation(this.travelauthDataSelected.travelAuthorisationId).subscribe(resp =>{
        this.medicareTravelAuthService.addTravelAuthorisationRejectionComment(this.travelauthDataSelected.travelAuthorisationId,this.form.value.description).subscribe(reason => {
            this.loading$.next(false);
            this.dialogRef.close(true);
            this.alertService.success(this.travelauthHeader+`:Travel authorisation deleted successfully`);  
        });
      });
    }
  }
