import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ManageUser } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-claim-user-show-claims',
  templateUrl: './manage-claim-user-show-claims.component.html',
  styleUrls: ['./manage-claim-user.component.css']
})

export class ManageClaimUserShowClaimsComponent {
  form: UntypedFormGroup;
  manageUser: ManageUser[];
  checkedClaimsToAllocate: any[];
  loggedInUserId: number;
  currentUserObject: User;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ManageClaimUserShowClaimsComponent>,
    private readonly authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserId = this.currentUserObject.id;
    this.createForm();
    this.checkedClaimsToAllocate = this.data;
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      filterUser: new UntypedFormControl(''),
    });
  }

  proceedClick(buttonClicked: any): void {
    this.dialogRef.close(buttonClicked);
  }

  onNoClick(buttonClicked: any): void {
    this.dialogRef.close(buttonClicked);
  }
}
