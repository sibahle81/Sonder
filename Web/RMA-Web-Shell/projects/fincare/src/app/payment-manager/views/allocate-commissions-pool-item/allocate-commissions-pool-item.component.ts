import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { CommissionsWorkPoolComponent } from '../commission-work-pool/commissions-work-pool/commissions-work-pool.component';
import { AllocateCommissionsPoolItemDialogComponent } from './allocate-commissions-pool-item-dialog/allocate-commissions-pool-item-dialog.component';

@Component({
  selector: 'allocate-commissions-pool-item',
  templateUrl: './allocate-commissions-pool-item.component.html',
  styleUrls: ['./allocate-commissions-pool-item.component.css']
})
export class AllocateCommissionsPoolItemComponent extends UnSubscribe implements OnChanges {

  @Input() loggedInUerId: number;
  @Input() selectedPaymentsToAllocate = [];
  @Input() filteredUsersDropdown: User[];
  //@Input() workPool = WorkPoolEnum.PaymentPool;
  @Input() workPool = WorkPoolEnum;

  @Output() refresh: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private readonly dialog: MatDialog,
    private readonly commissionsPaymentPool: CommissionsWorkPoolComponent,
  ) { super(); }

  ngOnChanges(changes: SimpleChanges): void {
    this.populateMessage();
  }

  populateMessage(): void {
    const dialogRef = this.dialog.open(AllocateCommissionsPoolItemDialogComponent, {
      width: '450px',
      maxHeight: '600px',
      data: {
        selectedItems: this.selectedPaymentsToAllocate,
        users: this.filteredUsersDropdown,
        workPool: this.workPool,
        loggedInUerId: this.loggedInUerId,
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commissionsPaymentPool.refresh();
      }
    });
  }
}


