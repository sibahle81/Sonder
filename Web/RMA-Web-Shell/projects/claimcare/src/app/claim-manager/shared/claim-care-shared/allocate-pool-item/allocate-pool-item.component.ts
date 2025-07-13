import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { AllocatePoolItemDialogComponent } from './allocate-pool-item-dialog/allocate-pool-item-dialog.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';

@Component({
  selector: 'allocate-pool-item',
  templateUrl: './allocate-pool-item.component.html',
  styleUrls: ['./allocate-pool-item.component.css']
})
export class AllocatePoolItemComponent extends UnSubscribe implements OnChanges {

  @Input() loggedInUerId: number;
  @Input() selectedClaimsToAllocate = [];
  @Input() filteredUsersDropdown: User[];
  @Input() workPool = WorkPoolEnum.CadPool;

  @Output() refreshEmit: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private readonly dialog: MatDialog
  ) { super(); }

  ngOnChanges(changes: SimpleChanges): void {
    this.populateMessage();
  }

  populateMessage(): void {
    const dialogRef = this.dialog.open(AllocatePoolItemDialogComponent, {
      width: '450px',
      maxHeight: '600px',
      data: {
        selectedItems: this.selectedClaimsToAllocate,
        users: this.filteredUsersDropdown,
        workPool: this.workPool,
        loggedInUerId: this.loggedInUerId,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshEmit.emit(true);
      }
    });
  }
}
