import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { BehaviorSubject } from 'rxjs';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { PoolWorkFlow } from 'projects/shared-models-lib/src/lib/common/pool-work-flow';
import { PoolWorkFlowItemTypeEnum } from '../../../enums/pool-work-flow-item-type.enum';
import { ClaimPool } from '../../../entities/funeral/ClaimPool';

@Component({
  templateUrl: './allocate-pool-item-dialog.component.html',
  styleUrls: ['./allocate-pool-item-dialog.component.css']
})
export class AllocatePoolItemDialogComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: UntypedFormGroup;
  workPool: WorkPoolEnum;
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedItems: ClaimPool[] = [];
  userSelectedId = 0;
  loggedInUerId = 0;
  userInput = new UntypedFormControl();

  counter: number;
  multiplier: number;

  @ViewChild('selectUser', { static: true }) selectUser: ElementRef<HTMLInputElement>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly poolService: PoolWorkFlowService,
    public dialogRef: MatDialogRef<AllocatePoolItemDialogComponent>,
    private readonly claimService: ClaimCareService,
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

    this.userInput.valueChanges.subscribe((searchData: string) => {
      this.filterUsers(searchData);
    });
  }

  userSelected(user: User) {
    this.userSelectedId = user.id;
    this.selectUser.nativeElement.value = user.displayName;
  }

  allocateUser() {
    this.isLoading$.next(true);

    this.counter = 0;
    this.multiplier = 1;

    this.selectedItems.forEach(item => {
      const workPoolItem = new PoolWorkFlow();
      workPoolItem.itemId = item.personEventId;
      workPoolItem.workPool = this.workPool;
      workPoolItem.assignedByUserId = this.loggedInUerId;
      workPoolItem.assignedToUserId = this.userSelectedId;
      workPoolItem.effectiveFrom = new Date();
      workPoolItem.poolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent;
      workPoolItem.instruction = item.instruction;

      if (this.workPool == WorkPoolEnum.ScaPool || this.workPool == WorkPoolEnum.CmcPool) {
        this.multiplier = 2;
        this.getPersonEvent(item.personEventId, this.userSelectedId);
      }

      this.poolService.handlePoolWorkFlow(workPoolItem).subscribe(_ => {
        this.counter++;
        if (this.counter >= this.selectedItems.length * this.multiplier) {
          this.dialogRef.close(true);
        }
      });
    });
  }

  getPersonEvent(personEventId: number, assignedToUserId: number) {
    this.claimService.getPersonEvent(personEventId).subscribe(result => {
      if (result) {
        const personEvent = result;
        personEvent.assignedToUserId = assignedToUserId;
        personEvent.assignedDate = new Date();

        this.claimService.updatePersonEvent(personEvent).subscribe(_ => {
          this.counter++;
          if (this.counter >= this.selectedItems.length * this.multiplier) {
            this.dialogRef.close(true);
          }
        });
      }
    });
  }

  cancel() {
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
