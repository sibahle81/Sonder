import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { MatDialog } from '@angular/material/dialog';
import { MessageFloatDialogComponent } from './message-float-dialog/message-float-dialog.component';
import { FloatMessage } from './message-float-model/float-message';


@Component({
  selector: 'message-float',
  templateUrl: './message-float.component.html',
  styleUrls: ['./message-float.component.css']
})
export class MessageFloatComponent extends UnSubscribe implements OnChanges {

  @Input() floatMessage: FloatMessage;
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
    const dialogRef = this.dialog.open(MessageFloatDialogComponent, {
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
