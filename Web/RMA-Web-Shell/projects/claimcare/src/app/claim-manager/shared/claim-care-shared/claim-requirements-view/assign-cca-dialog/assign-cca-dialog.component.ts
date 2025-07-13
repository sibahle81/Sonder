import { Component, ElementRef, Inject, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Component({
  selector: 'app-assign-cca-dialog',
  templateUrl: './assign-cca-dialog.component.html',
  styleUrls: ['./assign-cca-dialog.component.css']
})
export class AssignCcaDialogComponent implements OnInit {

  isReadOnly = true;
  form: UntypedFormGroup;
  filteredUsers: User[];
  users: User[];
  user: User;
  selectCCAUser: User;
  loggedInUerId = 0;

  @ViewChild('selectUser', { static: true }) selectUser: ElementRef<HTMLInputElement>;
  
  constructor(
    public dialogRef: MatDialogRef<AssignCcaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder,
    public userService: UserService,
  ) {
    
  }

  ngOnInit() {
    this.createForm();
    this.user = this.data.user;
    this.getUsersForPool();
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }
  
  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      selectUser: [{ value: '', disabled: false }]
    });
  }

  submit() {
    if(!this.selectCCAUser)
    {
      this.selectCCAUser = new User();
    }
    this.dialogRef.close(this.selectCCAUser);
  }

  userSelected(user: User) {
    this.selectCCAUser = user;
    this.selectUser.nativeElement.value = user.displayName;
  }
  
  getUsersForPool() {
    var workpool = WorkPoolEnum[WorkPoolEnum.CcaPool];
    let permission = this.formatText(workpool);
    this.userService.getUsersByPermission(permission).subscribe(result => {
      if (result) {
        this.users = result.filter(a => a.roleId != 1 || a.id != this.user.id);
        this.filteredUsers = result.filter(a => a.roleId != 1 || a.id != this.user.id);
      }
    });
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

    // Function to filter users based on the input
    filterUsers(searchData: string): void {
      this.filteredUsers = this.users.filter((user: User) =>
        user.displayName.toLowerCase().includes(searchData.toLowerCase())
      );
    
  
      this.filteredUsers = this.users.filter((user: User) =>
        user.displayName.toLowerCase().includes(searchData.toLowerCase())
      );
    }

  cancel() {
    this.dialogRef.close(null);
  }
}