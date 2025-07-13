import { Component, OnInit } from "@angular/core";
import { WizardDetailBaseComponent } from "projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component";
import { Brokerage } from "../../models/brokerage";
import { ValidationResult } from "projects/shared-components-lib/src/lib/wizard/shared/models/validation-result";
import { AppEventsManager } from "projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import { AuthService } from "projects/shared-services-lib/src/lib/services/security/auth/auth.service";
import { ActivatedRoute } from "@angular/router";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { Validators } from "ngx-editor";
import { ProductOptionConfiguration } from "../../models/product-option-configuration";
import { OrganisationOptionItemValue } from "../../models/organisation-option-item-value";
import { Lookup } from "projects/shared-models-lib/src/lib/lookup/lookup";
import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { MatDialog } from "@angular/material/dialog";
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BrokerItemTypeEnum } from '../../models/enums/broker-item-type.enum';
import { BrokerageService } from "../../services/brokerage.service";

@Component({
    selector: 'product-option-configuration',
    templateUrl: './product-option-configuration.component.html',
    styleUrls: ['./product-option-configuration.component.css']
})
export class ProductOptionConfigurationComponent extends WizardDetailBaseComponent<Brokerage> {
    
    optionTypeForm: UntypedFormGroup;
    optionTypes: Lookup[];
    selectedProductOptionTypeId: number = -1;
    dataSource: ProductOptionConfiguration[] = [];
    organisationOptionItemValues: OrganisationOptionItemValue[] = [];
    isDataSourceLoading = false;
    loadingOptionTypes = false;
    filteredProductOptionConfigurationIdsByOptionTypeId: number[] = [];
    selectedProductOptionConfigurationItem: ProductOptionConfiguration;
    selectedProductOptionOptionItemValueIds: number[] = [];
    selectedBenefitOptionItemValueIds: number[] = [];

    constructor(
        appEventsManager: AppEventsManager,
        authService: AuthService,
        activatedRoute: ActivatedRoute,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly lookupService: LookupService,
        private readonly brokerageService: BrokerageService,
        public dialog: MatDialog
    ) {
        super(appEventsManager, authService, activatedRoute);
        this.createOptionTypeForm();
    }

    createForm(id: number): void {
        this.form = this.formBuilder.group({
            id: [id]
        });
    }

    createOptionTypeForm(): void {
        this.optionTypeForm = this.formBuilder.group({
            optionType: [''],
            effectiveDate: ['', [Validators.required]],
            newEffectiveDate: ['']
        });
    }

    onLoadLookups(): void {
    }

    populateModel(): void {
        this.model.organisationOptionItemValues = this.organisationOptionItemValues;
    }

    populateForm(): void {

        if (this.model.organisationOptionItemValues) {        
            this.organisationOptionItemValues = this.model.organisationOptionItemValues;

            // load configured product/benefit options
            this.loadCurrentSelectedProductOptionConfigurations();
        }

        this.getOptionTypes();
    }

    disable(): void {
        this.isDisabled = true;
        this.form.disable();
        this.optionTypeForm.disable();
    }
    
