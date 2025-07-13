import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IndustryClassDeclarationConfigurationComponent } from '../industry-class-declaration-configuration.component';
import { BehaviorSubject } from 'rxjs';
import { IndustryClassDeclarationConfiguration } from '../../../../models/industry-class-declaration-configuration';
import { DatePipe } from '@angular/common';
import { LiveInAllowance } from '../../../../models/live-in-allowance';

@Component({
  selector: 'live-in-allowance-dialog',
  templateUrl: './live-in-allowance-dialog.component.html',
  styleUrls: ['./live-in-allowance-dialog.component.css']
})
export class LiveInAllowanceDialogComponent {

  form: UntypedFormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  industryClassDeclarationConfig: IndustryClassDeclarationConfiguration;
  isWizard = false;
  isReadOnly = false;

  hideForm = true;

  selectedLiveInAllowance: LiveInAllowance;

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
      allowance: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
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
    const liveInAllowance = this.selectedLiveInAllowance ? this.selectedLiveInAllowance : new LiveInAllowance();

    liveInAllowance.allowance = +this.form.controls.allowance.value;

    if (this.selectedLiveInAllowance) {
      const index = this.industryClassDeclarationConfig.liveInAllowances.findIndex(s => s === this.selectedLiveInAllowance);
      if (index > -1) {
        this.industryClassDeclarationConfig.liveInAllowances[index] = liveInAllowance;
      }
    } else {
      if (!this.industryClassDeclarationConfig.liveInAllowances) {
        this.industryClassDeclarationConfig.liveInAllowances = [];
      }
      liveInAllowance.effectiveFrom = new Date(this.datepipe.transform(new Date(this.form.controls.effectiveFrom.value), 'yyyy-MM-dd'));

      this.industryClassDeclarationConfig.liveInAllowances.push(liveInAllowance);

      const indx = this.industryClassDeclarationConfig.liveInAllowances.length - 2;
      if (indx > -1) {
        this.industryClassDeclarationConfig.liveInAllowances[indx].effectiveTo = liveInAllowance.effectiveFrom;
      }
    }

    this.reset(true);
  }

  edit(liveInAllowance: LiveInAllowance) {
    this.selectedLiveInAllowance = liveInAllowance;

    this.form.patchValue({
      allowance: liveInAllowance.allowance,
      effectiveFrom: new Date(this.datepipe.transform(new Date(liveInAllowance.effectiveFrom), 'yyyy-MM-dd'))
    });

    if (this.selectedLiveInAllowance && this.selectedLiveInAllowance.liveInAllowanceId && this.selectedLiveInAllowance.liveInAllowanceId > 0) {
      this.form.controls.effectiveFrom.disable();
    } else {
      this.form.controls.effectiveFrom.enable();
    }

    this.toggleForm();
  }

  delete(liveInAllowance: LiveInAllowance) {
    this.hideForm = true;

    const index = this.industryClassDeclarationConfig.liveInAllowances.findIndex(s => s === liveInAllowance);
    const isCurrent = !(this.industryClassDeclarationConfig.liveInAllowances[index + 1]);

    this.industryClassDeclarationConfig.liveInAllowances.splice(index, 1);

    if (isCurrent) {
      const isFirst = this.industryClassDeclarationConfig.liveInAllowances[this.industryClassDeclarationConfig.liveInAllowances.length - 1];
      if (isFirst) {
        this.industryClassDeclarationConfig.liveInAllowances[this.industryClassDeclarationConfig.liveInAllowances.length - 1].effectiveTo = null;
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

    this.selectedLiveInAllowance = null;
  }

  cancelDialog() {
    this.dialogRef.close(null);
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  setMinDate() {
    if (!this.industryClassDeclarationConfig || !this.industryClassDeclarationConfig.liveInAllowances) { return; }
    var currentIndex = this.industryClassDeclarationConfig.liveInAllowances.findIndex(s => s.effectiveTo == null);
    if (currentIndex > -1) {
      this.minDate = new Date(this.industryClassDeclarationConfig.liveInAllowances[currentIndex].effectiveFrom);
    }
  }
}
