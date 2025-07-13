import { BehaviorSubject } from 'rxjs';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { LeadAddress } from 'projects/clientcare/src/app/lead-manager/models/lead-address';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import 'src/app/shared/extensions/string.extensions';
import { LeadItemTypeEnum } from '../../../broker-manager/models/enums/lead-item-type.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { GeneralAuditDialogComponent } from '../../../shared/general-audits/general-audit-dialog/general-audit-dialog.component';

@Component({
  selector: 'lead-address',
  templateUrl: './lead-address.component.html',
  styleUrls: ['./lead-address.component.css']
})
export class LeadAddressComponent implements OnInit, OnChanges {

  @Input() lead: Lead = new Lead();
  @Input() isWizard = false;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  @Output() isValidEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() isPristineEmit: EventEmitter<boolean> = new EventEmitter();

  form: FormGroup;

  address: LeadAddress;
  addresses: LeadAddress[] = [];
  hideForm = true;
  currentUser: string;

  selectedCountry: Lookup;
  addressTypes: Lookup[];
  provinces: Lookup[];
  countries: Lookup[];
  cities: Lookup[];
  originalCitiesList: Lookup[];
  citiesToSelect: Lookup[];

  requiredPermission = 'Manage Lead';
  hasPermission: boolean;

  isValid = false;
  userInput = new FormControl();

  private selectCity: ElementRef;
  @ViewChild('selectCity', { static: false }) set content(content: ElementRef) {
    if (content) {
      this.selectCity = content;

      const selectCityKeyUp = fromEvent(this.selectCity.nativeElement, 'keyup')
        .pipe(
          map((e: any) => e.target.value),
          debounceTime(300),
          distinctUntilChanged()
        );

      selectCityKeyUp.subscribe((searchData: string) => {
        if (String.isNullOrEmpty(searchData)) {
          this.citiesToSelect = this.originalCitiesList;
          return;
        }
        this.citiesToSelect = this.originalCitiesList.filter(city => String.contains(city.name, searchData));
      });
    }
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
    this.createForm();
    this.getLookups();
    if (this.lead.addresses) {
      this.addresses = this.lead.addresses;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.addresses = this.lead.addresses;
  }

  createForm() {
    this.form = this.formBuilder.group({
      id: new FormControl(0),
      addressType: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      addressLine1: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      addressLine2: [{ value: null, disabled: !this.hasPermission || this.isWizard }],
      postalCode: [{ value: null, disabled: !this.hasPermission || this.isWizard }, [Validators.required, Validators.pattern('^([0-9]{4}|[0-9])$'), Validators.maxLength(4)]],
      province: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      country: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
      userInput: [{ value: null, disabled: !this.hasPermission || this.isWizard }, Validators.required],
    });
  }

  getLookups() {
    this.getAddressTypes();
  }

  readForm() {
    this.address = this.address ? this.address : new LeadAddress();
    this.address.addressId = this.form.controls.id.value ? this.form.controls.id.value : 0;
    this.address.addressTypeId = this.form.controls.addressType.value;
    this.address.addressLine1 = this.form.controls.addressLine1.value;
    this.address.addressLine2 = this.form.controls.addressLine2.value ? this.form.controls.addressLine2.value : '';
    this.address.postalCode = this.form.controls.postalCode.value;
    this.address.countryId = this.form.controls.country.value;
    this.address.province = this.form.controls.province.value;
    this.address.city = this.userInput.value;
  }

  patchForm() {
    if (this.address) {
      this.form.patchValue({
        id: this.address.addressId ? this.address.addressId : 0,
        addressType: this.address.addressTypeId,
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
      this.originalCitiesList = data;
      this.citiesToSelect = data;
      if (this.cities.length === 1) {
        this.form.patchValue({
          city: this.cities[0]
        });
        this.disableFormControl('city');
      }
      this.isLoading$.next(false);
    });
  }

  toggleAddress(address: LeadAddress) {
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
    return this.countries.find(s => s.id === id).name;
  }

  add() {
    this.toggle();
    this.readForm();

    if (this.address.addressId <= 0) {
      this.addresses.push(this.address);
    } else {
      const index = this.addresses.findIndex(s => s.addressId === this.address.addressId);
      this.addresses[index] = this.address;
    }

    this.lead.addresses = this.addresses;
    this.isPristineEmit.emit(false);
    this.reset();
    this.validateAddresses();
  }

  delete(address: LeadAddress) {
    const index = this.addresses.findIndex(s => s === address);
    this.addresses.splice(index, 1);
    this.validateAddresses();
  }

  cancel() {
    this.toggle();
    this.reset();
  }

  reset() {
    this.address = new LeadAddress();

    this.form.controls.id.reset();
    this.form.controls.addressType.reset();
    this.form.controls.addressLine1.reset();
    this.form.controls.addressLine2.reset();
    this.form.controls.postalCode.reset();
    this.form.controls.province.reset();
    this.userInput.reset();
    this.form.controls.country.reset();
  }

  validateAddresses() {
    this.isValid = this.addresses.length > 0;
    this.isValidEmit.emit(this.isValid);
  }

  openAuditDialog(address: LeadAddress) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '1024px',
      data: {
        serviceType: ServiceTypeEnum.LeadManager,
        clientItemType: LeadItemTypeEnum.Address,
        itemId: address.addressId,
        heading: 'Address Details Audit',
        propertiesToDisplay: ['AddressTypeId', 'AddressLine1', 'AddressLine2', 'PostalCode', 'City', 'Province', 'CountryId',
        'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate']
      }
    });
  }
}


