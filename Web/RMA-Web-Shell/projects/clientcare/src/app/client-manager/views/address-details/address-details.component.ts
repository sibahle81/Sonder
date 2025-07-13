import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';

import { AddressService } from '../../shared/services/address.service';
import { BranchService } from '../../shared/services/branch.service';
import { DepartmentService } from '../../shared/services/department.service';

import { Address } from 'projects/clientcare/src/app/client-manager/shared/Entities/address';

import { AddressType } from './address-type.enum';
import { ActionParameters } from 'projects/clientcare/src/app/client-manager/shared/Entities/action-parameters';
import { ActionType } from 'projects/clientcare/src/app/client-manager/shared/Enums/action-type.enum';

import { GroupService } from 'projects/clientcare/src/app/client-manager/shared/services/group.service';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { startWith, map } from 'rxjs/operators';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BreadcrumbClientService } from 'projects/clientcare/src/app/client-manager/shared/services/breadcrumb-client.service';
import { ItemType } from 'projects/clientcare/src/app/client-manager/shared/Enums/item-type.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  templateUrl: './address-details.component.html',
  // tslint:disable-next-line: component-selector
  selector: 'address-details'
})
export class AddressDetailsComponent extends DetailsComponent implements OnInit {
  countries: Lookup[];
  cities: Lookup[];
  stateProvinces: Lookup[];
  filterCitiesData: Observable<Lookup[]>;

  isLoadingCities = false;
  cityName: string;
  currentName: string;
  clientId: string;
  groupId: number;
  addressType: AddressType;
  actionParameters: ActionParameters;
  countryId: number;
  ProvinceId: number;

  constructor(
    alertService: AlertService,
    appEventsManager: AppEventsManager,
    private readonly router: Router,
    private readonly breadcrumbService: BreadcrumbClientService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly addressService: AddressService,
    private readonly branchService: BranchService,
    private readonly departmentService: DepartmentService,
    private readonly lookUpService: LookupService,
    private readonly groupService: GroupService
  ) {
    super(appEventsManager, alertService, router, 'Address', '/client-manager/address-list', 1);
    this.isWizard = false;
    this.getCountries();
    this.getStateProvinces();
    this.checkUserPermissions();
  }

  ngOnInit() {
    this.resetPermissions();

    this.breadcrumbService.setBreadcrumb('Address Details');
    if (this.isWizard) {
      this.createForm();
      return;
    }

    this.activatedRoute.params.subscribe((params: any) => {
      this.clientId = params.linkId;

      switch (params.linkType.toLowerCase()) {
        case 'department':
          this.addressType = AddressType.Department;
          break;
        case 'branch':
          this.addressType = AddressType.Branch;
          break;
        case 'group':
          this.addressType = AddressType.Group;
          this.groupId = params.linkId ? params.linkId : params.id;
          break;
        default:
          break;
      }

      if (params.action === 'add') {
        this.createForm();
        this.actionParameters = new ActionParameters(params.id, ActionType.Add, params.linkId, params.linkType);
      } else if (params.action === 'edit') {
        this.actionParameters = new ActionParameters(params.id, ActionType.Edit, params.linkId, params.linkType);
        this.loadingStart('Loading address details...');
        this.createForm();
        this.getAddress(params.id);
        this.form.disable();
      } else {
        throw new Error(`Incorrect action was specified '${params.action}', expected was: add or edit`);
      }
    });
  }

  checkUserPermissions(): void {
    this.canAdd = userUtility.hasPermission('Add Address');
    this.canEdit = userUtility.hasPermission('Edit Address');
  }

