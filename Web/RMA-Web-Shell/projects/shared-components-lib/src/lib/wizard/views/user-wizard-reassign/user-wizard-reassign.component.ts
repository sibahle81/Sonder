import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { WizardService } from './../../../../../../shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ToastrManager } from 'ng6-toastr-notifications';
import 'src/app/shared/extensions/string.extensions';
import { AssignActionEnum } from 'projects/shared-models-lib/src/lib/enums/assign-action-enum';
import { WizardPermissionTypeEnum } from '../../shared/models/wizard-permission-type-enum';

@Component({
  selector: 'lib-user-wizard-reassign',
  templateUrl: './user-wizard-reassign.component.html',
  styleUrls: ['./user-wizard-reassign.component.css']
})
export class UserWizardReassignComponent implements OnInit {
  checkedItemsToReassign: any[];
  form: UntypedFormGroup;
  usersToReAssign: User[];
  originalUserList: User[];
  selectedUser: number;
  updateSuccess: boolean;
  action: AssignActionEnum;
  showReAssign = false;
  showAssign = false;
  heading: string;

  userInput = new UntypedFormControl();
  @ViewChild('selectUser', { static: true }) selectUser: ElementRef;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly userService: UserService,
    private readonly wizardService: WizardService,
    private readonly toastr: ToastrManager,
    public dialogRef: MatDialogRef<UserWizardReassignComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.checkedItemsToReassign = this.data.items;
    this.action = this.data.action;
    if(this.action === AssignActionEnum.ReAssign){
      this.showReAssign = true;
      this.heading = "Re-Assign";
      this.getUsersToReAssign();
    }
    else if(this.action === AssignActionEnum.Assign){
      this.showAssign = true;
      this.heading = "Assign";
      this.getUsersToAssign();
    }

    this.createForm();

    const selectUserKeyUp = fromEvent(this.selectUser.nativeElement, 'keyup')
      .pipe(
        map((e: any) => e.target.value),
        debounceTime(300),
        distinctUntilChanged()
      );

    selectUserKeyUp.subscribe((searchData: string) => {
      if (String.isNullOrEmpty(searchData)) {
        this.usersToReAssign = this.originalUserList;
        return;
      }

      this.usersToReAssign = this.originalUserList.filter(user => String.contains(user.displayName, searchData));
    });

  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      filterUser: new UntypedFormControl('', [Validators.required, Validators.min(3)]),
    });
  }

  getUsersToReAssign() {
    this.userService.getUsersByPermission('Reassign Quote Task').subscribe(
      data => {
        this.usersToReAssign = data;
        this.originalUserList = data;
      }
    );
  }

  getUsersToAssign() {
    let permissionToAssign = 'Reassign Quote Task';
    this.wizardService.getWizardPermissionByWizardConfig(this.checkedItemsToReassign[0].wizardConfigurationId, WizardPermissionTypeEnum.Continue).subscribe(result => {
      if(result){
        permissionToAssign = result.permissionName;
        this.userService.getUsersByPermission(permissionToAssign).subscribe(
          data => {
            this.usersToReAssign = data;
            this.originalUserList = data;
          }
        );
      }
    })
  }

  reAssignUserToQuote(buttonClicked: any): void {
    if (!String.isNullOrEmpty(this.userInput.value)) {
      if (this.userInput.value.length < 3) {
        this.toastr.warningToastr('Please input atleast 3 characters.');
        return;
      }

      const userId = this.usersToReAssign.filter(b => b.email === this.userInput.value);
      if (userId.length === 0) {
        this.toastr.errorToastr('User not valid, please select user.');
        return;
      }

      for (const value of this.checkedItemsToReassign) {
        const wizardId = value.id;
        this.wizardService.updateWizardLockedToUser(wizardId, userId[0].id)
          .subscribe(submitResult => {
            this.updateSuccess = submitResult;
            this.dialogRef.close(+AssignActionEnum[buttonClicked]);
          });
      }
    }
  }

  onNoClick(value: any): void {
    this.dialogRef.close(value);
  }

}
