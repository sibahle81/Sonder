import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { RolePlayerAddressDetailDataSource } from './role-player-address-detail.datasource';
import { RolePlayerAddress } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-address';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AddressTypeEnum } from 'projects/shared-models-lib/src/lib/enums/address-type-enum';
import { MatDialog } from '@angular/material/dialog';
import { ValidateMinDateToday } from 'projects/shared-utilities-lib/src/lib/validators/min-date-today.validator';
import { CityRetrieval } from 'projects/shared-models-lib/src/lib/common/city-retrieval.model';
import 'src/app/shared/extensions/array.extensions';
import { AddressService } from 'projects/shared-services-lib/src/lib/services/address/address.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-role-player-address-detail',
  templateUrl: './role-player-address-detail.component.html',
  styleUrls: ['./role-player-address-detail.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class RolePlayerAddressDetailComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Input() public isWizard: boolean;

  @Input() set selectedAddressDetails(rolePlayerAddesses: RolePlayerAddress[]) {
    if (rolePlayerAddesses && rolePlayerAddesses.length > 0) {
      this.rolePlayerId = rolePlayerAddesses[0].rolePlayerId;
      this.createForm();
      this.setViewData(rolePlayerAddesses);
    } else {
      this.createForm();
    }
  }

  streetAddressForm: UntypedFormGroup;
  postalAddressForm: UntypedFormGroup;
  postalSame = false;
  activeSection = 'showAddresses';
  addressTypes: Lookup[];
  countries: Lookup[];
  rolePlayerId = 0;
  rolePlayerAddresses: RolePlayerAddress[] = [];
  isDisabled = true;

  showCitySearch: boolean;
  tipe: string;

  subscription: Subscription;

  get isLoading(): boolean {
    if (!this.dataSource) { return false; }
    return this.dataSource.isLoading;
  }

  get noAddresses(): boolean {
    if (this.isLoading) { return true; }
    if (!this.dataSource.data) { return true; }
    return this.dataSource.data.length === 0;
  }

  get hasAddresses(): boolean {
    if (this.isLoading) { return false; }
    if (!this.dataSource || !this.dataSource.data) { return false; }
    return this.dataSource.data.length > 0;
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    public readonly dataSource: RolePlayerAddressDetailDataSource,
    public dialog: MatDialog,
    private readonly addressService: AddressService,
    private readonly alertService: AlertService,
  ) { }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.dataSource.clearData();
    this.dataSource.setControls(this.paginator, this.sort);
    this.createForm();
    this.getAddressTypes();
    this.getCountries();
    if (this.rolePlayerAddresses && this.rolePlayerAddresses.length > 0) {
      this.createForm();
    } else {
      this.createForm();
    }
  }

  getData(): void {
    if (this.rolePlayerAddresses) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeAddresses = this.rolePlayerAddresses.filter(address => (new Date(address.effectiveDate)).getTime() <= today.getTime());
      const maxDate = Math.max.apply(Math, activeAddresses.map(address => (new Date(address.effectiveDate)).getTime()));
      this.rolePlayerAddresses.forEach(address => {
        if ((new Date(address.effectiveDate)).getTime() > today.getTime()) {
          address.active = false;
        } else {
          address.active = new Date(address.effectiveDate).getTime() === maxDate;
        }
      });
      this.dataSource.getData(this.rolePlayerAddresses);
    }
  }

  getAddressTypes(): void {
    this.lookupService.getAddressTypes().subscribe(
      data => {
        this.addressTypes = data;
      }
    );
  }

  getCountries(): void {
    this.lookupService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    );
  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'Active', def: 'active', show: true },
      { display: 'Type', def: 'addressType', show: true },
      { display: 'Line 1', def: 'addressLine1', show: true },
      { display: 'Line 2', def: 'addressLine2', show: true },
      { display: 'City', def: 'city', show: true },
      { display: 'Province', def: 'province', show: true },
      { display: 'Postal Code', def: 'postalCode', show: true },
      { display: 'Effective Date', def: 'effectiveDate', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  showSection(section: string) {
    this.activeSection = section;
  }

  createForm(): void {
    // this.rolePlayerId = id;

    this.streetAddressForm = this.formBuilder.group({
      rolePlayerId: this.rolePlayerId,
      line1: ['', [Validators.required]],
      line2: [''],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.maxLength(4)]],
      province: [''],
      effectiveDate: ['', ValidateMinDateToday]
    });

    this.postalAddressForm = this.formBuilder.group({
      rolePlayerId: this.rolePlayerId,
      line1: ['', [Validators.required]],
      line2: [''],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.maxLength(4)]],
      province: [''],
      effectiveDate: ['', ValidateMinDateToday]
    });

    this.enable();
  }

  setPostalAddress(checked: any) {
    if (checked) {
      this.postalAddressForm.disable();
      const physicalModel = this.streetAddressForm.getRawValue();
      this.postalAddressForm.patchValue({
        line1: physicalModel.line1,
        line2: physicalModel.line2,
        city: physicalModel.city,
        province: physicalModel.province,
        postalCode: physicalModel.postalCode,
        effectiveDate: physicalModel.effectiveDate
      });
    } else {
      this.postalAddressForm.enable();
    }
    this.postalAddressForm.updateValueAndValidity();
  }

  showAddAddress(): void {
    this.streetAddressForm.patchValue({
      id: this.rolePlayerId,
      line1: '',
      line2: '',
      city: '',
      addressType: 0,
      postalCode: '',
      province: '',
      effectiveDate: new Date()
    });

    this.postalAddressForm.patchValue({
      id: this.rolePlayerId,
      line1: '',
      line2: '',
      city: '',
      addressType: 0,
      postalCode: '',
      province: '',
      effectiveDate: new Date()
    });

    this.showSection('addAddress');
    this.postalSame = false;
    this.setPostalAddress(this.postalSame);
  }

  readAddressForm(formName: string): RolePlayerAddress {
    const value = (formName === 'postal') ? this.postalAddressForm.value : this.streetAddressForm.value;
    const address = new RolePlayerAddress();
    const effectiveDate = new Date(value.effectiveDate);
    effectiveDate.setHours(0, 0, 0, 0);
    address.rolePlayerAddressId = 0;
    address.rolePlayerId = this.rolePlayerId;
    address.effectiveDate = effectiveDate;
    address.addressLine1 = value.line1;
    address.addressLine2 = value.line2;
    address.city = value.city;
    address.postalCode = value.postalCode;
    address.province = value.province;
    address.addressType = formName === 'postal' ? AddressTypeEnum.Postal : AddressTypeEnum.Physical;
    address.countryId = this.countries[0].id;
    return address;
  }

  addAddress(): void {

    if (!this.streetAddressForm.valid) { return; }
    if (!this.postalSame && !this.postalAddressForm.valid) { return; }

    let address = this.readAddressForm('physical');
    this.rolePlayerAddresses.push(address);
    address = this.readAddressForm('postal');
    this.rolePlayerAddresses.push(address);
    this.getData();
    this.addressService.addressUpdate(this.rolePlayerAddresses);
    // this.dataSource.getData(this.rolePlayerAddresses);
    this.showSection('showAddresses');
  }

  getType(id: number) {
    const addresstype = AddressTypeEnum[id];
    return addresstype;
  }

  public setViewData(rolePlayerAddresses: RolePlayerAddress[]) {
    this.rolePlayerAddresses = rolePlayerAddresses;
    this.getData();
    this.disable();
  }

  enable(): void {
    this.isDisabled = false;
    this.streetAddressForm.enable();
  }

  disable(): void {
    this.isDisabled = true;
    this.streetAddressForm.disable();
  }

  toggleCitySearch(tipe: string) {
    this.tipe = tipe;
    this.showCitySearch = !this.showCitySearch;
  }

  setCity($event: CityRetrieval) {
    if (this.tipe === 'p') {
      this.streetAddressForm.patchValue({
        city: $event.city,
        postalCode: $event.code,
        province: $event.province,
      });
    } else {
      this.postalAddressForm.patchValue({
        city: $event.city,
        postalCode: $event.code,
        province: $event.province,
      });
    }

    this.toggleCitySearch(null);
  }
}
