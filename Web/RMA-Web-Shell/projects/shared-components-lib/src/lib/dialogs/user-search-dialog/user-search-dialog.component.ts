import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-type-enum';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Component({
  templateUrl: './user-search-dialog.component.html'
})
export class UserSearchDialogComponent {

  title = 'Users';
  user: User;

  selectedRoles: Role[];
  selectedRoleIds: number[];
  selectedPermissions: string[];
  userType: UserTypeEnum;
  advancedFiltersExpanded: boolean;
  triggerReset: boolean;
  isReadOnly: boolean;

  constructor(
    public dialogRef: MatDialogRef<UserSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = this.data?.title ? this.data.title : this.title;
    this.selectedRoles = this.data?.roles?.length ? this.data.roles : this.selectedRoles;
    this.selectedRoleIds = this.selectedRoles?.length > 0 ? this.selectedRoles.map(s => s.id) : this.selectedRoleIds;
    this.selectedPermissions = this.data?.permissions ? this.data.permissions : this.selectedPermissions;
    this.userType = this.data?.userType ? this.data.userType : this.userType;
    this.isReadOnly = this.data?.isReadOnly ? this.data.isReadOnly : this.isReadOnly;
  }

  userSelected($events: User[]) {
    if ($events?.length > 0) {
      this.user = $events[0];
      this.confirm();
    }
  }

  confirm() {
    this.dialogRef.close(this.user);
  }

  cancel() {
    this.dialogRef.close(null);
  }

  setRole($event: Role) {
    this.advancedFiltersExpanded = false;
    this.selectedRoles = $event ? [$event] : null;
    this.selectedRoleIds = this.selectedRoles?.length > 0 ? this.selectedRoles.map(s => s.id) : null;
  }

  getRoleNames(): string {
    if (this.selectedRoles?.length > 0) {
      return this.selectedRoles?.map(s => s.name)?.join(', ');
    }
  }
}
