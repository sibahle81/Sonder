import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CorrectiveEntryNotification } from 'projects/shared-components-lib/src/lib/models/corrective-entry-notification.model';
import { CorrectiveEntrySplit } from 'projects/shared-components-lib/src/lib/models/corrective-entry-split.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

class EntryErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return (control && control.invalid);
  }
}
@Component({
  selector: 'app-corrective-entry-split',
  templateUrl: './corrective-entry-split.component.html',
  styleUrls: ['./corrective-entry-split.component.css']
})
export class CorrectiveEntrySplitComponent extends WizardDetailBaseComponent<CorrectiveEntryNotification> implements OnInit{
  viewMode = false;
  matcher = new EntryErrorStateMatcher();

  displayedColumns = ['amount', 'fromDate', 'toDate', 'PAYETax', 'dayMonthCount'];
  dataSource: any;

  menus =  [
    { title: 'View', action: 'view', disable: true },
    { title: 'Edit', action: 'edit', disable: true },
    { title: 'Delete', action: 'delete', disable: false }
  ]

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private formBuilder: UntypedFormBuilder,
    activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef) {
    super(appEventsManager, authService, activatedRoute);
  }


  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    if (this.form) return;
    this.form = this.formBuilder.group({
      correctiveSplit: this.formBuilder.array([])
    })
  }

  get correctiveSplit() {
    return this.form.controls["correctiveSplit"] as UntypedFormArray;
  }

  createCorrectiveDetail(correctiveSplit?: CorrectiveEntrySplit) {
    return this.formBuilder.group({
      amount: [correctiveSplit ? correctiveSplit.amount : '', Validators.required],
      fromDate: [correctiveSplit ? correctiveSplit.fromDate : '', Validators.required],
      toDate: [correctiveSplit ? correctiveSplit.toDate : '', Validators.required],
      PAYETax: [correctiveSplit ? correctiveSplit.PAYETax : '', Validators.required],
      dayMonthCount: [correctiveSplit ? correctiveSplit.dayMonthCount : '', Validators.required]
    });
  }

  addCorrectiveSplit(correctiveSplit?: CorrectiveEntrySplit) {
    this.correctiveSplit.push(this.createCorrectiveDetail(correctiveSplit));
    this.cdr.detectChanges();
  }

  deleteCorrectiveSplit(splitIndex: number) {
    this.correctiveSplit.removeAt(splitIndex);
  }

  onLoadLookups(): void {
  }
  populateModel(): void {
    this.model.correctiveEntrySplit = this.correctiveSplit.controls.map((formItem, index) => {
      const newSplit = new CorrectiveEntrySplit()
      newSplit.amount = formItem['controls']['amount'].value;
      newSplit.fromDate = formItem['controls']['fromDate'].value;
      newSplit.toDate = formItem['controls']['toDate'].value;
      newSplit.PAYETax = formItem['controls']['PAYETax'].value;
      newSplit.dayMonthCount = formItem['controls']['dayMonthCount'].value;

      return newSplit;
    })
  }
  populateForm(): void {
    this.canEdit = !this.isReadonly;
    if (this.model && this.model.correctiveEntrySplit && this.correctiveSplit) {
      const formSize = this.correctiveSplit.length;
      this.model.correctiveEntrySplit.forEach(item => {
        this.addCorrectiveSplit(item);
      })

      for(let i = 0; formSize > i; i++) {
        this.deleteCorrectiveSplit(i)
      }
    }
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  onSelect(index, action) {
    switch (action) {
      case 'view':
        // TODO: View
        break;
      case 'edit':
        // TODO: edit
        break;
      case 'delete':
        this.deleteCorrectiveSplit(index);
        break;
      default:
        break;
    }
  }
}

