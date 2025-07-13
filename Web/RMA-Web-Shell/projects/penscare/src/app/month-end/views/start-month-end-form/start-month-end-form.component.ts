import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PenscareMonthEndService } from '../../../pensioncase-manager/services/penscare-month-end.service';
import { MonthlyPensionSetting } from '../../../shared-penscare/models/monthly-pension-setting.model';

class TimeOption {
  key: string;
  value: string;
}
@Component({
  selector: 'app-start-month-end-form',
  templateUrl: './start-month-end-form.component.html',
  styleUrls: ['./start-month-end-form.component.css']
})
export class StartMonthEndFormComponent implements OnInit {
  form: UntypedFormGroup;
  timeOptions: TimeOption[];
  loading = false;

  constructor(
    private penscareMonthEndService: PenscareMonthEndService,
    private authService: AuthService,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.getMonthlyPensionSettings();
  }

  createForm() {
    this.form = this.formBuilder.group({
      requestBy : new UntypedFormControl(this.authService.getCurrentUser().name),
      scheduleRunTime: new UntypedFormControl('', [Validators.required]),
      scheduleRunDate: new UntypedFormControl('', [Validators.required])
    })
  }

  getMonthlyPensionSettings() {
    this.loading = true;
    this.penscareMonthEndService.getMonthlyPensionSettings().subscribe(
      response => {
        this.generateTimeOption(response);
        this.createForm();
        this.loading = false;
      }
    )
  }

  startMonthEnd() {
    if(!this.form.valid) return;
    this.loading = true;
    const scheduleMonthEndRequest = this.form.value;
    this.penscareMonthEndService.scheduleMonthEnd(scheduleMonthEndRequest).subscribe(
      response => {
        if(response.success) {
          this.alertService.success("Monthly pension scheduled successfully");
        }
        this.loading = false;
      }
    )
  }

  generateTimeOption(monthlyPensionSettings: MonthlyPensionSetting) {
    const count = (monthlyPensionSettings.monthlyPensionScheduleToTime - monthlyPensionSettings.monthlyPensionScheduleFromTime) * (60 / monthlyPensionSettings.monthlyPensionScheduleMinuteSplit);
    const timeOptions: TimeOption[] = []
    let _minutestring = '';
    let _minutes = 0;
    let _hours = monthlyPensionSettings.monthlyPensionScheduleFromTime;
    let _hoursString = '' ?
      _hours < 10 :
      `0${_hours.toString()}`;
    for (let i = 0; i < count; i++) {
      if (i == 0) {
        _minutestring = '00';
        _minutes = 0;
      }
      else if ((i * monthlyPensionSettings.monthlyPensionScheduleMinuteSplit) % 60 === 0) {
        _minutestring = '00';
        _minutes = 0;
        _hours++;
      } else {
        _minutes += monthlyPensionSettings.monthlyPensionScheduleMinuteSplit;
        _minutestring = _minutes < 10 ? `0${_minutes.toString()}` : _minutes.toString();
      }

      _hoursString = _hours < 10 ? `0${_hours.toString()}` : _hours.toString();
      timeOptions.push({
        key: `${_hoursString}:${_minutestring}`,
        value: `${_hoursString}:${_minutestring}`
      })
    }
    this.timeOptions = timeOptions;
  }
}
