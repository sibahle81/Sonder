import { OnInit, ViewChildren, QueryList, Directive, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { MultiSelectComponent } from '../../../multi-select/multi-select.component';
import { WizardComponentInterface } from '../../sdk/wizard-component.interface';
import { ValidationResult } from '../../shared/models/validation-result';
import { WizardContext } from '../../shared/models/wizard-context';
import { WizardStatus } from '../../shared/models/wizard-status.enum';

@Directive()
/** @description The base component class for details components. */
// tslint:disable-next-line: directive-class-suffix
export abstract class WizardDetailBaseComponent<TModel> implements WizardComponentInterface, OnInit, AfterViewInit {
  @ViewChildren(MultiSelectComponent)
  multiSelectComponentChildren: QueryList<MultiSelectComponent>;
  multiSelectChanged = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isMatSort$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  hasComponent$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  firstName: string;
  displayName: string;
  step: string;
  isWizard = true; // REMOVE
  singleDataModel = true;
  isDisabled = false;
  form: FormGroup;

  submittedCount = 0; // REMOVE
  disabledControlsOnEdit: string[]; // REMOVE
  canEdit = true;
  canAdd = true; // REMOVE
  canView = true;

  viewPermission: string;
  editPermission: string;
  addPermission: string;

  loadingMessage = 'Loading...';
  // tslint:disable-next-line:variable-name
  private _model: TModel;
  // tslint:disable-next-line:variable-name
  private _context: WizardContext;

  protected constructor(
    protected readonly privateAppEventsManager: AppEventsManager,
    protected readonly authService: AuthService,
    protected readonly activatedRoute: ActivatedRoute) {
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.isMatSort$.next(true);
    }
  }

  /**
   * @description Create the angular form on the component.
   * @param string id The id of the model that will populate the form.
   *   createForm(id: any): void {
   *   if (this.form) { return; }
   *   this.form = this.formBuilder.group({
   *     id: [id]
   *   });
   *   }
   */
  abstract createForm(id: number): void;

  /** @description load lookup data, called during onInit */
  abstract onLoadLookups(): void;

  /**
   * @description Populate the form with data. Read from this.form
   * @param TModel item The model that will be populated from the form.
   */
  abstract populateModel(): void;
  /**
   * @description Populate the form with data. Read from this.form
   * @param TModel item The model that will populate the form.
   */
  abstract populateForm(): void;

  /**
   * @description Validate the data model and return custom errors
   * @param ValidationResult to append your errors to
   * @param TModel that must be validated
   */
  abstract onValidateModel(validationResult: ValidationResult): ValidationResult;

  private createFormPrivate() {
    if (this.form) { return; }
    this.createForm(0);
  }

  setViewData(model: TModel, isWizard = true): void {
    this._model = model;
    this.isDisabled = !isWizard; // isDisabled must be initialised
    this.isWizard = isWizard;
    this.createFormPrivate();
    this.populateForm();
    this.disable();
  }

  wizardReadFormData(context: WizardContext): TModel {
    this._model = context.data[0] as TModel;
    this.populateModel();
    return this._model;
  }

  wizardPopulateForm(context: WizardContext): void {
    this.createFormPrivate();
    if (context.data[0]) {
      this._context = context;
      this._model = context.data[0] as TModel;
      if (this.isDisabled === undefined) {
        this.isDisabled = this.isReadonly;
      }
      this.populateForm();
      if (!this.isInProgress()) {
        this._context.wizard.canEdit = false;
        this.disable();
      }
    }
  }

  private isInProgress(): boolean {
    if (this.isWizard) {
      if (this._context && this._context.wizard) {
        return this._context.wizard.wizardStatusId === WizardStatus.InProgress;
      }
    }
    return false;
  }

  wizardValidateForm(context: WizardContext): ValidationResult {
    if (context.name !== 'premium-listing') {
      this.wizardPopulateForm(context);
    }
    const validationResult = new ValidationResult(this.displayName);

    if (this.form) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.controls[key];
        if (control.status === 'PENDING') {
          validationResult.isPending = true;
          validationResult.statusChange = this.form.statusChanges;
        } else if (control.enabled && !control.valid) {
          validationResult.errors++;
          if (control.hasError('required') || control.hasError('min')) {
            validationResult.errorMessages.push('Field "' + key + '" is required');
          } else {
            validationResult.errorMessages.push('Field "' + key + '" is invalid');
          }
        }
      });
    }

    this._model = context.data[0] as TModel;
    return this.onValidateModel(validationResult);
  }

  ngOnInit(): void {
    this.loadingStart(this.loadingMessage);
    this.checkUserAddPermission();
    this.onLoadLookups();

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.createFormPrivate();
        if (this.form) {
          this.disable();
        }
      } else {
        this.createFormPrivate();
      }
    });

    this.loadingStop();
  }

  disable(): void {
    this.isDisabled = true;
    if (this.form !== undefined) {
      this.form.disable();
    }
  }

  enable(): void {
    this.isDisabled = false;
    this.submittedCount = 0;

    if (this.form !== undefined) {
      this.form.enable();
      if (this.disabledControlsOnEdit) {
        this.disabledControlsOnEdit.forEach(property => {
          if (this.form.get(property)) {
            this.form.get(property).disable();
          }
        });
      }
    }
  }

  /** @description Sets the form to edit mode. */
  edit(): void {
    if (this.canEdit) {
      this.enable();
    }
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

  /**
   * @description Gets the multi select control by name.
   * @param string lookupName The name of the control to get.
   */
  getLookupControl(lookupName: string) {
    if (!this.multiSelectComponentChildren) { return null; }
    const component = this.multiSelectComponentChildren.find((child) => child.lookupName === lookupName);
    return component;
  }

  protected checkUserAddPermission(): void {
    const permissions = this.authService.getCurrentUserPermissions();
    if (this.addPermission !== undefined && this.addPermission !== '') {
      this.canAdd = permissions.find(permission => permission.name === this.addPermission) != null;
    }
    if (this.editPermission !== undefined && this.editPermission !== '') {
      this.canEdit = permissions.find(permission => permission.name === this.editPermission) != null;
    }
    if (this.viewPermission !== undefined && this.viewPermission !== '') {
      this.canView = permissions.find(permission => permission.name === this.viewPermission) != null;
    }
    if (this.canAdd || this.canEdit) {
      this.canView = true;
    }
  }

  set model(val) {
    this._model = val;
    if (this._context) {
      this._context.data[0] = this._model;
    }
  }

  get model(): TModel {
    return this._model;
  }

  get context(): WizardContext {
    return this._context;
  }

  get isReadonly(): boolean {
    if (this.isWizard) {
      return !(this._context != null && this._context.wizard != null) || !this._context.wizard.canEdit;
    } else {
      return false;
    }
  }

  get inApprovalMode(): boolean {
    return this.context && this.context.wizard && this.context.wizard.wizardStatusId === WizardStatus.AwaitingApproval;
  }
}
