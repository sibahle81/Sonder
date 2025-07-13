import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { MonthEnum } from 'projects/shared-models-lib/src/lib/enums/month.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { IndustryClassDeclarationConfiguration } from '../../../models/industry-class-declaration-configuration';
import { MaximumAverageEarningsDialogComponent } from './maximum-average-earnings-dialog/maximum-average-earnings-dialog.component';
import { LiveInAllowanceDialogComponent } from './live-in-allowance-dialog/live-in-allowance-dialog.component';
import { PenaltyConfigurationDialogComponent } from './penalty-configuration-dialog/penalty-configuration-dialog.component';
import { InflationPercentageConfigurationDialogComponent } from './inflation-percentage-configuration-dialog/inflation-percentage-configuration-dialog.component';
import { MinimumPremiumConfigurationDialogComponent } from './minimum-premium-configuration-dialog/minimum-premium-configuration-dialog.component';

@Component({
  selector: 'industry-class-declaration-configuration',
  templateUrl: './industry-class-declaration-configuration.component.html',
  styleUrls: ['./industry-class-declaration-configuration.component.css']
})
export class IndustryClassDeclarationConfigurationComponent implements OnChanges {

  @Input() industryClassDeclarationConfigurations: IndustryClassDeclarationConfiguration[];
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  @Output() isValidEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  requiredPermission = 'Edit Industry Class Declaration Configuration';
  hasPermission = false;

  hasWizardInProgress: boolean;

  form: UntypedFormGroup;
  hideForm = true;

  industryClasses: IndustryClassEnum[] = [];
  filteredIndustryClasses: IndustryClassEnum[] = [];
  monthsOfYear: MonthEnum[] = [];

  renewalPeriodStartNumberOfDays: number[];
  onlineSubmissionStartNumberOfDays: number[];

  selectedIndustryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly wizardService: WizardService,
    private readonly router: Router,
    private readonly alertService: ToastrManager,
    public dialog: MatDialog,
    private datepipe: DatePipe
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.industryClassDeclarationConfigurations) { return; }
    this.getLookups();
    this.checkPermissions(this.requiredPermission);
  }

  getLookups() {
    this.monthsOfYear = this.ToArray(MonthEnum);
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.filteredIndustryClasses = this.industryClasses;

    if (this.industryClassDeclarationConfigurations && this.industryClassDeclarationConfigurations.length > 0) {
      this.filterIndustryClasses(this.industryClassDeclarationConfigurations);
    }
    this.createForm();
    this.isLoading$.next(false);
  }

  checkPermissions(permission: string) {
    this.hasPermission = userUtility.hasPermission(permission);
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      industryClass: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      renewalPeriodStartMonth: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
      renewalPeriodStartDayOfMonth: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
      varianceThreshold: [{ value: null, disabled: this.isReadOnly }, [(control: AbstractControl) => Validators.max(100)(control), Validators.required]],
      onlineSubmissionStartMonth: [{ value: null, disabled: this.isReadOnly }],
      onlineSubmissionStartDayOfMonth: [{ value: null, disabled: this.isReadOnly }]
    });
  }


  showForm() {
    this.toggleForm();
    this.checkValidity(false);
  }

  add() {
    const industryClassDeclarationConfiguration = this.selectedIndustryClassDeclarationConfiguration ? this.selectedIndustryClassDeclarationConfiguration : new IndustryClassDeclarationConfiguration();

    industryClassDeclarationConfiguration.industryClass = +(IndustryClassEnum[this.form.controls.industryClass.value]);
    industryClassDeclarationConfiguration.renewalPeriodStartMonth = +(MonthEnum[this.form.controls.renewalPeriodStartMonth.value]);
    industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth = this.form.controls.renewalPeriodStartDayOfMonth.value;
    industryClassDeclarationConfiguration.varianceThreshold = this.form.controls.varianceThreshold.value;
    industryClassDeclarationConfiguration.onlineSubmissionStartMonth = +(MonthEnum[this.form.controls.onlineSubmissionStartMonth.value]);
    industryClassDeclarationConfiguration.onlineSubmissionStartDayOfMonth = this.form.controls.onlineSubmissionStartDayOfMonth.value;

    const index = this.industryClassDeclarationConfigurations.findIndex(s => s === this.selectedIndustryClassDeclarationConfiguration);
    if (index > -1) {
      this.industryClassDeclarationConfigurations[index] = industryClassDeclarationConfiguration;
    } else {
      this.industryClassDeclarationConfigurations.push(industryClassDeclarationConfiguration);
    }

    this.reset(true);
  }

  delete(industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration) {
    this.hideForm = true;
    const index = this.industryClassDeclarationConfigurations.findIndex(s => s === industryClassDeclarationConfiguration);
    this.industryClassDeclarationConfigurations.splice(index, 1);
    this.reset(false);
  }

  edit(industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration) {
    this.selectedIndustryClassDeclarationConfiguration = industryClassDeclarationConfiguration;
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.filteredIndustryClasses = this.industryClasses;

    this.disableFormControl('industryClass');
    this.getRenewalPeriodStartNumberOfDays(industryClassDeclarationConfiguration.renewalPeriodStartMonth);

    if (industryClassDeclarationConfiguration.onlineSubmissionStartMonth) {
      this.getOnlineSubmissionStartNumberOfDays(industryClassDeclarationConfiguration.onlineSubmissionStartMonth);
    }

    this.form.patchValue({
      industryClass: IndustryClassEnum[industryClassDeclarationConfiguration.industryClass],
      renewalPeriodStartMonth: MonthEnum[industryClassDeclarationConfiguration.renewalPeriodStartMonth],
      renewalPeriodStartDayOfMonth: industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth,
      varianceThreshold: industryClassDeclarationConfiguration.varianceThreshold,
      onlineSubmissionStartMonth: MonthEnum[industryClassDeclarationConfiguration.onlineSubmissionStartMonth],
      onlineSubmissionStartDayOfMonth: industryClassDeclarationConfiguration.onlineSubmissionStartDayOfMonth,
    });

    this.toggleForm();
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  cancel() {
    this.enableFormControl('industryClass');
    this.reset(true);
  }

  reset(toggleForm: boolean) {
    if (toggleForm) {
      this.toggleForm();
    }

    this.form.reset();

    this.renewalPeriodStartNumberOfDays = [];
    this.onlineSubmissionStartNumberOfDays = [];

    this.filterIndustryClasses(this.industryClassDeclarationConfigurations);

    this.selectedIndustryClassDeclarationConfiguration = null;

    this.checkValidity(true);
    this.industryClassDeclarationConfigurations.sort(s => s.industryClass);
  }

  filterIndustryClasses(industryClassDeclarationConfigurations: IndustryClassDeclarationConfiguration[]) {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.filteredIndustryClasses = this.industryClasses;

    industryClassDeclarationConfigurations.forEach(industryClassDeclarationConfiguration => {
      const index = this.filteredIndustryClasses.findIndex(s => s.toString() === this.getIndustryClassString(industryClassDeclarationConfiguration.industryClass));
      if (index > -1) {
        this.filteredIndustryClasses.splice(index, 1);
      }
    });
  }

  toggleForm() {
    this.hideForm = !this.hideForm;
  }

  getIndustryClass(id: number): string {
    return IndustryClassEnum[id];
  }

  getMonth(id: number): string {
    return MonthEnum[id];
  }

  getIndustryClassString(industryClass: IndustryClassEnum): string {
    return IndustryClassEnum[industryClass];
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  startWizard() {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'industry-class-declaration-configuration';
    startWizardRequest.data = JSON.stringify(this.industryClassDeclarationConfigurations);
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.successToastr('Industry class declaration configuration wizard started successfully');
      this.back();
    });
  }

  back() {
    this.isLoading$.next(true);
    this.router.navigateByUrl('clientcare/member-manager');
  }

  getRenewalPeriodStartNumberOfDays($month: any) {
    this.renewalPeriodStartNumberOfDays = [];

    const days = this.getDaysOfMonth($month);

    for (let day = 1; day <= days; day++) {
      this.renewalPeriodStartNumberOfDays.push(day);
    }
  }

  getOnlineSubmissionStartNumberOfDays($month: any) {
    this.onlineSubmissionStartNumberOfDays = [];

    const days = this.getDaysOfMonth($month);

    for (let day = 1; day <= days; day++) {
      this.onlineSubmissionStartNumberOfDays.push(day);
    }
  }

  getDaysOfMonth($month: any): number {
    const month = $month.value ? (+MonthEnum[$month.value]) : $month;
    const year: number = new Date().getFullYear();
    return new Date(year, month, 0).getDate();
  }

  setHasRunningWizard($event: boolean) {
    this.hasWizardInProgress = $event;
  }

  formatStatus($event: number): string {
    const status = WizardStatus[$event];
    return status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  checkValidity(isValid: boolean) {
    this.isValidEmit.emit(isValid);
  }

  getOnlineSubmissionDate($event: IndustryClassDeclarationConfiguration): string {
    if ($event.onlineSubmissionStartMonth && $event.onlineSubmissionStartDayOfMonth) {
      const today = new Date().getCorrectUCTDate();
      return this.datepipe.transform(new Date(today.getFullYear(), $event.onlineSubmissionStartMonth - 1, $event.onlineSubmissionStartDayOfMonth), 'yyyy-MM-dd');
    } else {
      return 'N/A';
    }
  }

  getDates($event: IndustryClassDeclarationConfiguration): string {
    const today = new Date().getCorrectUCTDate();
    const date1 = this.datepipe.transform(new Date(today.getFullYear(), $event.renewalPeriodStartMonth - 1, $event.renewalPeriodStartDayOfMonth), 'yyyy-MM-dd');

    let date2 = new Date(today.getFullYear() + 1, $event.renewalPeriodStartMonth - 1, $event.renewalPeriodStartDayOfMonth);
    date2.setDate(date2.getDate() - 1);
    return `${date1} to ${this.datepipe.transform(date2, 'yyyy-MM-dd')}`;
  }

  openMaximumAverageEarningsDialog(industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration) {
    const dialogRef = this.dialog.open(MaximumAverageEarningsDialogComponent, {
      width: '40%',
      data: {
        industryClassDeclarationConfig: industryClassDeclarationConfiguration,
        isWizard: this.isWizard,
        isReadOnly: this.isReadOnly
      }
    });
  }

  openLiveInAllowanceDialog(industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration) {
    const dialogRef = this.dialog.open(LiveInAllowanceDialogComponent, {
      width: '40%',
      data: {
        industryClassDeclarationConfig: industryClassDeclarationConfiguration,
        isWizard: this.isWizard,
        isReadOnly: this.isReadOnly
      }
    });
  }

  openDeclarationPenaltyPercentageDialog(industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration) {
    const dialogRef = this.dialog.open(PenaltyConfigurationDialogComponent, {
      width: '40%',
      data: {
        industryClassDeclarationConfig: industryClassDeclarationConfiguration,
        isWizard: this.isWizard,
        isReadOnly: this.isReadOnly
      }
    });
  }

  openInflationPercentageConfigurationDialog(industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration) {
    const dialogRef = this.dialog.open(InflationPercentageConfigurationDialogComponent, {
      width: '40%',
      data: {
        industryClassDeclarationConfig: industryClassDeclarationConfiguration,
        isWizard: this.isWizard,
        isReadOnly: this.isReadOnly
      }
    });
  }

  openMinimumPremiumConfigurationDialog(industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration) {
    const dialogRef = this.dialog.open(MinimumPremiumConfigurationDialogComponent, {
      width: '40%',
      data: {
        industryClassDeclarationConfig: industryClassDeclarationConfiguration,
        isWizard: this.isWizard,
        isReadOnly: this.isReadOnly
      }
    });
  }
}
