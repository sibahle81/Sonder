import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';

@Component({
  templateUrl: './role-search-dialog.component.html'
})
export class RoleSearchDialogComponent {

  title = 'Roles';
  role: Role;

  constructor(
    public dialogRef: MatDialogRef<RoleSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.title = this.data?.title ? this.data.title : this.title;
  }

  roleSelected($event: Role) {
    this.role = $event;
    this.confirm();
  }

  confirm() {
    this.dialogRef.close(this.role);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
