import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';

@Component({
  selector: 'lib-wizard-roles-assignment-dialog',
  templateUrl: './wizard-roles-assignment-dialog.component.html',
  styleUrls: ['./wizard-roles-assignment-dialog.component.css']
})
export class WizardRolesAssignmentDialogComponent  implements OnInit {

  title = 'Roles';
  selectedRoleId: number;
  roles: Role[];
  form: UntypedFormGroup;

  constructor(    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<WizardRolesAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.roles = this.data?.roles;
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      role: []
    });
  }

  confirm() {
    this.dialogRef.close(this.selectedRoleId);
  }

  cancel() {
    this.dialogRef.close(null);
  }

  roleChanged($event: any) {
    this.selectedRoleId = $event.value;
  }
}
