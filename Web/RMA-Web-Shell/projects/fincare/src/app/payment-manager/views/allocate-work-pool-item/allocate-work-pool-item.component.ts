import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { PaymentsWorkPoolComponent } from '../payment-work-pool/payments-work-pool/payments-work-pool.component';
import { AllocateWorkPoolItemDialogComponent } from './allocate-work-pool-item-dialog/allocate-work-pool-item-dialog.component';
//import { CommissionsWorkPoolComponent } from '../commission-work-pool/commissions-work-pool/commissions-work-pool.component';

@Component({
  selector: 'allocate-work-pool-item',
  templateUrl: './allocate-work-pool-item.component.html',
  styleUrls: ['./allocate-work-pool-item.component.css']
})
export class AllocateWorkPoolItemComponent extends UnSubscribe implements OnChanges {

  @Input() loggedInUerId: number;
  @Input() selectedPaymentsToAllocate = [];
  @Input() filteredUsersDropdown: User[];
  //@Input() workPool = WorkPoolEnum.PaymentPool;
  @Input() workPool = WorkPoolEnum;

  @Output() refresh: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private readonly dialog: MatDialog,
    private readonly parentPaymentPool: PaymentsWorkPoolComponent,
   // private readonly commissionPaymentPool: CommissionsWorkPoolComponent
  ) { super(); }

  ngOnChanges(changes: SimpleChanges): void {
    this.populateMessage();
  }

  populateMessage(): void {
    const dialogRef = this.dialog.open(AllocateWorkPoolItemDialogComponent, {
      width: '450px',
      maxHeight: '600px',
      data: {
        selectedItems: this.selectedPaymentsToAllocate,
        users: this.filteredUsersDropdown,
        workPool: this.workPool,
        loggedInUerId: this.loggedInUerId
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // if(+this.workPool == +WorkPoolEnum.PaymentPool){
          this.parentPaymentPool.refresh();
        // }
        // if(+this.workPool == +WorkPoolEnum.CommissionPool){
        //   this.commissionPaymentPool.refresh();
        // }
      }
    });
  }
}

