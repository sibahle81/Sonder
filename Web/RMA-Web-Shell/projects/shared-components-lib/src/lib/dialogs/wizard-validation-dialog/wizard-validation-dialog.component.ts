import { Component,  Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { RoleService } from 'projects/shared-services-lib/src/lib/services/security/role/role.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
@Component({
  selector: 'app-wizard-validation-dialog',
  templateUrl: './wizard-validation-dialog.component.html',
  styleUrls: ['./wizard-validation-dialog.component.css']
})

export class WizardValidationDialog {

  loading$ = new BehaviorSubject<boolean>(true);
  title = 'Wizard: assign role to wizard';
  permissionName = 'Review Prosthetic PreAuthorisation Continue Wizard';
  wizardId : 0;
  form: UntypedFormGroup;
  roles: any;

  constructor(
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private router: Router,
    private readonly roleService: RoleService,
    public dialogRef: MatDialogRef<WizardValidationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.permissionName = data.permissionName;
      this.title = data.title;
      this.wizardId = data.wizardId;
  }

   ngOnInit() {
      this.loading$.next(true)
      this.createForm();
      this.loadLookUps();      
    }

    createForm() {
      this.form = this.formBuilder.group({
        role: ['', [Validators.required]],
      });
    }

    loadLookUps() {
    this.roleService.getRolesByPermission(this.permissionName).subscribe(data => {
      this.roles = data;
      this.loading$.next(false);
    });
  }

   cancel() {
    this.dialogRef.close(null);
  }

   onSubmit() {
      this.loading$.next(true);  
      const formDetails = this.form.getRawValue();

      this.mediCarePreAuthService.createProstheticReviewWizard(this.wizardId,formDetails.role).subscribe(resp =>{
            if(resp){
              this.alertService.success(`Review submitted successfully`); 
            }           
            this.dialogRef.close(true);
            this.loading$.next(false);
      });
      
    }
}
