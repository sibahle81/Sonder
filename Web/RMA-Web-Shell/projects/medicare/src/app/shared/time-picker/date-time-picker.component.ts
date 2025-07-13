import { isNullOrUndefined } from 'util';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DatepickerAnimations } from './animation';
import { MatDialogRef } from '@angular/material/dialog';



@Component({
  selector: 'date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.ccomponent.css'],
  animations: [
    DatepickerAnimations.transformPanel,
    DatepickerAnimations.fadeInCalendar
  ]
})
export class TimePickerComponent implements OnInit {
  date: Date;
  hours: number;
  minutes: number;

  constructor(private dialogRef: MatDialogRef<TimePickerComponent>) {}

  ngOnInit() {
    this.date = new Date();

    if (this.date) {
      this.hours = this.date.getHours();
      this.minutes = this.date.getMinutes();
    } else {
      this.hours = 0;
      this.minutes = 0;
    }
  }

  public modifyHours(isDecreasing = false) {
    if (isDecreasing) {
      if (this.hours <= 0) {
        this.hours = 23;
      } else {
        this.hours -= 1;
      }
    } else {
      if (this.hours >= 23) {
        this.hours = 0;
      } else {
        this.hours += 1;
      }
    }
  }

  public modifyMinutes(isDecreasing = false) {
    if (isDecreasing) {
      if (this.minutes <= 0) {
        this.minutes = 59;
      } else {
        this.minutes -= 1;
      }
    } else {
      if (this.minutes >= 59) {
        this.minutes = 0;
      } else {
        this.minutes += 1;
      }
    }
  }

  get validateHours(): boolean {
    return (this.hours < 0 || this.hours > 23) ? true: false; 
  }

  onSelect(event) {
    this.date = event;
  }

  keyUpHours(event) {
    this.hours = event.target.value;
  }

  keyUpMinutes(event) {
    this.minutes = event.target.value;
  }

  public saveDateTime() {
    const newDate = new Date(this.date);
    newDate.setHours(this.hours);
    newDate.setMinutes(this.minutes);
    newDate.setSeconds(0);
    this.dialogRef.close(`${newDate}`);
  }
}
