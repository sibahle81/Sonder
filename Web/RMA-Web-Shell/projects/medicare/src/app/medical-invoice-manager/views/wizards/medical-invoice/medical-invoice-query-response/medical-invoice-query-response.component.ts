import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { BehaviorSubject } from 'rxjs';
import { InvoiceQueryDetails } from '../../../../models/invoice-query-details';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';

@Component({
  selector: 'medical-invoice-query-response',
  templateUrl: './medical-invoice-query-response.component.html',
  styleUrls: ['./medical-invoice-query-response.component.css']
})
export class MedicalInvoiceQueryResponseComponent extends WizardDetailBaseComponent<InvoiceQueryDetails> implements OnInit, OnDestroy {

  medicalInvoiceQueryResponseForm: UntypedFormGroup;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loading$ = new BehaviorSubject<boolean>(false);
  rolePlayerItemQueryTypes: Lookup[];
  rolePlayerQueryItemTypes: Lookup[];
  rolePlayerItemQueryCategories: Lookup[];
  rolePlayerItemQueryStatuses: Lookup[];

  documentSystemName = DocumentSystemNameEnum.HcpManagerDocuments;
  documentSet = DocumentSetEnum.HcpDocuments;
  queryReferenceNumber: string;  

  constructor(private formBuilder: UntypedFormBuilder,
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private activeRoute: ActivatedRoute,
    private readonly lookupService: LookupService)
  {
    super(appEventsManager, authService, activeRoute,);
    this.createForm();
  }

  onLoadLookups(): void {

  }

  populateModel(): void {
    if (!this.model) return;
    let medicalInvoiceQueryResponseForm = this.medicalInvoiceQueryResponseForm.getRawValue();

    this.model.queryReferenceNumber = medicalInvoiceQueryResponseForm.queryReferenceNumber;
    this.model.id = (this.model.id > 0) ? this.model.id : 0;
    this.model.rolePlayerItemQueryType = medicalInvoiceQueryResponseForm.rolePlayerItemQueryType;
    this.model.rolePlayerQueryItemType = medicalInvoiceQueryResponseForm.rolePlayerQueryItemType;
    this.model.rolePlayerItemQueryCategory = medicalInvoiceQueryResponseForm.rolePlayerItemQueryCategory;
    this.model.queryDescription = medicalInvoiceQueryResponseForm.queryDescription;
    this.model.rolePlayerItemQueryStatus = medicalInvoiceQueryResponseForm.rolePlayerItemQueryStatus;
    this.model.queryResponse = medicalInvoiceQueryResponseForm.queryResponse;
  }

  populateForm(): void {    
    if (!this.model) 
        return;
      
    const form = this.medicalInvoiceQueryResponseForm.controls;
    form.queryReferenceNumber.patchValue(this.model.queryReferenceNumber);
    form.rolePlayerItemQueryType.patchValue(this.model.rolePlayerItemQueryType);
    form.rolePlayerQueryItemType.patchValue(this.model.rolePlayerQueryItemType);
    form.rolePlayerItemQueryCategory.patchValue(this.model.rolePlayerItemQueryCategory);
    form.rolePlayerItemQueryStatus.patchValue(this.model.rolePlayerItemQueryStatus);
    form.queryDescription.patchValue(this.model.queryDescription);
    this.queryReferenceNumber = this.model.queryReferenceNumber;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {  
     if (!this.model.queryResponse) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Query Response is required`);
    }

    return validationResult;
  }

  ngOnInit() {
    this.loadLookups();
  }

  loadLookups(){
    this.lookupService.getRolePlayerItemQueryTypes().subscribe(
        data => {
          this.rolePlayerItemQueryTypes = data;
        }
      );
      this.lookupService.getRolePlayerQueryItemTypes().subscribe(
        data => {
          this.rolePlayerQueryItemTypes = data;
        }
      );
      this.lookupService.getRolePlayerItemQueryCategories().subscribe(
        data => {
          this.rolePlayerItemQueryCategories = data;
        }
      );
      this.lookupService.getRolePlayerItemQueryStatuses().subscribe(
        data => {
          this.rolePlayerItemQueryStatuses = data;
        }
      );
  }

  createForm(): void {
    this.medicalInvoiceQueryResponseForm = this.formBuilder.group({
      queryReferenceNumber: [{ value: '', disabled: true }],
      rolePlayerItemQueryType: [{ value: '', disabled: true }],
      rolePlayerQueryItemType: [{ value: '', disabled: true }],
      rolePlayerItemQueryCategory: [{ value: '', disabled: true }],
      queryDescription: [{ value: '', disabled: true }],
      rolePlayerItemQueryStatus: ['', Validators.required],
      queryResponse: ['', Validators.required],
    });
  }

  onResetAllFormFields() {
    this.medicalInvoiceQueryResponseForm.reset();
  }
  
  getError(control) {
    switch (control) {
      case 'rolePlayerItemQueryStatus':
        if (this.medicalInvoiceQueryResponseForm.get('rolePlayerItemQueryStatus').hasError('required') && this.medicalInvoiceQueryResponseForm.controls?.rolePlayerItemQueryStatus.touched) {
          return 'Query Status required';
        }
        break;
      case 'queryResponse':
        if (this.medicalInvoiceQueryResponseForm.get('queryResponse').hasError('required') && this.medicalInvoiceQueryResponseForm.controls?.queryResponse.touched) {
          return 'Query Response required';
        }
        break;
      default:
        return '';
    }
  }

  ngOnDestroy() {

  }

}
