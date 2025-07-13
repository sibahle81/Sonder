import { Component, ComponentFactoryResolver, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { BehaviorSubject } from 'rxjs';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from "projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service";
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { DatePipe } from '@angular/common';
import { InterestIndicator } from '../../../models/InterestIndicator';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';

@Component({
  selector: 'app-interest-indicator',
  templateUrl: './interest-indicator.component.html',
  styleUrls: ['./interest-indicator.component.css']
})
export class InterestIndicatorComponent extends PermissionHelper implements OnInit {
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly wizardService: WizardService,
    private readonly toastr: ToastrManager,
    private readonly datePipe: DatePipe,
    public dialog: MatDialog,
  ) {
    super();
  }

  editPermission = 'Edit Interest Indicator';

  WizardStatus: WizardStatus;
  CanCreateNewWizard: Boolean = true;

  interestStartDate: Date;
  interestEndDate: Date;
  chargeInterest: boolean;
  metalsIndustryClass= +IndustryClassEnum.Metals;
  minDate: Date;
  maxDate: Date;
  form: UntypedFormGroup;
  isLoading$ = new BehaviorSubject(true);

  @Input() interestIndicator: InterestIndicator;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() industryClass: IndustryClassEnum;

  ngOnInit(): void {
    this.createForm();
  }

  getStartDate(): Date {
    return new Date(this.form.controls.interestStartDate.value);
  }

  getEndDate(): Date {
    return new Date(this.form.controls.interestEndDate.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading$.next(true);
    if (this.interestIndicator) {
      this.isReadOnly = true;
      this.createForm();
    }
    this.isLoading$.next(false);
  }

  createForm() {
    this.form = this.formBuilder.group({
      interestStartDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      interestEndDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      chargeInterest: [{ value: null, disabled: this.isReadOnly }],
    });

    this.setForm();
  }
  setForm() {
    this.form.patchValue({
      interestStartDate: this.interestIndicator && this.interestIndicator.interestDateFrom ? this.interestIndicator.interestDateFrom : new Date().getCorrectUCTDate(),
      interestEndDate: this.interestIndicator && this.interestIndicator.interestDateTo ? this.interestIndicator.interestDateTo : new Date().getCorrectUCTDate(),
      chargeInterest: this.interestIndicator && this.interestIndicator.chargeInterest ? this.interestIndicator.chargeInterest : false
    });
    this.chargeInterest =  this.interestIndicator && this.interestIndicator.chargeInterest ? this.interestIndicator.chargeInterest : false;
  }

  readForm() {
    if (!this.interestIndicator) {
      this.interestIndicator = new InterestIndicator();
    }

    this.interestIndicator.interestDateFrom = new Date(this.datePipe.transform(this.form.controls.interestStartDate.value, 'yyyy-MM-dd'));
    this.interestIndicator.interestDateTo = new Date(this.datePipe.transform(this.form.controls.interestEndDate.value, 'yyyy-MM-dd'));
    this.interestIndicator.isActive = true;
    this.interestIndicator.chargeInterest = this.form.controls.chargeInterest.value;   
  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: "40%",
      disableClose: true,
      data: {
        title: "Update Interest Indicator Status?",
        text: `Are you sure you want to change the interest indicator status of this debtor?
        `,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isReadOnly = false;
        this.createForm();
      }
    });
  }

  cancel() {
    this.isReadOnly = true;
    this.createForm();
  }

  save() {
    this.startInterestIndicator();
    this.isReadOnly = true;
  }

  edit() {
    if (this.interestIndicator && this.interestIndicator.rolePlayerId > 0) {
      this.openConfirmationDialog();
    }
    else {
      this.interestIndicator = new InterestIndicator();
      this.isReadOnly = false;
      this.createForm();
    }
  }

  startInterestIndicator() {
    this.isLoading$.next(true);
    if (this.isWizard) { return; }
    this.wizardService.getWizardsInProgressByTypesAndLinkedItemId(this.interestIndicator.rolePlayerId, 'interest-indicator').subscribe(results => {
      if (results) {
        if(results.filter(y => y.wizardStatusId == WizardStatus.AwaitingApproval || y.wizardStatusId == WizardStatus.InProgress)?.length > 0)
        {
          this.toastr.warningToastr(`Interest indicator workflow has already been submitted.`);
          this.isReadOnly = true;
          this.createForm();
          this.isLoading$.next(false);
          return;
        }
        else {
          this.readForm();
          const startWizardRequest = new StartWizardRequest();
          startWizardRequest.type = 'interest-indicator';
          startWizardRequest.linkedItemId = this.interestIndicator.rolePlayerId;
          startWizardRequest.data = JSON.stringify(this.interestIndicator);
      
          this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
            if (result) {
              this.isReadOnly = true;
              this.toastr.successToastr('Interest indicator workflow started');
             this.isLoading$.next(false);
            }
          })
        }
      }
    });
  }
}