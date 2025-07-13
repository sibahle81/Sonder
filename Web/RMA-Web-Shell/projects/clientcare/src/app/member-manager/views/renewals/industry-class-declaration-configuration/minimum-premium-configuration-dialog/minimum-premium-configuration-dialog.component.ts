import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IndustryClassDeclarationConfigurationComponent } from '../industry-class-declaration-configuration.component';
import { BehaviorSubject } from 'rxjs';
import { IndustryClassDeclarationConfiguration } from '../../../../models/industry-class-declaration-configuration';
import { DatePipe } from '@angular/common';
import { MinimumAllowablePremium } from '../../../../models/minimum-allowable-premium';

@Component({
  templateUrl: './minimum-premium-configuration-dialog.component.html',
  styleUrls: ['./minimum-premium-configuration-dialog.component.css']
})
export class MinimumPremiumConfigurationDialogComponent {

  form: UntypedFormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  industryClassDeclarationConfig: IndustryClassDeclarationConfiguration;
  isWizard = false;
  isReadOnly = false;

  hideForm = true;

  selectedMinimumAllowablePremium: MinimumAllowablePremium;

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
      minimumAllowablePremium: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
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
    const minimumPremium = this.selectedMinimumAllowablePremium ? this.selectedMinimumAllowablePremium : new MinimumAllowablePremium();

    minimumPremium.minimumPremium = +this.form.controls.minimumAllowablePremium.value;

    if (this.selectedMinimumAllowablePremium) {
      const index = this.industryClassDeclarationConfig.minimumAllowablePremiums.findIndex(s => s === this.selectedMinimumAllowablePremium);
      if (index > -1) {
        this.industryClassDeclarationConfig.minimumAllowablePremiums[index] = minimumPremium;
      }
    } else {
      if (!this.industryClassDeclarationConfig.minimumAllowablePremiums) {
        this.industryClassDeclarationConfig.minimumAllowablePremiums = [];
      }
      minimumPremium.effectiveFrom = new Date(this.datepipe.transform(new Date(this.form.controls.effectiveFrom.value), 'yyyy-MM-dd'));

      this.industryClassDeclarationConfig.minimumAllowablePremiums.push(minimumPremium);

      const lastEffectiveMinimumAllowablePremiumIndex = this.industryClassDeclarationConfig.minimumAllowablePremiums.length - 2;
      if (lastEffectiveMinimumAllowablePremiumIndex > -1) {
        this.industryClassDeclarationConfig.minimumAllowablePremiums[lastEffectiveMinimumAllowablePremiumIndex].effectiveTo = minimumPremium.effectiveFrom;
      }
    }

    this.reset(true);
  }

  edit(minimumAllowablePremium: MinimumAllowablePremium) {
    this.selectedMinimumAllowablePremium = minimumAllowablePremium;

    this.form.patchValue({
      minimumAllowablePremium: minimumAllowablePremium.minimumPremium,
      effectiveFrom: new Date(this.datepipe.transform(new Date(minimumAllowablePremium.effectiveFrom), 'yyyy-MM-dd'))
    });

    if (this.selectedMinimumAllowablePremium && this.selectedMinimumAllowablePremium.minimumAllowablePremiumId && this.selectedMinimumAllowablePremium.minimumAllowablePremiumId > 0) {
      this.form.controls.effectiveFrom.disable();
    } else {
      this.form.controls.effectiveFrom.enable();
    }

    this.toggleForm();
  }

  delete(minimumAllowablePremium: MinimumAllowablePremium) {
    this.hideForm = true;

    const index = this.industryClassDeclarationConfig.minimumAllowablePremiums.findIndex(s => s === minimumAllowablePremium);
    const isCurrent = !(this.industryClassDeclarationConfig.minimumAllowablePremiums[index + 1]);

    this.industryClassDeclarationConfig.minimumAllowablePremiums.splice(index, 1);

    if (isCurrent) {
      const isFirst = this.industryClassDeclarationConfig.minimumAllowablePremiums[this.industryClassDeclarationConfig.minimumAllowablePremiums.length - 1];
      if (isFirst) {
        this.industryClassDeclarationConfig.minimumAllowablePremiums[this.industryClassDeclarationConfig.minimumAllowablePremiums.length - 1].effectiveTo = null;
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

    this.selectedMinimumAllowablePremium = null;
  }

  cancelDialog() {
    this.dialogRef.close(null);
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  setMinDate() {
    if (!this.industryClassDeclarationConfig || !this.industryClassDeclarationConfig.minimumAllowablePremiums) { return; }
    var currentIndex = this.industryClassDeclarationConfig.minimumAllowablePremiums.findIndex(s => s.effectiveTo == null);
    if (currentIndex > -1) {
      this.minDate = new Date(this.industryClassDeclarationConfig.minimumAllowablePremiums[currentIndex].effectiveFrom);
    }
  }
}
