import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Brokerage } from '../../models/brokerage';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BrokerAddressType } from '../../models/enums/broker-addresstype.enum';
import { BrokerageAddress } from '../../models/brokerage-address';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BrokerItemTypeEnum } from '../../models/enums/broker-item-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CountryEnum } from '../../models/enums/country.enum';

@Component({
  selector: 'brokerage-address-list',
  templateUrl: './brokerage-address-list.component.html'
})
export class BrokerageAddressListComponent extends WizardDetailBaseComponent<Brokerage>  {  

  physicalAddressForm: UntypedFormGroup;
  postalAddressForm: UntypedFormGroup;
  physicalAddressFormId: number = 0;
  postalAddressFormId: number = 0;

  constructor(
    appEventsManager: AppEventsManager,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    authService: AuthService,
    public dialog: MatDialog) {
      super(appEventsManager, authService, activatedRoute);
      this.createPhysicalAddressForm();
      this.createPostalAddressForm();
  }

  createForm(id: number): void {
  }

  createPhysicalAddressForm(): void {
    this.physicalAddressForm = this.formBuilder.group({
      id: [''],
      line1: ['', [Validators.required]],
      line2: [''],
      city: ['', [Validators.required]],
      addressType: ['Physical'],
      postalCode: ['', [Validators.required]],
      province: ['']
    });
    this.physicalAddressForm.get('addressType').disable();
  }

  createPostalAddressForm(): void {
    this.postalAddressForm = this.formBuilder.group({
      id: [''],
      countryId: [''],
      line1: ['', [Validators.required]],
      line2: [''],
      city: ['', [Validators.required]],
      addressType: ['Postal'],
      postalCode: ['', [Validators.required]],
      province: ['']
    });
    this.postalAddressForm.get('addressType').disable();
  }

  togglePostalAddressForm() {
   
      this.postalAddressForm.get('line1').enable();
      this.postalAddressForm.get('line2').enable();
      this.postalAddressForm.get('city').enable();
      this.postalAddressForm.get('addressType').enable();
      this.postalAddressForm.get('postalCode').enable();      
      this.postalAddressForm.get('province').enable();
      this.postalAddressForm.reset();    
  }

  onLoadLookups(): void {
  }

  populateModel(): void {

    const physicalAddress = this.readPhysicalAddressForm();
    const postalAddress = this.readPostalAddressForm();

    const physicalAddressIndex = this.model.addresses?.findIndex((a) => a.addressType === BrokerAddressType.Physical);
    const postalAddressIndex = this.model.addresses?.findIndex((a) => a.addressType === BrokerAddressType.Postal);

    if (physicalAddress && physicalAddressIndex > -1)
      {
        this.model.addresses[physicalAddressIndex] = physicalAddress;
      } else if (physicalAddress) {
        this.model.addresses.push(physicalAddress);
      }

    if (postalAddress && postalAddressIndex > -1)
      {
        this.model.addresses[postalAddressIndex] = postalAddress;
      } else if (postalAddress) {
        this.model.addresses.push(postalAddress);
      }
  }

  populateForm(): void {

    if(this.model.addresses === null) {
      this.model.addresses = [];
      return;
    }

    const physicalAddress = this.model.addresses?.find((a) => a.addressType === BrokerAddressType.Physical);
    const postalAddress = this.model.addresses?.find((a) => a.addressType === BrokerAddressType.Postal);

    if(physicalAddress) {
      this.physicalAddressFormId = physicalAddress.id;
      this.physicalAddressForm.patchValue({
        id: physicalAddress.id,
        countryId: physicalAddress.countryId,
        line1: physicalAddress.addressLine1,
        line2: physicalAddress.addressLine2,
        city: physicalAddress.city,
        addressType: this.getType(physicalAddress.addressType),
        postalCode: physicalAddress.postalCode,
        province: physicalAddress.province
      });
    }

    if(postalAddress) {
      this.postalAddressFormId = postalAddress.id;
      this.postalAddressForm.patchValue({
        id: postalAddress.id,
        countryId: postalAddress.countryId,
        line1: postalAddress.addressLine1,
        line2: postalAddress.addressLine2,
        city: postalAddress.city,
        addressType: this.getType(postalAddress.addressType),
        postalCode: postalAddress.postalCode,
        province: postalAddress.province
      });
    }

    this.loadingStop();
  } 

  disable(): void {
    this.isDisabled = true;
    this.physicalAddressForm.disable();
    this.postalAddressForm.disable(); 
  }

