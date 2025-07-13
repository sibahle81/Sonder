import { NgModel } from '@angular/forms';

export default class DateUtility {

  static getDate(inputDate: any): Date {
    if (inputDate === '')
      inputDate = undefined;
    return inputDate ? new Date(inputDate) : DateUtility.minDate();
  }

  static minDate(): Date {
    return new Date(0, 0, 1);
  }
}