  createForm(): void {
    this.clearDisplayName();
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      id: 0,
      name: new UntypedFormControl(''),
      city: new UntypedFormControl('', [Validators.required]),
      stateProvince: new UntypedFormControl('', [Validators.required]),
      country: new UntypedFormControl('', [Validators.required]),
      addressLine1: new UntypedFormControl('', [Validators.required]),
      addressLine2: new UntypedFormControl(''),
      postalAddress: new UntypedFormControl('', [Validators.required]),
      postalCode: new UntypedFormControl('', [Validators.minLength(4), Validators.maxLength(4), Validators.required]),
      addressPostalCode: new UntypedFormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(4)])
    });
  }

  readForm(): Address {
    const formModel = this.form.value;
    const address = new Address();
    const city = this.getCity(formModel.city);
    if (city != null) {
      address.cityId = city.id;
      address.cityName = city.name;
    }
    address.id = formModel.id as number;
    address.countryId = formModel.country as number;
    address.provinceId = formModel.stateProvince as number;
    address.postalCode = formModel.postalCode as string;
    address.addressPostalCode = formModel.addressPostalCode as string;
    address.addressLine1 = formModel.addressLine1 as string;
    address.addressLine2 = formModel.addressLine2 as string;
    address.postalAddress = formModel.postalAddress as string;
    address.isDeleted = false;
    return address;
  }

  setForm(address: Address) {
    if (!this.form) { this.createForm(); }

    if (address.cityId == null || address.cityId === 0) {
      this.setAddressForm(address);
      return;
    }

    this.isLoadingCities = true;
    this.lookUpService.getCitiesByProvince(address.provinceId).subscribe(cities => {

      this.cities = cities;
      this.form.patchValue({ city: '' });
      this.isLoadingCities = false;

      this.filterCitiesData = this.form.controls.city.valueChanges.pipe(startWith(null),
        map(subValue => subValue ? this.filterCities(subValue) : this.cities.slice()));

      this.setAddressForm(address);
    });

    if (!this.isWizard) { this.form.disable(); }
  }

  setAddressForm(address: Address) {
    const cityName = this.getCityNameFromAddress(address);

    this.form.setValue({
      id: address.id,
      name: address.addressLine1 ? address.addressLine1 : '',
      addressLine1: address.addressLine1 ? address.addressLine1 : '',
      addressLine2: address.addressLine2 ? address.addressLine2 : '',
      postalAddress: address.postalAddress ? address.postalAddress : '',
      postalCode: address.postalCode ? address.postalCode : '',
      addressPostalCode: address.addressPostalCode ? address.addressPostalCode : '',
      country: address.countryId ? address.countryId : null,
      city: cityName ? cityName : '',
      stateProvince: address.provinceId ? address.provinceId : null
    });

    this.loadingStop();
  }

  getCityNameFromAddress(address: Address): string {
    const city = this.getCity(address.cityId);
    if (city != null) {
      return city.name;
    } else if (address.cityName != null && address.cityName !== '') {
      return address.cityName;
    }
    return '';
  }

  getAddress(id: number): void {
    this.addressService.getAddress(id).subscribe(address => {
      this.setForm(address);
      this.getNotes(id, ServiceTypeEnum.ClientManager, 'Address');
      this.getAuditDetails(id, ServiceTypeEnum.ClientManager, ItemType.Address);
    });
  }

  getCountries(): void {
    this.lookUpService.getCountries().subscribe(countries => this.countries = countries);
  }

  getStateProvinces(): void {
    this.lookUpService.getLocations().subscribe(stateProvinces => this.stateProvinces = stateProvinces);
  }

  getCities(): void {
    this.form.controls.location.valueChanges
      .subscribe(value => {
        if (value != null && value !== '') {
          this.loadCities(value);
        }
      });
  }

  locationChanged($event: any): void {
    this.loadCities($event.value);
  }

  loadCities(value: number): void {
    this.isLoadingCities = true;

    this.lookUpService.getCitiesByProvince(value).subscribe(result => {
      this.cities = result;

      this.form.patchValue({ city: '' });

      this.filterCitiesData = this.form.controls.city.valueChanges.pipe(startWith(null),
        map(subValue => subValue ? this.filterCities(subValue) : this.cities.slice()));

      this.isLoadingCities = false;
    });
  }

  filterCities(name: string): Lookup[] {
    return this.cities.filter(city => new RegExp(`^${name}`, 'gi').test(city.name));
  }

  getCity(id: any): Lookup {
    if (this.cities == null) { return null; }

    const result = this.cities.find(city => city.id === id || city.name === id);
    return result;
  }

  getCityName(name: any): Lookup {
    const result = this.cities.find(city => city.name === name);
    return result;
  }

  save(): void {
    if (!this.form.valid) { return; }

    this.form.disable();
    const address = this.readForm();

    this.loadingStart(`Saving ${address.addressLine1}...`);
    if (this.actionParameters.actionType === ActionType.Add) {
      this.addAddress(address);
    } else {
      this.editAddress(address);
    }
  }

  addAddress(address: Address): void {
    this.addressService.addAddress(address).subscribe(addressId => {

      switch (this.addressType) {
        case AddressType.Branch:
          this.branchService.editBranchAddress(this.actionParameters.id, addressId).subscribe(() => this.done());
          break;
        case AddressType.Group:
          this.groupService.getGroup(this.actionParameters.id).subscribe(group => {
            if (group) {
              group.addressId = addressId;
              this.groupService.editGroup(group).subscribe(() => this.done());
            }
          });
          break;
        case AddressType.Department:
          this.departmentService.editDepartmentAddress(this.actionParameters.id, addressId)
            .subscribe(() => this.done());
          break;
        default:
          break;
      }
    });
  }

  editAddress(address: Address): void {
    this.addressService.editAddress(address).subscribe(() => this.done());
  }

  back(): void {
    switch (this.addressType) {
      case AddressType.Group:
        this.router.navigate([`clientcare/client-manager/group-details/${this.groupId}`]);
        break;
      default:
        this.router.navigate([`clientcare/client-manager/client-details/${this.actionParameters.linkId}/1`]);
        break;
    }
  }
}
