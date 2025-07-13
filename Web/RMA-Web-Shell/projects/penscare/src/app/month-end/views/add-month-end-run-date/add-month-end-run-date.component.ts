import { Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PenscareMonthEndService } from '../../../pensioncase-manager/services/penscare-month-end.service';
import { MonthEndDates } from '../../../shared-penscare/models/month-end-dates';
import { MonthEndRunStatusEnum } from '../../../shared-penscare/enums/mont-end-run-status-enum';
import { MonthEnum } from '../../../../../../shared-models-lib/src/lib/enums/month.enum';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'add-month-end-run-date-component',
  templateUrl: 'add-month-end-run-date.component.html',
  styleUrls: ['add-month-end-run-date.component.css']
})
export class AddMonthEndRunDateComponent {

  loading$ = new BehaviorSubject<boolean>(false);
  monthEndPending$ = new BehaviorSubject<boolean>(false);

  form: UntypedFormGroup;
  dates: MonthEndDates[];
  monthendDate = new Date().getCorrectUCTDate();
  month: number;
  year: number;

  minDate: Date;
  maxDate: Date;

  runMonthList: MonthEnum[];
  monthEndDateToEdit: MonthEndDates;
  isEditMode: boolean = false;
  constructor(private readonly formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<AddMonthEndRunDateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly alertService: AlertService,
    private readonly penscareMonthEndService: PenscareMonthEndService,
    private readonly datePipe: DatePipe) {

    }

  ngOnInit() {
    if (this.data?.monthEndToEdit) {
      this.isEditMode = true;
      this.loading$.next(true);
      this.monthEndDateToEdit = this.data.monthEndToEdit;
      this.minDate = new Date(this.monthEndDateToEdit.year, this.monthEndDateToEdit.month - 1, 1);
      this.maxDate = new Date(this.minDate.getFullYear(), this.minDate.getMonth() + 1, 0);
      this.createForm();
      this.setForm(this.data.monthEndToEdit);
      this.loading$.next(false);
    }
    else {
      this.minDate = new Date().getCorrectUCTDate();
      this.maxDate = new Date(this.minDate.getFullYear(), this.minDate.getMonth() + 1, 0);
      this.runMonthList = this.ToArray(MonthEnum);
      this.createForm();
      this.getNextMonthEndDate();
    }
    
   
  }

  createForm() {
    if (this.form) return;
    this.form = this.formBuilder.group({
      month: [{ value: null, disabled: true }, Validators.required ],
      year: [{ value: null, disabled: true }, Validators.required],
      authorizationCloseOfDate: [{ value: this.minDate, disabled: false }, Validators.required ],
      monthEndCloseOfDate: [{ value: this.minDate, disabled: false }, Validators.required ],
      paymentDate: [{ value: this.minDate, disabled: false }, Validators.required ],
      monthEndBalanceAndReleaseDate: [{ value: this.minDate, disabled: false }, Validators.required],
      pacsCreateDate: [{ value: this.minDate, disabled: false }, Validators.required],
      pacsStrikeDate: [{ value: this.minDate, disabled: false }, Validators.required],
    });
  }

  setForm(monthEndDate: MonthEndDates = null) {
    if (monthEndDate) {
      if (this.form) {
        this.form.patchValue({
          "authorizationCloseOfDate": monthEndDate.authorizationCloseOfDate,
          "monthEndCloseOfDate": monthEndDate.monthEndCloseOfDate,
          "paymentDate": monthEndDate.paymentDate,
          "monthEndBalanceAndReleaseDate": monthEndDate.monthEndBalanceAndReleaseDate,
          "pacsCreateDate": monthEndDate.pacsCreateDate,
          "pacsStrikeDate": monthEndDate.pacsStrikeDate,
          "month": MonthEnum[monthEndDate.month],
          "year": monthEndDate.year
        });
        this.form.updateValueAndValidity();
      }
    }
    else {
      this.form.controls.month.setValue(MonthEnum[this.month]);
      this.form.controls.year.setValue(this.year);
    }
    
  }


  setDateRange() {
    this.minDate.setFullYear(this.year, this.month - 1, 1);
    this.maxDate.setFullYear(this.minDate.getFullYear(), this.minDate.getMonth() + 1, 0);
  }

