import { RolePlayerAddress } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-address';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { AddressTypeEnum } from 'projects/shared-models-lib/src/lib/enums/address-type-enum';

@Component({
  selector: 'member-address',
  templateUrl: './member-address.component.html',
  styleUrls: ['./member-address.component.css']
})
export class MemberAddressComponent implements OnInit, OnChanges {

  @Input() member: RolePlayer = new RolePlayer();
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: UntypedFormGroup;

  address: RolePlayerAddress;
  addresses: RolePlayerAddress[] = [];
  hideForm = true;
  currentUser: string;

  selectedCountry: Lookup;
  addressTypes: Lookup[];
  provinces: Lookup[];
  countries: Lookup[];
  cities: Lookup[];

  requiredPermission = 'Manage Member';
  hasPermission: boolean;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly memberService: MemberService,
    private readonly alert: ToastrManager,
  ) { this.getLookups(); }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
    this.createForm();
    if (this.member.rolePlayerAddresses) {
      this.addresses = this.member.rolePlayerAddresses;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.addresses = this.member.rolePlayerAddresses;
  }

  createForm() {
    this.form = this.formBuilder.group({
      id: new UntypedFormControl(0),
      addressType: [{ value: null, disabled: !this.hasPermission || this.isReadOnly }, Validators.required],
      addressLine1: [{ value: null, disabled: !this.hasPermission || this.isReadOnly }, Validators.required],
      addressLine2: [{ value: null, disabled: !this.hasPermission || this.isReadOnly }],
      postalCode: [{ value: null, disabled: !this.hasPermission || this.isReadOnly }, Validators.required],
      city: [{ value: null, disabled: !this.hasPermission || this.isReadOnly }],
      province: [{ value: null, disabled: !this.hasPermission || this.isReadOnly }],
      country: [{ value: null, disabled: !this.hasPermission || this.isReadOnly }],
    });
  }

  getLookups() {
    this.getAddressTypes();
  }

  readForm() {
    this.address = this.address ? this.address : new RolePlayerAddress();
    this.address.rolePlayerAddressId = this.form.controls.id.value ? this.form.controls.id.value : 0;
    this.address.addressType = this.form.controls.addressType.value;
    this.address.addressLine1 = this.form.controls.addressLine1.value;
    this.address.addressLine2 = this.form.controls.addressLine2.value ? this.form.controls.addressLine2.value : '';
    this.address.postalCode = this.form.controls.postalCode.value;
    this.address.countryId = this.form.controls.country.value;
    this.address.province = this.form.controls.province.value;
    this.address.city = this.form.controls.city.value;
    this.address.effectiveDate = new Date();
  }

  patchForm() {
    if (this.address) {
      this.form.patchValue({
        id: this.address.rolePlayerAddressId ? this.address.rolePlayerAddressId : 0,
        addressType: this.address.addressType,
        addressLine1: this.address.addressLine1,
        addressLine2: this.address.addressLine2,
        postalCode: this.address.postalCode,
        city: this.address.city,
        province: this.address.province,
        country: this.address.countryId
      });
    }
  }

  getAddressTypes(): void {
    this.lookupService.getAddressTypes().subscribe(data => {
      this.addressTypes = data;
      this.getCountries();
    });
  }

  getAddressType(addressType: AddressTypeEnum): string {
    if (this.addressTypes && this.addressTypes.length > 0) {
      const _addressType = this.addressTypes.find(s => s.id === addressType);
      return _addressType.name;
    }
  }

  getCountries(): void {
    this.lookupService.getCountries().subscribe(data => {
      this.countries = data;
      if (this.countries.length === 1) {
        this.selectedCountry = this.countries[0];
        this.form.patchValue({
          country: this.selectedCountry.id
        });
        this.disableFormControl('country');
      }
      this.getProvinces();
    });
  }

  getProvinces(): void {
    this.lookupService.getStateProvinces().subscribe(data => {
      this.provinces = data;
      if (this.provinces.length === 1) {
        this.form.patchValue({
          province: this.provinces[0]
        });
        this.disableFormControl('province');
      }
      this.getCities();
    });
  }

  getCities(): void {
    this.lookupService.getCities().subscribe(data => {
      this.cities = data;
      if (this.cities.length === 1) {
        this.form.patchValue({
          city: this.cities[0]
        });
        this.disableFormControl('city');
      }
      this.isLoading$.next(false);
    });
  }

  toggleAddress(address: RolePlayerAddress) {
    this.address = address;
    this.patchForm();
    this.hideForm = !this.hideForm;
  }

  disableForm() {
    this.disableFormControl('addressType');
    this.disableFormControl('addressLine1');
    this.disableFormControl('addressLine2');
    this.disableFormControl('postalCode');
    this.disableFormControl('city');
    this.disableFormControl('province');
    this.disableFormControl('country');
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  toggle() {
    this.hideForm = !this.hideForm;
  }

  getCountryName(id: number): string {
    if (this.countries && this.countries.length > 0) {
      return this.countries.find(s => s.id === id).name;
    }
  }

  add() {
    this.toggle();
    this.readForm();

    if (this.address.rolePlayerAddressId <= 0) {
      if (!this.addresses) { this.addresses = []; }
      if ((!(this.address.rolePlayerAddressId) || this.address.rolePlayerAddressId <= 0) && this.isWizard) {
        const index = this.addresses.findIndex(s => s.rolePlayerAddressId === this.address.rolePlayerAddressId);
        if (index > -1) {
          this.addresses[index] = this.address;
        } else {
          this.addresses.push(this.address);
        }
      } else {
        this.addresses.push(this.address);
      }
    } else {
      const index = this.addresses.findIndex(s => s.rolePlayerAddressId === this.address.rolePlayerAddressId);
      this.addresses[index] = this.address;
    }

    this.member.rolePlayerAddresses = this.addresses;
    this.save();
  }

  save() {
    if (!this.isWizard) {
      this.isLoading$.next(true);
      this.memberService.updateMember(this.member).subscribe(result => {
        if (result) {
          this.alert.successToastr('Address updated successfully...');
        } else {
          this.alert.successToastr('Address update failed...');
        }
        this.isLoading$.next(false);
      });
    }
    this.reset();
  }

  delete(address: RolePlayerAddress) {
    const index = this.addresses.findIndex(s => s === address);
    this.addresses.splice(index, 1);
  }

  cancel() {
    this.toggle();
    this.reset();
  }

  reset() {
    this.address = new RolePlayerAddress();

    this.form.controls.id.reset();
    this.form.controls.addressType.reset();
    this.form.controls.addressLine1.reset();
    this.form.controls.addressLine2.reset();
    this.form.controls.postalCode.reset();
    this.form.controls.province.reset();
    this.form.controls.city.reset();
  }

  view() {
    this.reset();
  }
}
