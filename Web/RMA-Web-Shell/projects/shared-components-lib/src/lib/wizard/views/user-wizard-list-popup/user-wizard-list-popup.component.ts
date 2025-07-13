import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, } from '@angular/forms';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { WizardService } from '../../shared/services/wizard.service';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';

@Component({
  selector: 'app-user-wizard-list-popup',
  templateUrl: './user-wizard-list-popup.component.html',
  styleUrls: ['./user-wizard-list-popup.component.css']
})

export class UserWizardListPopup implements AfterViewInit {
  form: UntypedFormGroup;
  checkedCasesToReassign: any[];
  loggedInUserId: number;
  currentUserObject: User;
  usersToReAssign: User[];
  usersToReAssignFilter: User[];
  userInput = new UntypedFormControl();
  updateSuccess: boolean;
  wizardIdToReassign: number;
  elementKeyUp: Subscription;
  searchUser: string;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly userService: UserService,
    public wizardService: WizardService,
    public dialogRef: MatDialogRef<UserWizardListPopup>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserId = this.currentUserObject.id;
    this.createForm();
    this.checkedCasesToReassign = this.data;
    this.getUsersToReAllocate('');
    this.userInput.reset();
    this.updateSuccess = false;
  }

  ngAfterViewInit(): void {
    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          //this.getUsersToReAllocate(this.filter1.nativeElement.value);
          this.getUsersToReAllocate(this.userInput.value);
        })
      )
      .subscribe();

  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filterUser: new UntypedFormControl('')
    });


  }

  getUsersToReAllocate(find: string) {
    this.usersToReAssign = new Array();

    this.userService.getUsersByRoleIds([RoleEnum.PolicyAdministrator.toString(), RoleEnum.DataCapturer.toString()]).subscribe(
      data => {
        let user = new User;
        user.id = 0;
        user.displayName = '[UNLOCK CASE]';
        this.usersToReAssign = data;
        this.usersToReAssign.splice(0, 0, user);
        if (find === '')
          this.usersToReAssignFilter = this.usersToReAssign;
        else
          this.usersToReAssignFilter = this.usersToReAssign.filter(b => b.displayName.toLocaleLowerCase().includes(find.toLocaleLowerCase()));
      }
    );
  }

  selection(userSelection: any) {
    this.userInput.patchValue(userSelection);
    this.usersToReAssignFilter = this.usersToReAssign.filter(b => b.displayName.includes(userSelection));
  }

  reassignUserToCase(buttonClicked: any): void {

    if (!String.isNullOrEmpty(this.userInput.value)) {

      const userId = this.usersToReAssign.filter(b => b.displayName === this.userInput.value);
      if (userId.length === 0) {
        this.alertService.error(`Select a valid user`, 'Assigned User', true);
        return;
      }

      this.checkedCasesToReassign.forEach(cases => {
        this.wizardService.updateWizardLockedToUser(cases, userId[0].id)
          .subscribe(submitResult => {
            this.updateSuccess = submitResult;
            if (this.updateSuccess) {
              if (userId[0].id === 0)
                this.alertService.success('Case Unlocked', 'Case Unlock', true);
              else
                this.alertService.success('Case reassigned', 'Case Reassign', true);
            }
            else
              this.alertService.error('Cannot reassign', 'Case Reassign', true);
          });
      });

    }

    this.dialogRef.close(buttonClicked);

  }



  getData(selectedFilterTypeId): void {
  }

  onNoClick(value: any): void {
    this.dialogRef.close(value);
  }
}
