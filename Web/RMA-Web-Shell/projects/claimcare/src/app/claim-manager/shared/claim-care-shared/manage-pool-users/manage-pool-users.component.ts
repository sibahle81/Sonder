import { Component, Inject } from '@angular/core';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { UntypedFormGroup, FormBuilder, UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AllocatePoolItemDialogComponent } from '../allocate-pool-item/allocate-pool-item-dialog/allocate-pool-item-dialog.component';
import { DatePipe } from '@angular/common';
import { ManageUser } from '../../entities/funeral/work-pool.model';
import { FloatMessage } from '../message-float/message-float-model/float-message';
import { ErrorTypeEnum } from '../message-float/message-float-model/error-type-enum';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage-pool-users',
  templateUrl: './manage-pool-users.component.html',
  styleUrls: ['./manage-pool-users.component.css']
})
export class ManagePoolUsersComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  users: User[] = [];
  selectedItems = [];
  selectedUser: User;
  form: UntypedFormGroup;
  userSelectedId = 0;
  date1: any;
  date2: any;
  minDate: Date;
  showClaims = false;
  floatMessage: FloatMessage;

  constructor(
    public formBuilder: FormBuilder,
    public claimCareService: ClaimCareService,
    private readonly datePipe: DatePipe,
    public dialogRef: MatDialogRef<AllocatePoolItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
  ) {
    this.selectedItems = this.data.selectedItems;
    this.users = this.data.users;
    this.createForm();
  }

  view() {
    this.dialogRef.close();
  }

  userSelected($event: any) {
    this.userSelectedId = $event.value;
    this.selectedUser = new User();
    this.selectedUser.id = $event.value;
    this.isLoading$.next(false);
  }

  createForm(): void {
    this.minDate = new Date();
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      filterUser: new UntypedFormControl(''),
      dtPicker1: new UntypedFormControl(''),
      dtPicker2: new UntypedFormControl(''),
    });
  }

  addManageUser(): void {
    if (new Date(this.date1) > new Date(this.date2)) {
      this.setMessage('Start Time Off cannot be after End Time Off', ErrorTypeEnum.danger);
      return;
    }
  }

  setMessage(message: string, errorType: ErrorTypeEnum) {
    this.floatMessage = new FloatMessage();
    this.floatMessage.message = message;
    this.floatMessage.errorType = errorType;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  Date1Change(event: any) {
    this.date1 = this.datePipe.transform(`${event.value}`, 'yyyy-MM-dd');
  }

  Date2Change(event: any) {
    this.date2 = this.datePipe.transform(`${event.value}`, 'yyyy-MM-dd');
  }

  addUsers(claimCount: number) {
    if (claimCount === 0) {
      const addManageUser = new ManageUser();
      addManageUser.rolePlayerId = this.userSelectedId;
      addManageUser.startTimeOff = this.date1;
      addManageUser.endTimeOff = this.date2;

      this.claimCareService.addManageUser(addManageUser).subscribe(result => {
        this.isLoading$.next(false);
        this.dialogRef.close();
      });
    } else {
      this.isLoading$.next(false);
    }
  }
}
