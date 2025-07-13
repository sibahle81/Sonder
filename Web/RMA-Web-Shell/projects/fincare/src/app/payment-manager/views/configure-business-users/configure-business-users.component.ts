import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-configure-business-users',
  templateUrl: './configure-business-users.component.html',
  styleUrls: ['./configure-business-users.component.css']
})
export class ConfigureBusinessUsersComponent {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
    form: UntypedFormGroup;
    workPool: WorkPoolEnum;
    users: User[] = [];
    filteredUsers: User[] = [];
    selectedItems = [];
    userSelectedId = 0;
    loggedInUerId = 0;
    userInput = new UntypedFormControl();
    @ViewChild('selectUser', { static: true }) selectUser: ElementRef<HTMLInputElement>;
  
    constructor(
      public formBuilder: FormBuilder,
      public userService: UserService,
      public dialogRef: MatDialogRef<ConfigureBusinessUsersComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
      this.createForm();
      this.getUsers();
    }
  
    createForm(): void {
      if (this.form) { return; }
      this.form = this.formBuilder.group({
        filter: new UntypedFormControl(''),
        filterUser: new UntypedFormControl('')
      });
  
      // Subscribe to userInput changes and filter users based on the input
      this.userInput.valueChanges.subscribe((searchData: string) => {
        this.filterUsers(searchData);
      });
    }
  
    view() {
      this.dialogRef.close();
    }
  
    userSelected(user: User) {
      this.userSelectedId = user.id;
      this.selectUser.nativeElement.value = user.displayName;
    }

    getUsers(){
      let permission = this.getWorkPoolType(WorkPoolEnum.PaymentPool);
      this.userService.getUsersByPermission(permission).subscribe(result => {
      if (result) {
        this.users = result;
        this.filteredUsers = this.users;
        this.form.controls.filterUser.enable();
      }
    });
    }

    getWorkPoolType(type: any) {
      return this.formatText(type);
    }
  
    setFinanceUserEmail(): void {
    }
  
    cancel(): void {
      this.dialogRef.close(null);
    }
  
    formatText(text: string): string {
      return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
    }
  
    
    filterUsers(searchData: string): void {
      this.filteredUsers = this.users.filter((user: User) =>
        user.displayName.toLowerCase().includes(searchData.toLowerCase())
      );
    
  
      this.filteredUsers = this.users.filter((user: User) =>
        user.displayName.toLowerCase().includes(searchData.toLowerCase())
      );
    }
  }
  
  