  enable(): void {
    this.isDisabled = false;
    this.physicalAddressForm.enable();
    this.postalAddressForm.enable();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    if (this.model.addresses != null && this.model.addresses.length > 0) {
      const physicalAddress = this.model.addresses?.find((a) => a.addressType === BrokerAddressType.Physical);
      const postalAddress = this.model.addresses?.find((a) => a.addressType === BrokerAddressType.Postal);

      if(physicalAddress) {
        if (physicalAddress.addressLine1 === '' || physicalAddress.addressLine1 === null || physicalAddress.addressLine1 === undefined) {
            validationResult.errorMessages.push('Physical Address Line1 is required');
            validationResult.errors = 1;
        }
        if (physicalAddress.city === '' || physicalAddress.city === null || physicalAddress.city === undefined) {
          validationResult.errorMessages.push('Physical Address City is required');
          validationResult.errors += 1;
        }
        if (physicalAddress.postalCode === '' || physicalAddress.postalCode === null || physicalAddress.postalCode === undefined) {
          validationResult.errorMessages.push('Physical Address PostalCode is required');
          validationResult.errors += 1;
        }      
      }

      if(postalAddress) {
        if (postalAddress.addressLine1 === '' || postalAddress.addressLine1 === null || postalAddress.addressLine1 === undefined) {
            validationResult.errorMessages.push('Postal Address Line1 is required');
            validationResult.errors += 1;
        }
        if (postalAddress.city === '' || postalAddress.city === null || postalAddress.city === undefined) {
          validationResult.errorMessages.push('Postal Address City is required');
          validationResult.errors += 1;
        }
        if (postalAddress.postalCode === '' || postalAddress.postalCode === null || postalAddress.postalCode === undefined) {
          validationResult.errorMessages.push('Postal Address PostalCode is required');
          validationResult.errors += 1;
        }      
      }
    }
    return validationResult;
  }

  getType(id: number) {
    const addresstype = BrokerAddressType[id];
    return addresstype;
  }  

  readPhysicalAddressForm() {
    const formModel = this.physicalAddressForm.getRawValue();
    const address = new BrokerageAddress();
    address.id = formModel.id === '' || formModel.id === null || formModel.id === undefined ? 0 : formModel.id as number;
    address.countryId = formModel.countryId === '' || formModel.countryId === null || formModel.countryId === undefined ? CountryEnum.SouthAfrica : formModel.countryId as number;
    address.brokerageId = this.model.id;
    address.addressLine1 = formModel.line1;
    address.addressLine2 = formModel.line2;
    address.city = formModel.city;
    address.postalCode = formModel.postalCode;
    address.province = formModel.province;
    address.addressType = BrokerAddressType.Physical;
    return address;
  }

  readPostalAddressForm() {
    const formModel = this.postalAddressForm.getRawValue();
    const address = new BrokerageAddress();
    address.id = formModel.id === '' || formModel.id === null || formModel.id === undefined ? 0 : formModel.id as number;
    address.countryId = formModel.countryId === '' || formModel.countryId === null || formModel.countryId === undefined ? CountryEnum.SouthAfrica : formModel.countryId as number;
    address.brokerageId = this.model.id;
    address.addressLine1 = formModel.line1;
    address.addressLine2 = formModel.line2;
    address.city = formModel.city;
    address.postalCode = formModel.postalCode;
    address.province = formModel.province;
    address.addressType = BrokerAddressType.Postal;
    return address;
  }

  sameAsPhysicalAddressChange(event: MatCheckboxChange): void {
    const isChecked = event.checked;
    this.physicalAddressForm.markAllAsTouched();

    if (isChecked && this.physicalAddressForm.valid) {
      const physicalAddress = this.readPhysicalAddressForm();
      this.postalAddressForm.patchValue({
        countryId: physicalAddress.countryId,
        line1: physicalAddress.addressLine1,
        line2: physicalAddress.addressLine2,
        city: physicalAddress.city,
        addressType: this.getType(BrokerAddressType.Postal),
        postalCode: physicalAddress.postalCode,
        province: physicalAddress.province
      });
    } else {

      const postalAddress = this.model.addresses?.find((a) => a.addressType === BrokerAddressType.Postal);
      if(postalAddress) {
        this.postalAddressForm.patchValue({
          countryId: postalAddress.countryId,
          line1: postalAddress.addressLine1,
          line2: postalAddress.addressLine2,
          city: postalAddress.city,
          addressType: this.getType(postalAddress.addressType),
          postalCode: postalAddress.postalCode,
          province: postalAddress.province
        });
      } else {
          this.togglePostalAddressForm();
      }
    }
  }

  openAuditDialog(addressId: number) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.BrokerageManager,
        clientItemType: BrokerItemTypeEnum.BrokerageAddress,
        itemId: addressId,
        heading: 'Brokerage Address Details Audit',
        propertiesToDisplay: [ 'Id', 'BrokerageId',	'AddressTypeId', 'AddressLine1', 'AddressLine2',	'PostalCode',	'City',	'Province',	'CountryId',	'IsDeleted',
        	'CreatedBy',	'CreatedDate',	'ModifiedBy',	'ModifiedDate'
        ]
      }
    });
  }
}
