import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AddressTypeEnum } from 'projects/shared-models-lib/src/lib/enums/address-type-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { UserAddress } from 'projects/admin/src/app/user-manager/views/member-portal/user-address.model';
import { UserRegistrationDetails } from 'projects/admin/src/app/user-manager/views/member-portal/user-registration-details.model';

@Component({
  selector: 'app-user-address-member-portal',
  templateUrl: './user-address-member-portal.component.html',
  styleUrls: ['./user-address-member-portal.component.css']
})
export class UserAddressMemberPortalComponent extends WizardDetailBaseComponent<UserRegistrationDetails> {

  dateOfBirth: Date;
  form: UntypedFormGroup;
  hasPermission: boolean;
  countryId: number;
  countries: Lookup[];
  provinces: Lookup[];
  province: Lookup;
  cityId: number;
  provinceId: number;
  addressType: number;
  requiredPermission = 'Approve Member Portal User';

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private readonly lookupService: LookupService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
    this.onLoadLookups();
  }

  createForm(id: number): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      addressType: [''],
      addr1: [''],
      addr2: [''],
      addr3: [''],
      postalCode: [''],
      city: [''],
      province: [''],
      country: [''],
    });
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
    const value = this.form.value;
    this.model.userAddress.addressType = this.addressType;
    this.model.userAddress.address1 = value.addr1;
    this.model.userAddress.address2 = value.addr2;
    this.model.userAddress.address3 = value.addr3;
    this.model.userAddress.postalCode = value.postalCode;
    this.model.userAddress.city = this.cityId.toString();
    this.model.userAddress.province = this.provinceId.toString();
    this.model.userAddress.countryId = this.countryId;
  }

  populateForm(): void {
    const address = this.model.userAddress;
    this.countryId = address.countryId;
    this.getCountries(address);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }

  getCountries(address: UserAddress) {
    this.getProvinces(address);
    this.lookupService.getCountries().subscribe(countries => {
      if (countries) {
        this.cityId = Number(address.city);
        if (this.cityId) {
          this.getCityById(this.cityId);
        } else {
          this.form.patchValue({
            city: address.city
          });
        }
        this.provinceId = Number(address.province);
        const country = countries.find(c => c.id === address.countryId);
        this.addressType = address.addressType;

        this.form.patchValue({
          addressType: AddressTypeEnum[address.addressType],
          addr1: address.address1,
          addr2: address.address2,
          addr3: address.address3,
          postalCode: address.postalCode,
          city: address.city,
          country: country.name,
        });
        this.form.disable();
      }
    });
  }

  getProvinces(address: UserAddress) {
    this.lookupService.getStateProvinces().subscribe(provinces => {
      if (provinces) {
        this.province = provinces.find(p => p.id === Number(address.province));
        this.form.patchValue({
          province: this.province.name
        });
      }
      this.provinces = provinces;
    });
  }

  getCityById(cityId: number) {
    this.lookupService.getCityById(cityId).subscribe(result => {
      if (result) {
        this.form.patchValue({
          city: result.name
        });
      }
    });
  }
}