    enable(): void {
        this.isDisabled = false;
        this.form.enable();
        this.optionTypeForm.enable();
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {

        return validationResult;
    }

    setSelectedProductOptionOptionItemValueIds() {
        this.selectedProductOptionOptionItemValueIds = [];
        const activeOrganisationOptionItemValues = this.organisationOptionItemValues.filter(x => x.isDeleted === false && x.productOptionOptionItemValueId !== null);        
        activeOrganisationOptionItemValues?.forEach(x => { this.selectedProductOptionOptionItemValueIds.push(x.productOptionOptionItemValueId); });
    }

    setSelectedBenfitOptionItemValueIds() {
        this.selectedBenefitOptionItemValueIds = [];
        const activeOrganisationOptionItemValues = this.organisationOptionItemValues.filter(x => x.isDeleted === false && x.benefitOptionItemValueId !== null);
        activeOrganisationOptionItemValues?.forEach(x => { this.selectedBenefitOptionItemValueIds.push(x.benefitOptionItemValueId); }); 
    }

    setProductOptionConfiguration(productOptionItem: ProductOptionConfiguration) {
        if (!productOptionItem) {
            return;
        }

        productOptionItem.organisation = this.model.name;

        if (productOptionItem.organisationOptionItemValue === null || productOptionItem.organisationOptionItemValue === undefined) {
            const organisationOptionItem = new OrganisationOptionItemValue ();
            organisationOptionItem.organisationOptionItemValueId = 0;

            organisationOptionItem.benefitOptionItemValueId = productOptionItem.benefitOptionItemValueId;
	        organisationOptionItem.productOptionOptionItemValueId = productOptionItem.productOptionOptionItemValueId;

	        organisationOptionItem.brokerageId = this.model.id;
	        organisationOptionItem.isExtended = false;
	        organisationOptionItem.isDeleted = false;
            
            productOptionItem.organisationOptionItemValue = organisationOptionItem;
        }
    }

    getOptionTypes(): void {
        const brokerageType = BrokerItemTypeEnum[this.model.brokerageType];
        const effectiveDate = this.model.startDate === null || this.model.startDate === undefined ? new Date() : new Date(this.model.startDate);
        this.lookupService.getOptionTypes(brokerageType, effectiveDate).subscribe(
          data => {
            this.optionTypes = data;
          }
        );
    }

    loadCurrentSelectedProductOptionConfigurations() {
        const brokerageId = this.model.id;
        const effectiveDate = new Date();
        this.dataSource = [];
        this.brokerageService.getProductOptionConfigurationsByBrokerageId(brokerageId, effectiveDate)
        .subscribe(result => {
            if (result) {
                
                this.setSelectedProductOptionOptionItemValueIds();
                this.setSelectedBenfitOptionItemValueIds();

                // process result

                this.processResultDataForProductOptionOptionItemValues(result);
                this.processResultDataForBenefitOptionItemValues(result);

                result.forEach(x => {
                    this.setProductOptionConfiguration(x);
                });

                this.dataSource = result;    
            }
        });
    }

    loadProductOptionConfigurations(optionTypeId: number) {
        const brokerageId = this.model.id;
        const effectiveDate = new Date();
        this.dataSource = [];
        this.brokerageService.getProductOptionConfigurationsByOptionTypeId(optionTypeId, brokerageId, effectiveDate)
        .subscribe(result => {
            if (result) {
                
                this.setSelectedProductOptionOptionItemValueIds();
                this.setSelectedBenfitOptionItemValueIds();

                // process result

                this.processResultDataForProductOptionOptionItemValues(result);
                this.processResultDataForBenefitOptionItemValues(result);

                result.forEach(x => {
                    this.setProductOptionConfiguration(x);
                });

                this.dataSource = result;    
            }
        });
    }

    processResultDataForProductOptionOptionItemValues(result: ProductOptionConfiguration[]) {
        this.selectedProductOptionOptionItemValueIds.forEach(selectedId => {
            const selectedProductOptionItem = result.find(item => item.productOptionOptionItemValueId === selectedId);

            if (selectedProductOptionItem) {
                selectedProductOptionItem.isProductOptionDisabled = false;
                selectedProductOptionItem.isProductOptionSelected = true;

                this.setMatCheckboxActionStatusForProductOptionOptionItemValue(selectedProductOptionItem, result);
            }                    
        });
    }

    processResultDataForBenefitOptionItemValues(result: ProductOptionConfiguration[]) {
        this.selectedBenefitOptionItemValueIds.forEach(selectedId => {
            const selectedBenefitOptionItem = result.find(item => item.benefitOptionItemValueId === selectedId);

            if (selectedBenefitOptionItem) {
                selectedBenefitOptionItem.isProductOptionDisabled = false;
                selectedBenefitOptionItem.isProductOptionSelected = true;

                this.setMatCheckboxActionStatusForBenefitOptionItemValue(selectedBenefitOptionItem, result);
            }                    
        });
    }

    onOptionTypeSelectionChange($event: any ) {
        this.selectedProductOptionTypeId = $event.value;        
        this.loadProductOptionConfigurations(this.selectedProductOptionTypeId);
    }

    selectedProductOption($event: any, productOptionItem: ProductOptionConfiguration) {
        this.selectedProductOptionConfigurationItem = productOptionItem;
        
        // product option
        if ($event.checked && productOptionItem.productOptionOptionItemValueId !== null){            
            this.productOptionOptionTypeSelected(productOptionItem);
        } else if (productOptionItem.productOptionOptionItemValueId !== null) {
            // product option
            this.productOptionOptionTypeUnselected(productOptionItem);
        }

        // benefit option
        if ($event.checked && productOptionItem.benefitOptionItemValueId !== null){ 
            this.benefitOptionOptionTypeSelected(productOptionItem);
        } else if (productOptionItem.benefitOptionItemValueId !== null){
            // benefit option
            this.benefitOptionOptionTypeUnselected(productOptionItem);
        }
    }

    setMatCheckboxActionStatusForProductOptionOptionItemValue(productOptionItem: ProductOptionConfiguration, productOptionConfigurationsDataSource: ProductOptionConfiguration[]) {
        
        productOptionConfigurationsDataSource.forEach(item => {
            //check for the same productOption with same optionType but different optionItem
            if (item.productOptionOptionItemValueId !== productOptionItem.productOptionOptionItemValueId && item.productOptionId === productOptionItem.productOptionId &&
                item.optionTypeId === productOptionItem.optionTypeId) {
                
                    item.isProductOptionDisabled = true;
                    item.isProductOptionSelected = false;
            }
        });
    }

    setMatCheckboxActionStatusForBenefitOptionItemValue(productOptionItem: ProductOptionConfiguration, productOptionConfigurationsDataSource: ProductOptionConfiguration[]) {
        
        productOptionConfigurationsDataSource.forEach(item => {
            //check for the same benefitOption with same optionType but different optionItem            
            if (item.benefitOptionItemValueId !== productOptionItem.benefitOptionItemValueId && item.benefitId === productOptionItem.benefitId &&
                item.optionTypeId === productOptionItem.optionTypeId) {
                
                    item.isProductOptionDisabled = true;
                    item.isProductOptionSelected = false;
            }
        });
    }

    // disable and set as deleted
    productOptionOptionTypeSelected(productOptionItem: ProductOptionConfiguration) { 
        const productOptionConfigurationsDataSource = this.dataSource;

        productOptionConfigurationsDataSource.forEach(item => {
            //check for the same productOption with same optionType but different optionItem
            if (item.productOptionOptionItemValueId !== productOptionItem.productOptionOptionItemValueId && item.productOptionId === productOptionItem.productOptionId &&
                item.optionTypeId === productOptionItem.optionTypeId) {
                
                    item.isProductOptionDisabled = true;
                    item.isProductOptionSelected = false;

                    // only one productOption same optionType different optionItem can be active
                    if(item.organisationOptionItemValue && item.organisationOptionItemValue.organisationOptionItemValueId > 0)
                    {
                        item.organisationOptionItemValue.isDeleted = true;
                    }

                    const existingOrganisationOptionItemValueIndex = this.organisationOptionItemValues.findIndex(x => 
                        item.productOptionOptionItemValueId !== null &&
                        x.productOptionOptionItemValueId === item.productOptionOptionItemValueId);
           
                   if (existingOrganisationOptionItemValueIndex > -1 && this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].organisationOptionItemValueId > 0) {
                        this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].isDeleted = true;
                   }

                   // remove new item
                   if (existingOrganisationOptionItemValueIndex > -1 && this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].organisationOptionItemValueId === 0) {
                        this.organisationOptionItemValues.splice(existingOrganisationOptionItemValueIndex, 1);
                   }
            }
        });
        
        const existingOrganisationOptionItemValueIndex = this.organisationOptionItemValues.findIndex(x => 
             productOptionItem.productOptionOptionItemValueId !== null &&
             x.productOptionOptionItemValueId === productOptionItem.productOptionOptionItemValueId);
            
        // update
        if (existingOrganisationOptionItemValueIndex > -1 && 
            this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].organisationOptionItemValueId > 0) {
            this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].isDeleted = false;
        }             

        this.addOrganisationOptionItemValues(productOptionItem, existingOrganisationOptionItemValueIndex);
        
        this.dataSource = productOptionConfigurationsDataSource;
    }

    // disable and set as deleted
    benefitOptionOptionTypeSelected(productOptionItem: ProductOptionConfiguration) { 
        const productOptionConfigurationsDataSource = this.dataSource;

        productOptionConfigurationsDataSource.forEach(item => {
            //check for the same benefitOption with same optionType but different optionItem            
            if (item.benefitOptionItemValueId !== productOptionItem.benefitOptionItemValueId && item.benefitId === productOptionItem.benefitId &&
                item.optionTypeId === productOptionItem.optionTypeId) {        
                    
                    item.isProductOptionDisabled = true;
                    item.isProductOptionSelected = false;

                    // only one productOption same optionType different optionItem can be active
                    if(item.organisationOptionItemValue && item.organisationOptionItemValue.organisationOptionItemValueId > 0)
                    {
                        item.organisationOptionItemValue.isDeleted = true;
                    }

                    const existingOrganisationOptionItemValueIndex = this.organisationOptionItemValues.findIndex(x => 
                        item.benefitOptionItemValueId !== null &&
                        x.benefitOptionItemValueId === item.benefitOptionItemValueId);
           
                   if (existingOrganisationOptionItemValueIndex > -1 && this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].organisationOptionItemValueId > 0) {
                        this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].isDeleted = true;
                   }

                   // remove new item
                   if (existingOrganisationOptionItemValueIndex > -1 && this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].organisationOptionItemValueId === 0) {
                        this.organisationOptionItemValues.splice(existingOrganisationOptionItemValueIndex, 1);
                   }
            }
        });
        
        const existingOrganisationOptionItemValueIndex = this.organisationOptionItemValues.findIndex(x => 
            productOptionItem.benefitOptionItemValueId !== null &&
             x.benefitOptionItemValueId === productOptionItem.benefitOptionItemValueId);
            
        // update
        if (existingOrganisationOptionItemValueIndex > -1 && 
            this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].organisationOptionItemValueId > 0) {
            this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].isDeleted = false;
        }             

        this.addOrganisationOptionItemValues(productOptionItem, existingOrganisationOptionItemValueIndex);
        
        this.dataSource = productOptionConfigurationsDataSource;
    }

    addOrganisationOptionItemValues(productOptionItem: ProductOptionConfiguration, existingOrganisationOptionItemValueIndex: number) {
        if (existingOrganisationOptionItemValueIndex === -1) {
            const formModel = this.optionTypeForm.getRawValue();
            productOptionItem.organisationOptionItemValue.effectiveDate = formModel.effectiveDate === '' || formModel.effectiveDate === null || formModel.effectiveDate === undefined ? new Date() :formModel.effectiveDate;

            this.organisationOptionItemValues.push(productOptionItem.organisationOptionItemValue);
        }
    }

    productOptionOptionTypeUnselected(productOptionItem: ProductOptionConfiguration) {
        const productOptionConfigurationsDataSource = this.dataSource;

        productOptionConfigurationsDataSource.forEach(item => {
            //check for the same productOption with same optionType but different optionItem, including selected productOptionItem
            if (item.productOptionId === productOptionItem.productOptionId && item.optionTypeId === productOptionItem.optionTypeId) {
                item.isProductOptionDisabled = false;
                item.isProductOptionSelected = false;

                if (item.organisationOptionItemValue && item.organisationOptionItemValue.organisationOptionItemValueId > 0) {
                        item.organisationOptionItemValue.isDeleted = false;
                }

                const existingOrganisationOptionItemValueIndex = this.organisationOptionItemValues.findIndex(x => 
                    productOptionItem.productOptionOptionItemValueId !== null &&
                    x.productOptionOptionItemValueId === item.productOptionOptionItemValueId);
           
                if (existingOrganisationOptionItemValueIndex > -1 && this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].organisationOptionItemValueId > 0) {

                    const selectedProductOptionOptionItemValueIdIndex = this.selectedProductOptionOptionItemValueIds.findIndex(x => 
                        x === this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].productOptionOptionItemValueId);

                    if (selectedProductOptionOptionItemValueIdIndex > -1) {
                        this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].isDeleted = false;
                    }                     
                }
            }
        });

        // remove
        const existingOrganisationOptionItemValueIndex = this.organisationOptionItemValues.findIndex(x => 
            productOptionItem.productOptionOptionItemValueId !== null &&
            x.productOptionOptionItemValueId === productOptionItem.productOptionOptionItemValueId);

        if (existingOrganisationOptionItemValueIndex > -1 && 
            this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].organisationOptionItemValueId === 0) {
                this.organisationOptionItemValues.splice(existingOrganisationOptionItemValueIndex, 1);
        }

        this.dataSource = productOptionConfigurationsDataSource;
    }

    benefitOptionOptionTypeUnselected(productOptionItem: ProductOptionConfiguration) {
        const productOptionConfigurationsDataSource = this.dataSource;

        productOptionConfigurationsDataSource.forEach(item => {
            //check for the same benefitOption with same optionType but different optionItem, including selected productOptionItem
            if (item.benefitId === productOptionItem.benefitId && item.optionTypeId === productOptionItem.optionTypeId) {
                item.isProductOptionDisabled = false;
                item.isProductOptionSelected = false;

                if (item.organisationOptionItemValue && item.organisationOptionItemValue.organisationOptionItemValueId > 0) {
                        item.organisationOptionItemValue.isDeleted = false;
                }

                const existingOrganisationOptionItemValueIndex = this.organisationOptionItemValues.findIndex(x => 
                    item.benefitOptionItemValueId !== null &&
                    x.benefitOptionItemValueId === item.benefitOptionItemValueId);
           
                if (existingOrganisationOptionItemValueIndex > -1 && this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].organisationOptionItemValueId > 0) {

                    const selectedBenefitOptionOptionItemValueIdIndex = this.selectedBenefitOptionItemValueIds.findIndex(x => 
                        x === this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].benefitOptionItemValueId);

                    if (selectedBenefitOptionOptionItemValueIdIndex > -1) {
                        this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].isDeleted = false;
                    }                     
                }
            }
        });

        // remove
        const existingOrganisationOptionItemValueIndex = this.organisationOptionItemValues.findIndex(x => 
            productOptionItem.benefitOptionItemValueId !== null &&
            x.benefitOptionItemValueId === productOptionItem.benefitOptionItemValueId);

        if (existingOrganisationOptionItemValueIndex > -1 && 
            this.organisationOptionItemValues[existingOrganisationOptionItemValueIndex].organisationOptionItemValueId === 0) {
                this.organisationOptionItemValues.splice(existingOrganisationOptionItemValueIndex, 1);
        }

        this.dataSource = productOptionConfigurationsDataSource;
    }

    getDisplayedColumns(): string[] {
        const columnDefinitions = [
          { display: 'Organisation', def: 'organisation', show: true },
          { display: 'Product Option', def: 'productOptionName', show: true },
          { display: 'Product Benefit', def: 'productBenefit', show: true},
          { display: 'Option Type', def: 'optionTypeName', show: true},
          { display: 'Item Name', def: 'optionItemName', show: true },
          { display: 'Item Value', def: 'productOptionOptionValue', show: true },
          { display: 'Override Value', def: 'overrideValue', show: true },
          { display: 'Actions', def: 'actions', show: true }
        ];
    
        return columnDefinitions
          .filter(cd => cd.show)
          .map(cd => cd.def);
    } 

    openAuditDialog(productOption: ProductOptionConfiguration) {
        const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
          width: '70%',
          data: {
            serviceType: ServiceTypeEnum.BrokerageManager,
            clientItemType: BrokerItemTypeEnum.OrganisationOptionItemValue,
            itemId: productOption.organisationOptionItemValue.organisationOptionItemValueId,
            heading: 'Brokerage Organisation OptionItemValue Details Audit',
            propertiesToDisplay: [ 'OrganisationOptionItemValueId', 'BenefitOptionItemValueId', 'ProductOptionOptionItemValueId',
                 'BrokerageId', 'RolePlayerId', 'EffectiveDate', 'Value', 'IsExtended', 'IsDeleted', 'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate']
          }
        });
    }
}
