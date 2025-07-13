import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IndustryClassDeclarationConfigurationComponent } from '../industry-class-declaration-configuration.component';
import { BehaviorSubject } from 'rxjs';
import { IndustryClassDeclarationConfiguration } from '../../../../models/industry-class-declaration-configuration';
import { DatePipe } from '@angular/common';
import { DeclarationPenaltyPercentage } from '../../../../models/declaration-penalty-percentage';

@Component({
  templateUrl: './penalty-configuration-dialog.component.html',
  styleUrls: ['./penalty-configuration-dialog.component.css']
})
export class PenaltyConfigurationDialogComponent {

  form: UntypedFormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  industryClassDeclarationConfig: IndustryClassDeclarationConfiguration;
  isWizard = false;
  isReadOnly = false;

  hideForm = true;

  selectedDeclarationPenaltyPercentage: DeclarationPenaltyPercentage;

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
      penaltyPercentage: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
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
    const penaltyPercentage = this.selectedDeclarationPenaltyPercentage ? this.selectedDeclarationPenaltyPercentage : new DeclarationPenaltyPercentage();

    penaltyPercentage.penaltyPercentage = +this.form.controls.penaltyPercentage.value;

    if (this.selectedDeclarationPenaltyPercentage) {
      const index = this.industryClassDeclarationConfig.declarationPenaltyPercentages.findIndex(s => s === this.selectedDeclarationPenaltyPercentage);
      if (index > -1) {
        this.industryClassDeclarationConfig.declarationPenaltyPercentages[index] = penaltyPercentage;
      }
    } else {
      if (!this.industryClassDeclarationConfig.declarationPenaltyPercentages) {
        this.industryClassDeclarationConfig.declarationPenaltyPercentages = [];
      }
      penaltyPercentage.effectiveFrom = new Date(this.datepipe.transform(new Date(this.form.controls.effectiveFrom.value), 'yyyy-MM-dd'));

      this.industryClassDeclarationConfig.declarationPenaltyPercentages.push(penaltyPercentage);

      const lastEffectivePenaltyPercentageIndex = this.industryClassDeclarationConfig.declarationPenaltyPercentages.length - 2;
      if (lastEffectivePenaltyPercentageIndex > -1) {
        this.industryClassDeclarationConfig.declarationPenaltyPercentages[lastEffectivePenaltyPercentageIndex].effectiveTo = penaltyPercentage.effectiveFrom;
      }
    }

    this.reset(true);
  }

  edit(penaltyPercentage: DeclarationPenaltyPercentage) {
    this.selectedDeclarationPenaltyPercentage = penaltyPercentage;

    this.form.patchValue({
      penaltyPercentage: penaltyPercentage.penaltyPercentage,
      effectiveFrom: new Date(this.datepipe.transform(new Date(penaltyPercentage.effectiveFrom), 'yyyy-MM-dd'))
    });

    if (this.selectedDeclarationPenaltyPercentage && this.selectedDeclarationPenaltyPercentage.declarationPenaltyPercentageId && this.selectedDeclarationPenaltyPercentage.declarationPenaltyPercentageId > 0) {
      this.form.controls.effectiveFrom.disable();
    } else {
      this.form.controls.effectiveFrom.enable();
    }

    this.toggleForm();
  }

  delete(penaltyPercentage: DeclarationPenaltyPercentage) {
    this.hideForm = true;

    const index = this.industryClassDeclarationConfig.declarationPenaltyPercentages.findIndex(s => s === penaltyPercentage);
    const isCurrent = !(this.industryClassDeclarationConfig.declarationPenaltyPercentages[index + 1]);

    this.industryClassDeclarationConfig.declarationPenaltyPercentages.splice(index, 1);

    if (isCurrent) {
      const isFirst = this.industryClassDeclarationConfig.declarationPenaltyPercentages[this.industryClassDeclarationConfig.declarationPenaltyPercentages.length - 1];
      if (isFirst) {
        this.industryClassDeclarationConfig.declarationPenaltyPercentages[this.industryClassDeclarationConfig.declarationPenaltyPercentages.length - 1].effectiveTo = null;
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

    this.selectedDeclarationPenaltyPercentage = null;
  }

  cancelDialog() {
    this.dialogRef.close(null);
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  setMinDate() {
    if (!this.industryClassDeclarationConfig || !this.industryClassDeclarationConfig.declarationPenaltyPercentages) { return; }
    var currentIndex = this.industryClassDeclarationConfig.declarationPenaltyPercentages.findIndex(s => s.effectiveTo == null);
    if (currentIndex > -1) {
      this.minDate = new Date(this.industryClassDeclarationConfig.declarationPenaltyPercentages[currentIndex].effectiveFrom);
    }
  }
}
