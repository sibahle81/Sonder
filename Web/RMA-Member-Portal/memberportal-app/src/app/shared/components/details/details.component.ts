// wiki: http://bit.ly/2B9IeCF
// The base component class for details components.

import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Directive, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { AuditLogComponent } from '../audit/audit-log.component';
import { NotesRequest } from '../notes/notes-request';
import { NotesComponent } from '../notes/notes.component';
import { LastModifiedByComponent } from '../last-modified-by/last-modified-by.component';
import { AuditRequest } from 'src/app/core/models/audit-models';
import { BaseClass } from 'src/app/core/models/base-class.model';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { AlertService } from '../../services/alert.service';
import { Lookup } from '../../models/lookup.model';
import { ValidationResult } from '../../models/validation-result.model';

@Directive()
/** @description The base component class for details components. */
// tslint:disable-next-line: directive-class-suffix
export abstract class DetailsComponent {
  @ViewChild(AuditLogComponent) auditLogComponent: AuditLogComponent;
  @ViewChild(NotesComponent) notesComponent: NotesComponent;
  @ViewChild(LastModifiedByComponent) lastModifiedByComponent: LastModifiedByComponent;

  @ViewChildren(MultiSelectComponent)
  multiSelectComponentChildren: QueryList<MultiSelectComponent>;

  isWizard = false;
  multiSelectChanged = false;
  submittedCount = 0;
  form: FormGroup;
  disabledControlsOnEdit: string[];
  canEdit = true;
  canAdd = true;

  get isFormInvalid(): boolean {
    return this.form.invalid;
  }

  protected constructor(
    private readonly privateAppEventsManager: AppEventsManager,
    private readonly privateAlertService: AlertService,
    private readonly privateRouter: Router,
    private readonly type: string,
    private readonly route: string,
    private readonly totalSubmits: number) {
  }

  get showEditButton(): boolean {
    if (!this.form) { return false; }
    return this.form.disabled && this.canEdit;
  }

  get showSaveButton(): boolean {
    if (!this.form) { return false; }
    return this.form.enabled && (this.canAdd || this.canEdit);
  }

  get showButtons(): boolean {
    return !this.isWizard;
  }

  /**
   * @description Create the angular form on the component.
   * @param string id The id of the model that will populate the form.
   */
  abstract createForm(id: string): void;

  /** @description Reads the data from the angular form and returns the model. */
  abstract readForm(): void;

  /**
   * @description Populate the form with data.
   * @param any item The model that will populate the form.
   */
  abstract setForm(item: any): void;

  /** @description Save the form data to a service. */
  abstract save(): void;

  /** @description The current values that will be ignored by unique validation. (Should be overridden in a child component) */
  setCurrentValues(): void {

  }

  /**
   * @description Gets the multi select control by name.
   * @param string lookupName The name of the control to get.
   */
  getLookupControl(lookupName: string) {
    if (!this.multiSelectComponentChildren) { return null; }
    const component = this.multiSelectComponentChildren.find((child) => child.lookupName === lookupName);
    return component;
  }

  /** @description Goes back to the list component. */
  back(): void {
    this.privateRouter.navigate([this.route]);
  }

  /** @description Sets the form to edit mode. */
  edit(): void {
    this.submittedCount = 0;
    this.form.enable();
    this.setCurrentValues();

    if (this.disabledControlsOnEdit) {
      this.disabledControlsOnEdit.forEach(property => {
        if (this.form.get(property)) {
          this.form.get(property).disable();
        }
      });
    }
  }

  /**
   * @description Checks when all saves are completed, and then goes to the list component.
   * @param string name The name to display on the success message.
   */
  done(name: string = null, immediateRedirect: boolean = false): void {
    this.submittedCount++;
    if ((this.submittedCount < this.totalSubmits) && immediateRedirect === false) { return; }
    this.privateAlertService.success(`'${name == null ? this.form.value.name : name}' was saved successfully`,
      `${this.type} saved`,
      true);
    this.back();
  }

  /**
   * @description Checks when all saves are completed, and then remains on the current component.
   * @param string name The name to display on the success message.
   */
  doneAndContinue(name: string = null): void {
    this.submittedCount++;
    if (this.submittedCount < this.totalSubmits) { return; }
    this.privateAlertService.success(`'${name == null ? this.form.value.name : name}' was saved successfully`, `${this.type} saved`, true);
  }

  /** @description Updates the form status if the user changes a multi select control. */
  onMultiSelectChanged(): void {
    this.form.markAsDirty();
  }

  /** @description Hides the current control and shows the loading screen. */
  loadingStart(message: string): void {
    this.privateAppEventsManager.loadingStart(message);
  }

  /** @description Stps showing the loading control, and shows the current control again */
  loadingStop(): void {
    this.privateAppEventsManager.loadingStop();
  }

  get isIdandPassportInvalid() {
    if (this.form == null || (!this.form.controls.idNumber.touched && !this.form.controls.passportNumber.touched)) { return false; }

    return ((this.form.controls.idNumber.value == null || this.form.controls.idNumber.value === '') &&
      (this.form.controls.passportNumber.value == null || this.form.controls.passportNumber.value === ''));
  }

  // TODO must be removed from here * details do not always need audit

  /** @description Gets the audit details for the selected details class */
  getAuditDetails(id: number, serviceType: number, itemType: number): void {
    const auditRequest = new AuditRequest(serviceType, itemType, id);
    this.auditLogComponent.getData(auditRequest);
  }

  // TODO must be removed from here * details do not always need notes

  /** @description Gets the notes for the selected details class */
  getNotes(id: number, serviceType: number, itemType: string): void {
    const noteRequest = new NotesRequest(serviceType, itemType, id);
    this.notesComponent.getData(noteRequest);
  }

  /** @description Gets the display name for the selected base class */
  getDisplayName(baseClass: BaseClass): void {
    if (!this.lastModifiedByComponent) { return; }
    this.lastModifiedByComponent.getDisplayName(baseClass);
  }

  /** @description Clears the display name */
  clearDisplayName(): void {
    if (!this.lastModifiedByComponent) { return; }
    this.lastModifiedByComponent.clearDisplayName();
  }

  /** @description Resets the permissions so that it can be checked again */
  resetPermissions(): void {
    this.canAdd = true;
    this.canEdit = true;
  }

  /** @description Allows for the correct parsing of dates */
  parseForDate(value: string | Date, fixTimezone: boolean = false, addDays: number = 0): Date {
    let newDate = new Date();
    if (typeof value === 'string') {
      newDate = new Date(value);
      newDate.setDate(newDate.getDate() + addDays);
    } else {
      newDate = value;
      newDate.setDate(value.getDate() + addDays);
    }
    if (fixTimezone) {
      newDate.setHours(newDate.getHours() - newDate.getTimezoneOffset() / 60);
    }
    return newDate;
  }

  sortByName(a: Lookup, b: Lookup): number {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }

  getFormValidationResult(displayName: string): ValidationResult {
    const validationResult = new ValidationResult(displayName);

    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.controls[key];
      if (control.status === 'PENDING') {
        validationResult.isPending = true;
        validationResult.statusChange = this.form.statusChanges;
      } else if (control.enabled && !control.valid) {
        validationResult.errors++;
        validationResult.errorMessages.push('Field "' + key + '" is invalid');
      }
    });

    return validationResult;
  }
}
