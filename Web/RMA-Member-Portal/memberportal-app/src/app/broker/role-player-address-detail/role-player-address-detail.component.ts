import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'src/app/shared-utilities/datepicker/dateformat';
import { ValidateMinDateToday } from 'src/app/shared-utilities/validators/min-date-today.validator';
import { SearchAddressComponent } from 'src/app/shared/components/search-address/search-address.component';
import { AddressTypeEnum } from 'src/app/shared/enums/address-type.enum';
import { CityRetrieval } from 'src/app/shared/models/city-retrieval.model';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { RolePlayerAddress } from 'src/app/shared/models/role-player-address';
import { LookupService } from 'src/app/shared/services/lookup.service';


@Component({
  selector: 'lib-role-player-address-detail',
  templateUrl: './role-player-address-detail.component.html',
  styleUrls: ['./role-player-address-detail.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class RolePlayerAddressDetailComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  hasAddress$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataSource = new MatTableDataSource<RolePlayerAddress>();


  streetAddressForm: FormGroup;
  postalAddressForm: FormGroup;
  activeSection = 'showAddresses';
  addressTypes: Lookup[];
  rolePlayerId: number;
  rolePlayerAddresses: RolePlayerAddress[] = [];
  isDisabled = true;
  isWizard = false;
  isEdit = false;
  isChecked = false;
  statusMsg: string;

  get noAddresses(): boolean {
    return this.dataSource.data.length === 0;
  }

  get hasAddresses(): boolean {
    return this.dataSource.data.length > 0;
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService,
    public dialog: MatDialog
  ) {
    this.onLoadLookups(0);
  }


  ngOnInit() {
    if (this.rolePlayerAddresses && this.rolePlayerAddresses.length > 0) {
      this.createForm(this.rolePlayerAddresses[0].rolePlayerId);
    } else {
      this.createForm(0);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onLoadLookups(id: number): void {
    this.rolePlayerId = id;

    this.streetAddressForm = this.formBuilder.group({
      rolePlayerId: id,
      line1: ['', [Validators.required]],
      line2: [''],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.maxLength(4)]],
      province: [''],
      effectiveDate: ['', ValidateMinDateToday]
    });

    this.postalAddressForm = this.formBuilder.group({
      rolePlayerId: id,
      line1: ['', [Validators.required]],
      line2: [''],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.maxLength(4)]],
      province: [''],
      effectiveDate: ['', ValidateMinDateToday]
    });
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
      this.getSourceData(this.rolePlayerAddresses);
    }
  }

  getAddressTypes(): void {
    this.lookupService.getAddressTypes().subscribe(
      data => {
        this.addressTypes = data;
      }
    );
  }

  getSourceData(addresses: RolePlayerAddress[]) {
    this.isLoading$.next(true);
    this.dataSource.data = addresses;
    this.isLoading$.next(false);
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
    this.streetAddressForm.controls['effectiveDate'].markAsUntouched();
    this.postalAddressForm.controls['effectiveDate'].markAsUntouched();
    this.streetAddressForm.markAsPristine();
    this.postalAddressForm.markAsPristine();
    this.activeSection = section;
  }

  createForm(id): void {
    this.getAddressTypes();
    this.enable();
  }

  setPostalAddress(checked: any) {
    if (checked) {
      this.isChecked = true;
      this.postalAddressForm.controls.line1.disable();
      this.postalAddressForm.controls.line2.disable();
      this.postalAddressForm.controls.city.disable();
      this.postalAddressForm.controls.postalCode.disable();
      this.postalAddressForm.controls.province.disable();
      this.postalAddressForm.controls.effectiveDate.disable();
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
      this.isChecked = false;
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
  }

  editAddresses(): void {
    this.isEdit = true;
    this.postalAddressForm.enable();

    this.rolePlayerAddresses.forEach(address => {
      if (address.addressType === AddressTypeEnum.Physical) {
        this.streetAddressForm.patchValue({
          id: this.rolePlayerId,
          line1: address.addressLine1,
          line2: address.addressLine2,
          city: address.city,
          addressType: address.addressType,
          postalCode: address.postalCode,
          province: address.province,
          effectiveDate: new Date(address.effectiveDate)
        });
      }
      if (address.addressType === AddressTypeEnum.Postal) {
        this.postalAddressForm.patchValue({
          id: this.rolePlayerId,
          line1: address.addressLine1,
          line2: address.addressLine2,
          city: address.city,
          addressType: address.addressType,
          postalCode: address.postalCode,
          province: address.province,
          effectiveDate: new Date(address.effectiveDate)
        });
      }
      this.showSection('addAddress');
    });
  }

  populateAddress(form: FormGroup, addressType: AddressTypeEnum) {
    if (this.isEdit) {
      this.editCurrentAddress(form, addressType);
    } else {
      this.populateNewAddress(form, addressType);
    }
  }

  populateNewAddress(form: FormGroup, addressType: AddressTypeEnum) {
    let address = new RolePlayerAddress();
    address.addressLine1 = form.controls['line1'].value;
    address.addressLine2 = form.controls['line2'].value;
    address.city = form.controls['city'].value;
    address.postalCode = form.controls['postalCode'].value;
    address.province = form.controls['province'].value;
    address.effectiveDate = new Date(form.controls['effectiveDate'].value);
    address.effectiveDate.setHours(0, 0, 0, 0);
    address.addressType = addressType
    this.rolePlayerAddresses.push(address);
  }

  editCurrentAddress(form: FormGroup, addressType: AddressTypeEnum) {
    let address = this.rolePlayerAddresses.find(a => a.addressType == addressType);
    address.addressLine1 = form.controls['line1'].value;
    address.addressLine2 = form.controls['line2'].value;
    address.city = form.controls['city'].value;
    address.postalCode = form.controls['postalCode'].value;
    address.province = form.controls['province'].value;
    address.effectiveDate = new Date(form.controls['effectiveDate'].value);
    address.effectiveDate.setHours(0, 0, 0, 0);
    address.addressType = addressType

    if (addressType === AddressTypeEnum.Physical) {
      this.rolePlayerAddresses[0] = address;
    } else { this.rolePlayerAddresses[1] = address; }
  }

  addAddress(): void {
    if (this.streetAddressForm.pristine && this.postalAddressForm.pristine) {
      this.showAddressList();
    } else {
      this.validateForm(this.streetAddressForm, AddressTypeEnum.Physical);
      this.validateForm(this.postalAddressForm, AddressTypeEnum.Postal);
    }
  }

  validateForm(form: FormGroup, addressType: AddressTypeEnum) {
    if (!form.valid) {
      if (!form.pristine) {
        form.controls['effectiveDate'].markAsTouched();
      }
    } else {
      this.populateAddress(form, addressType);
      this.showAddressList();
    }
  }

  showAddressList() {
    this.getData();
    this.hasAddress$.next(true);
    this.showSection('showAddresses');
  }

  getType(id: number) {
    const addresstype = AddressTypeEnum[id];
    return addresstype;
  }

  setViewData(rolePlayerAddresses: RolePlayerAddress[]): void {
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

  addressDetails(tipe: string): void {
    const dialogRef = this.dialog.open(SearchAddressComponent, {
      width: '1150px',
    });

    dialogRef.afterClosed().subscribe(
      data => {
        this.updateAddress(data, tipe);
      }
    );
  }

  updateAddress(data: CityRetrieval, tipe: string) {
    if (data === null) { return; }
    if (data === undefined) { return; }

    if (tipe === 'p') {
      this.streetAddressForm.patchValue({
        city: data.city,
        postalCode: data.code,
        province: data.province,
      });
    } else {
      this.postalAddressForm.patchValue({
        city: data.city,
        postalCode: data.code,
        province: data.province,
      });
    }
  }
}
