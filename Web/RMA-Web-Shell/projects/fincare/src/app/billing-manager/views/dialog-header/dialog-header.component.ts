import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog-header',
  templateUrl: './dialog-header.component.html'
})
export class DialogHeaderComponent {
@Input() showSubmit = true;
@Output() closeHandler = new EventEmitter<any>();
@Output() submitHandler = new EventEmitter<any>();
@Input() titleIcon = 'category';
@Input() submitIcon = 'check_circle';
@Input() title = '';

submit($event:any){
  this.submitHandler.emit($event)
}

close($event:any){
  this.closeHandler.emit($event)
}
}


