import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { SharedFloatMessage } from '../shared-float-message';
import { MatDialog } from '@angular/material/dialog';
import { SharedMessageFloatDialogComponent } from '../shared-message-float-dialog/shared-message-float-dialog.component';

@Component({
  selector: 'message-float-shared',
  templateUrl: './message-float-shared.component.html',
  styleUrls: ['./message-float-shared.component.css']
})
export class MessageFloatSharedComponent extends UnSubscribe implements OnChanges {

  @Input() floatMessage: SharedFloatMessage;
  @Output() refresh: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private readonly dialog: MatDialog
  ) { super(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.floatMessage && this.floatMessage.message) {
      this.populateMessage();
    }
  }

  populateMessage(): void {
    const dialogRef = this.dialog.open(SharedMessageFloatDialogComponent, {
      width: '700px',
      maxHeight: '100px',
      data: {
        message: this.floatMessage.message,
        errorType: this.floatMessage.errorType
      }
    });

    dialogRef.afterClosed().subscribe(result => {
        this.refresh.emit(result);
    })
  }
}
