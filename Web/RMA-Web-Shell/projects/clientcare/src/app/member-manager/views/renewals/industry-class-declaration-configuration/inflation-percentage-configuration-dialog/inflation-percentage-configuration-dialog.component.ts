import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IndustryClassDeclarationConfigurationComponent } from '../industry-class-declaration-configuration.component';
import { BehaviorSubject } from 'rxjs';
import { IndustryClassDeclarationConfiguration } from '../../../../models/industry-class-declaration-configuration';
import { DatePipe } from '@angular/common';
import { InflationPercentage } from '../../../../models/inflation-percentage';

@Component({
  templateUrl: './inflation-percentage-configuration-dialog.component.html',
  styleUrls: ['./inflation-percentage-configuration-dialog.component.css']
})
export class InflationPercentageConfigurationDialogComponent {

  form: UntypedFormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  industryClassDeclarationConfig: IndustryClassDeclarationConfiguration;
  isWizard = false;
  isReadOnly = false;

  hideForm = true;

  selectedInflationPercentage: InflationPercentage;

  minDate: Date;

  constructor(
    public dialogRef: MatDialogRef<IndustryClassDeclarationConfigurationComponent>,
    private readonly formBuilder: UntypedFormBuilder,
    private datepipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.industryClassDeclarationConfig = data.industryClassDeclarationConfig;
    this.isWizard = data.isWizard;
    this.isReadOnly = data.isReadOnly;
    this.createForm();
  }

  createForm() {
    this.setMinDate();
    
    this.form = this.formBuilder.group({
      inflationPercentage: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
      effectiveFrom: [{ value: null, disabled: this.isReadOnly }, [Validators.required]]
    });
  }

  showForm() {
    this.toggleForm();
  }

  toggleForm() {
    this.hideForm = !this.hideForm;
  }

  add() {
    const inflationPercentage = this.selectedInflationPercentage ? this.selectedInflationPercentage : new InflationPercentage();

    inflationPercentage.percentage = +this.form.controls.inflationPercentage.value;

    if (this.selectedInflationPercentage) {
      const index = this.industryClassDeclarationConfig.inflationPercentages.findIndex(s => s === this.selectedInflationPercentage);
      if (index > -1) {
        this.industryClassDeclarationConfig.inflationPercentages[index] = inflationPercentage;
      }
    } else {
      if (!this.industryClassDeclarationConfig.inflationPercentages) {
        this.industryClassDeclarationConfig.inflationPercentages = [];
      }

      inflationPercentage.effectiveFrom = new Date(this.datepipe.transform(new Date(this.form.controls.effectiveFrom.value), 'yyyy-MM-dd'));

      this.industryClassDeclarationConfig.inflationPercentages.push(inflationPercentage);

      const lastEffectiveInflationPercentageIndex = this.industryClassDeclarationConfig.inflationPercentages.length - 2;
      if (lastEffectiveInflationPercentageIndex > -1) {
        this.industryClassDeclarationConfig.inflationPercentages[lastEffectiveInflationPercentageIndex].effectiveTo = inflationPercentage.effectiveFrom;
      }
    }

    this.reset(true);
  }

  edit(inflationPercentage: InflationPercentage) {
    this.selectedInflationPercentage = inflationPercentage;

    this.form.patchValue({
      inflationPercentage: inflationPercentage.percentage,
      effectiveFrom: new Date(this.datepipe.transform(new Date(inflationPercentage.effectiveFrom), 'yyyy-MM-dd'))
    });

    if (this.selectedInflationPercentage && this.selectedInflationPercentage.inflationPercentageId && this.selectedInflationPercentage.inflationPercentageId > 0) {
      this.form.controls.effectiveFrom.disable();
    } else {
      this.form.controls.effectiveFrom.enable();
    }

    this.toggleForm();
  }

  delete(inflationPercentage: InflationPercentage) {
    this.hideForm = true;

    const index = this.industryClassDeclarationConfig.inflationPercentages.findIndex(s => s === inflationPercentage);
    const isCurrent = !(this.industryClassDeclarationConfig.inflationPercentages[index + 1]);

    this.industryClassDeclarationConfig.inflationPercentages.splice(index, 1);

    if (isCurrent) {
      const isFirst = this.industryClassDeclarationConfig.inflationPercentages[this.industryClassDeclarationConfig.inflationPercentages.length - 1];
      if (isFirst) {
        this.industryClassDeclarationConfig.inflationPercentages[this.industryClassDeclarationConfig.inflationPercentages.length - 1].effectiveTo = null;
      }
    }

    this.reset(false);
  }

  cancelForm() {
    this.reset(true);
  }

  reset(toggleForm: boolean) {
    if (toggleForm) {
      this.toggleForm();
      this.form.controls.effectiveFrom.enable();
    }

    this.form.reset();

    this.selectedInflationPercentage = null;
  }

  cancelDialog() {
    this.dialogRef.close(null);
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  setMinDate() {
    if (!this.industryClassDeclarationConfig || !this.industryClassDeclarationConfig.inflationPercentages) { return; }
    var currentIndex = this.industryClassDeclarationConfig.inflationPercentages.findIndex(s => s.effectiveTo == null);
    if (currentIndex > -1) {
      this.minDate = new Date(this.industryClassDeclarationConfig.inflationPercentages[currentIndex].effectiveFrom);
    }
  }
}
