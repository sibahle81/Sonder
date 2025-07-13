import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { SharedFloatMessage } from 'projects/shared-components-lib/src/lib/shared-message-float/shared-float-message';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { BehaviorSubject } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { DatePipe } from '@angular/common';
import { AllocateWorkPoolItemDialogComponent } from '../allocate-work-pool-item/allocate-work-pool-item-dialog/allocate-work-pool-item-dialog.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SharedErrorTypeEnum } from 'projects/shared-components-lib/src/lib/shared-message-float/shared-error-type-enum';
import { ManageFinanceUser } from '../../models/manager-finance-user';

@Component({
  selector: 'app-manage-work-pool-users',
  templateUrl: './manage-work-pool-users.component.html',
  styleUrls: ['./manage-work-pool-users.component.css']
})
export class ManageWorkPoolUsersComponent {

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
  floatMessage: SharedFloatMessage;

  constructor(
    public formBuilder: FormBuilder,
    public paymentService: PaymentService,
    private readonly datePipe: DatePipe,
    public dialogRef: MatDialogRef<AllocateWorkPoolItemDialogComponent>,
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
    this.isLoading$.next(true);
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
      this.setMessage('Start Time Off cannot be after End Time Off', SharedErrorTypeEnum.danger);
      return;
    }
  }

  setMessage(message: string, errorType: SharedErrorTypeEnum) {
    this.floatMessage = new SharedFloatMessage();
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
      const addManageUser = new ManageFinanceUser();
      addManageUser.rolePlayerId = this.userSelectedId;
      addManageUser.startTimeOff = this.date1;
      addManageUser.endTimeOff = this.date2;

      this.paymentService.addManageUser(addManageUser).subscribe(result => {
        this.isLoading$.next(false);
        this.dialogRef.close();
      });

    } else {
      this.isLoading$.next(false);
    }
  }
}
