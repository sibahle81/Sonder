import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PoolWorkFlowItemTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/pool-work-flow-item-type.enum';
import { PoolWorkFlow } from 'projects/shared-models-lib/src/lib/common/pool-work-flow';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-allocate-commissions-pool-item-dialog',
  templateUrl: './allocate-commissions-pool-item-dialog.component.html',
  styleUrls: ['./allocate-commissions-pool-item-dialog.component.css']
})
export class AllocateCommissionsPoolItemDialogComponent {
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
    public poolService: PoolWorkFlowService,
    public dialogRef: MatDialogRef<AllocateCommissionsPoolItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.selectedItems = this.data.selectedItems;
    this.users = this.data.users;
    this.workPool = this.data.workPool;
    this.loggedInUerId = this.data.loggedInUerId;
    this.filteredUsers = this.users;
    this.createForm();
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

  allocateUserToPayment(): void {
    this.selectedItems.forEach(item => {
      let index = this.selectedItems.indexOf(item);
      if (index > -1) {

        let workPoolItem = new PoolWorkFlow();
        workPoolItem.itemId = item.headerId;
        workPoolItem.workPool = this.workPool;
        workPoolItem.assignedByUserId = this.loggedInUerId;
        workPoolItem.assignedToUserId = this.userSelectedId;
        workPoolItem.effectiveFrom = new Date();
        workPoolItem.poolWorkFlowItemType = PoolWorkFlowItemTypeEnum.Commission;

        if (this.userSelectedId) {
          this.isLoading$.next(true);
          this.poolService.handlePoolWorkFlow(workPoolItem).subscribe(result => {
            this.isLoading$.next(false);
            this.dialogRef.close(true);
          });
        }
      }
    })
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

