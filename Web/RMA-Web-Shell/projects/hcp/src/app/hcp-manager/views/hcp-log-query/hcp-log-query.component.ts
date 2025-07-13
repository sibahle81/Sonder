import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { CommonFunctionUtility } from 'projects/shared-utilities-lib/src/lib/common-function-utility/common-function-utility';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import {
  RolePlayerItemQueryCategoryEnum
  , RolePlayerItemQueryStatusEnum
  , RolePlayerItemQueryTypeEnum
  , RolePlayerQueryItemTypeEnum
} from 'projects/shared-models-lib/src/lib/enums/roleplayer-item-query-enums';
import { RolePlayerItemQuery } from 'projects/hcp/src/app/hcp-manager/entities/roleplayer-item-query';
import { RolePlayerItemQueryItem } from 'projects/hcp/src/app/hcp-manager/entities/roleplayer-item-query-item';
import { RolePlayerQueryService } from 'projects/hcp/src/app/hcp-manager/services/roleplayer-query-service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';

@Component({
  selector: 'hcp-log-query',
  templateUrl: './hcp-log-query.component.html',
  styleUrls: ['./hcp-log-query.component.css']
})
export class HcpLogQueryComponent implements OnInit, OnChanges {

  //required
  @Input() invoices: InvoiceDetails[] = [];
  @Input() rolePlayerId: number = null; //cannot log a query without a roleplayerid.

  //optional
  @Input() title: string = "Log a query";

  @Output() logQueryDoneEmit: EventEmitter<boolean> = new EventEmitter();

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  doneGettingReferenceNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  form: any;
  itemQueryCategories: string[];
  itemQueryTypes: string[];
  documentUploadReady: boolean = false;

  documentSystemName = DocumentSystemNameEnum.HcpManagerDocuments;
  documentSet = DocumentSetEnum.HcpDocuments;
  queryReferenceNumber: string;

  constructor(
    private readonly formBuilder: FormBuilder
    , private readonly wizardService: WizardService
    , private readonly alertService: AlertService
    , private readonly rolePlayerQueryService: RolePlayerQueryService
    , private readonly requiredDocumentService: RequiredDocumentService
    , readonly confirmservice: ConfirmationDialogsService
  ) {

  }

  ngOnInit(): void {
    this.generateRolePlayerId();
    this.createForm();
    this.populateLists();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.resetForm();
  }

  generateRolePlayerId(): void {
    this.requiredDocumentService.generateDocumentNumber('QueryReferenceNumber').subscribe(result => {
      this.queryReferenceNumber = result;
      this.doneGettingReferenceNumber$.next(true);
    });
  }

  createForm(): void {
    if (this.form) {
      return;
    }
    this.form = this.formBuilder.group({
      itemQueryType: [{ value: null, disabled: false }],
      itemQueryCategory: [{ value: null, disabled: false }],
      queryDescription: [{ value: null, disabled: false }]
    });
  }

  populateLists(): void {
    this.itemQueryTypes = CommonFunctionUtility.ToArray(RolePlayerItemQueryTypeEnum);
    if (this.form) {
      this.form.patchValue({
        itemQueryType: ''
      });
    }

    this.itemQueryCategories = CommonFunctionUtility.ToArray(RolePlayerItemQueryCategoryEnum);
    if (this.form) {
      this.form.patchValue({
        itemQueryCategory: ''
      });
    }
  }

  resetForm(): void {
    if (this.form) {
      this.form.reset();
      this.form.patchValue({ itemQueryType: '' });
      this.form.patchValue({ itemQueryCategory: '' });
      this.form.clearValidators();
    }
  }

  setFormValidators(): void {
    if (this.form) {
      this.form.get('itemQueryType').setValidators([Validators.required]);
      this.form.get('itemQueryType').updateValueAndValidity();

      this.form.get('itemQueryCategory').setValidators([Validators.required]);
      this.form.get('itemQueryCategory').updateValueAndValidity();

      this.form.get('queryDescription').setValidators([Validators.required, Validators.minLength(10)]);
      this.form.get('queryDescription').updateValueAndValidity();
    }
  }

  formatLookup(value: any): string {
    return CommonFunctionUtility.formatLookup(value);
  }

  onLogQuery(): void {
    this.setFormValidators();
    this.form.updateValueAndValidity();
    if (this.form.valid) {
      this.saveItemQuery();
    }
  }

  busyProcessing(): boolean {
    var logReady = this.isSaving$.value 
      || !this.rolePlayerId 
      || !this.documentUploadReady 
      || !this.doneGettingReferenceNumber$.value;
    return logReady;
  }

  saveItemQuery(): void {
    this.isSaving$.next(true);
    var rolePlayerItemQuery: RolePlayerItemQuery;

    this.rolePlayerQueryService.addRolePlayerItemQuery(this.getItemQuery())
      .subscribe({
        next: result => {
          rolePlayerItemQuery = result;        
          
        },
        error: err => {
          this.isSaving$.next(false);
          this.alertService.error('Failed to log the query...');
        },
        complete: () => {
          this.logQuery(rolePlayerItemQuery);
        }
      });
  }

  getItemQuery(): RolePlayerItemQuery {
    var itemQuery: RolePlayerItemQuery = new RolePlayerItemQuery();
    itemQuery.queryReferenceNumber = this.queryReferenceNumber;
    itemQuery.queryDescription = this.form.get("queryDescription").value;
    itemQuery.rolePlayerId = this.rolePlayerId;
    itemQuery.rolePlayerItemQueryCategory = this.form.get("itemQueryCategory").value;
    itemQuery.rolePlayerItemQueryItems = this.getItemQueryItems();
    itemQuery.rolePlayerItemQueryStatus = RolePlayerItemQueryStatusEnum.Submitted;
    itemQuery.rolePlayerItemQueryType = this.form.get("itemQueryType").value;
    itemQuery.rolePlayerQueryItemType = RolePlayerQueryItemTypeEnum.MedicalInvoice
    return itemQuery;
  }

  getItemQueryItems(): RolePlayerItemQueryItem[] {
    var items: RolePlayerItemQueryItem[] = [];
    this.invoices.forEach(i => {
      var item: RolePlayerItemQueryItem = new RolePlayerItemQueryItem();
      item.itemId = i.invoiceId
      item.rolePlayerItemQueryId = -1; //parent not saved yet
      items.push(item);
    });
    return items;
  }

  logQuery(rolePlayerItemQuery: RolePlayerItemQuery): void {
    var startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = rolePlayerItemQuery.id;
    startWizardRequest.type = 'medical-invoice-query-response';
    startWizardRequest.data = JSON.stringify(rolePlayerItemQuery);
    startWizardRequest.lockedToUser = null;
    this.wizardService.startWizard(startWizardRequest).subscribe({
      next: result => {
        this.confirmservice.confirmWithoutContainer('Query logged successfully!', 
            'Reference Number: ' + rolePlayerItemQuery.queryReferenceNumber, 'Center', 'Center', 'Ok').subscribe(result => {
            });
      },
      error: err => {
        this.isSaving$.next(false);
        this.alertService.error('Failed to send the query for resolution...');
      },
      complete: () => {
        this.isSaving$.next(false);
        this.logQueryDoneEmit.emit(true);
      }
    });
  }

  documentComponentReady($event: boolean): void {
    this.documentUploadReady = $event;
  }
}