  onSave() {
    var formData = this.getForm();
    if (this.isEditMode) {
      formData.monthEndRunDateId = this.monthEndDateToEdit.monthEndRunDateId;
      this.editMonthEndDates(formData);
    }
    else {
      this.addMonthEndDate();
    }
  }

  cancel() {
    if (this.dialogRef)
      this.dialogRef.close();
  }

  save() {

  }


  editMonthEndDates(monthEndDate: MonthEndDates) {
    this.loading$.next(true);
    this.penscareMonthEndService.updateMonthEndDates(monthEndDate).subscribe(
      response => {
        if (response) {
          this.loading$.next(false);
          this.cancel();
          this.alertService.success('Monthend Run Date Updated successfully', "Update Month End Dates", false);
        }
      });
  }


  addMonthEndDate() {
    this.loading$.next(true);

    let date = new Date(this.year, this.month - 1, 1, 0, 0, 0, 0);
    let monthEndRunDate = this.getForm();
    monthEndRunDate.monthEndRunStatus = MonthEndRunStatusEnum.Awaiting;

    this.penscareMonthEndService.getMonthEndDatesList(this.year).subscribe(
      response => {
        this.dates = response;
        let isExist: boolean = this.dates.some(item => item.month === this.month);
        if (isExist) {
          this.loading$.next(false);
          this.alertService.error('Monthend Run Date Already Exists!', "Add Month End Dates", false);
          return;
        }
        else {
          this.penscareMonthEndService.addMonthEndRunDate(monthEndRunDate).subscribe(resp => {
            this.loading$.next(false);
            this.cancel();
            this.alertService.success('Monthend Run Date Added successfully', "Add Month End Dates", false);
          });
        }
      }
    )
  }

  getNextMonthEndDate() {
    this.loading$.next(true);
    this.penscareMonthEndService.getLatestMonthEndRunDate().subscribe(resp => {
      this.loading$.next(false);
      this.setNextMonthEndRunDate(resp);
    });
  }

  setNextMonthEndRunDate(latestMonthEnd: MonthEndDates) {
    if (latestMonthEnd) {
      if (latestMonthEnd.monthEndRunStatus != MonthEndRunStatusEnum.PaymentsProcessed) {
        this.monthEndPending$.next(true);
        return;
      }
      if (latestMonthEnd.month < 12) {
        this.month = latestMonthEnd.month + 1;
        this.year = latestMonthEnd.year;
      } else {
        this.month = 1;
        this.year = latestMonthEnd.year + 1;
      }
    }
    else {
      this.month = this.minDate.getMonth() + 1;
      this.year = this.minDate.getFullYear();
    }

    this.setForm();
    this.setDateRange();
  }

  formatLookup(lookup: string): string {
    if (!lookup || lookup == '') { return 'N/A'; }
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  getRunMonth(runMonth: MonthEnum) {
    return this.formatLookup(MonthEnum[runMonth]);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getForm(): MonthEndDates{
    var monthEndDate = new MonthEndDates();
    if (this.form) {
      monthEndDate.authorizationCloseOfDate = new Date(this.datePipe.transform(this.form.controls.authorizationCloseOfDate.value, 'yyyy-MM-dd')).getCorrectUCTDate(); 
      monthEndDate.monthEndCloseOfDate = new Date(this.datePipe.transform(this.form.controls.authorizationCloseOfDate.value, 'yyyy-MM-dd')).getCorrectUCTDate();
      monthEndDate.paymentDate = new Date(this.datePipe.transform(this.form.controls.paymentDate.value, 'yyyy-MM-dd')).getCorrectUCTDate();
      monthEndDate.monthEndBalanceAndReleaseDate = new Date(this.datePipe.transform(this.form.controls.monthEndBalanceAndReleaseDate.value, 'yyyy-MM-dd')).getCorrectUCTDate();
      monthEndDate.pacsCreateDate = new Date(this.datePipe.transform(this.form.controls.pacsCreateDate.value, 'yyyy-MM-dd')).getCorrectUCTDate();
      monthEndDate.pacsStrikeDate = new Date(this.datePipe.transform(this.form.controls.pacsStrikeDate.value, 'yyyy-MM-dd')).getCorrectUCTDate();
      monthEndDate.year = this.form.controls.year.value;
      monthEndDate.month = this.form.controls.month.value;
    }

    return monthEndDate;
  }
}
