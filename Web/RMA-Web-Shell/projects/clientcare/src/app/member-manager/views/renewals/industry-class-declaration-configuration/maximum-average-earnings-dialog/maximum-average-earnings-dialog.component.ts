import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IndustryClassDeclarationConfigurationComponent } from '../industry-class-declaration-configuration.component';
import { BehaviorSubject } from 'rxjs';
import { IndustryClassDeclarationConfiguration } from '../../../../models/industry-class-declaration-configuration';
import { MaxAverageEarning } from '../../../../models/max-average-earning';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'maximum-average-earnings-dialog',
  templateUrl: './maximum-average-earnings-dialog.component.html',
  styleUrls: ['./maximum-average-earnings-dialog.component.css']
})
export class MaximumAverageEarningsDialogComponent {

  form: UntypedFormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  industryClassDeclarationConfig: IndustryClassDeclarationConfiguration;
  isWizard = false;
  isReadOnly = false;

  hideForm = true;

  selectedMaxAverageEarning: MaxAverageEarning;

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
      minAverageEarning: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
      maxAverageEarning: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
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
    const maxAverageEarning = this.selectedMaxAverageEarning ? this.selectedMaxAverageEarning : new MaxAverageEarning();

    maxAverageEarning.minAverageEarnings = +this.form.controls.minAverageEarning.value;
    maxAverageEarning.maxAverageEarnings = +this.form.controls.maxAverageEarning.value;

    if (this.selectedMaxAverageEarning) {
      const index = this.industryClassDeclarationConfig.maxAverageEarnings.findIndex(s => s === this.selectedMaxAverageEarning);
      if (index > -1) {
        this.industryClassDeclarationConfig.maxAverageEarnings[index] = maxAverageEarning;
      }
    } else {
      if (!this.industryClassDeclarationConfig.maxAverageEarnings) {
        this.industryClassDeclarationConfig.maxAverageEarnings = [];
      }
      maxAverageEarning.effectiveFrom = new Date(this.datepipe.transform(new Date(this.form.controls.effectiveFrom.value), 'yyyy-MM-dd'));

      this.industryClassDeclarationConfig.maxAverageEarnings.push(maxAverageEarning);

      const lastEffectiveMaxAverageEarningIndex = this.industryClassDeclarationConfig.maxAverageEarnings.length - 2;
      if (lastEffectiveMaxAverageEarningIndex > -1) {
        this.industryClassDeclarationConfig.maxAverageEarnings[lastEffectiveMaxAverageEarningIndex].effectiveTo = maxAverageEarning.effectiveFrom;
      }
    }

    this.reset(true);
  }

  edit(maxAverageEarning: MaxAverageEarning) {
    this.selectedMaxAverageEarning = maxAverageEarning;

    this.form.patchValue({
      minAverageEarning: maxAverageEarning.minAverageEarnings,
      maxAverageEarning: maxAverageEarning.maxAverageEarnings,
      effectiveFrom: new Date(this.datepipe.transform(new Date(maxAverageEarning.effectiveFrom), 'yyyy-MM-dd'))
    });

    if (this.selectedMaxAverageEarning && this.selectedMaxAverageEarning.industryClassDeclarationConfigurationId && this.selectedMaxAverageEarning.industryClassDeclarationConfigurationId > 0) {
      this.form.controls.effectiveFrom.disable();
    } else {
      this.form.controls.effectiveFrom.enable();
    }

    this.toggleForm();
  }

  delete(maxAverageEarning: MaxAverageEarning) {
    this.hideForm = true;

    const index = this.industryClassDeclarationConfig.maxAverageEarnings.findIndex(s => s === maxAverageEarning);
    const isCurrent = !(this.industryClassDeclarationConfig.maxAverageEarnings[index + 1]);

    this.industryClassDeclarationConfig.maxAverageEarnings.splice(index, 1);

    if (isCurrent) {
      const isFirst = this.industryClassDeclarationConfig.maxAverageEarnings[this.industryClassDeclarationConfig.maxAverageEarnings.length - 1];
      if (isFirst) {
        this.industryClassDeclarationConfig.maxAverageEarnings[this.industryClassDeclarationConfig.maxAverageEarnings.length - 1].effectiveTo = null;
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

    this.selectedMaxAverageEarning = null;
  }

  cancelDialog() {
    this.dialogRef.close(null);
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  setMinDate() {
    if (!this.industryClassDeclarationConfig || !this.industryClassDeclarationConfig.maxAverageEarnings) { return; }
    var currentIndex = this.industryClassDeclarationConfig.maxAverageEarnings.findIndex(s => s.effectiveTo == null);
    if (currentIndex > -1) {
      this.minDate = new Date(this.industryClassDeclarationConfig.maxAverageEarnings[currentIndex].effectiveFrom);
    }
  }
}
