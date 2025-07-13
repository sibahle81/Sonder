import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'add-person-events',
  templateUrl: './add-person-events.component.html',
  styleUrls: ['./add-person-events.component.css']
})
export class AddPersonEventsComponent implements OnInit {

  showHide: number;
  @Output() showHideEmit: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.showHide = 1;
  }

  addMoreEvents() {
    this.showHide++;
    this.showHideEmit.emit(this.showHide);
  }
}
