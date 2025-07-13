import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { Lead } from '../../../models/lead';
import { LeadService } from '../../../services/lead.service';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { LeadItemTypeEnum } from 'projects/clientcare/src/app/broker-manager/models/enums/lead-item-type.enum';
import { LeadAddress } from '../../../models/lead-address';
import { LeadAddressDataSource } from './lead-address.datasource';
import { AddressTypeEnum } from 'projects/shared-models-lib/src/lib/enums/address-type-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { LeadClientStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/leadClientStatusEnum';

@Component({
  selector: 'lead-address',
  templateUrl: './lead-address.component.html',
  styleUrls: ['./lead-address.component.css']
})
export class LeadAddressComponent extends UnSubscribe implements OnChanges {

  addPermission = 'Add Lead';
  editPermission = 'Edit Lead';
  viewPermission = 'View Lead';

  @Input() lead: Lead;
  @Input() isReadOnly = false;

  @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['addressType', 'addressLine1', 'addressLine2', 'postalCode', 'city', 'province', 'countryId', 'actions'];

  form: UntypedFormGroup;
  dataSource: LeadAddressDataSource;
  currentQuery: any;

  selectedLeadAddress: LeadAddress;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoadingStateProvinces$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showDetail$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  addressTypes: AddressTypeEnum[];

  countries: Lookup[];
  selectedCountry: number;
  stateProvinces: Lookup[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly leadService: LeadService,
    private readonly lookupService: LookupService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
    this.createForm();
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new LeadAddressDataSource(this.leadService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    if (this.lead && this.lead.leadId > 0) {
      this.currentQuery = this.lead.leadId.toString();
      this.getLookups();
    } else if (this.lead && this.lead.leadId <= 0) {
      this.getLookups();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  close() {
    this.showDetail$.next(false);
    this.showForm$.next(false);
    this.reset();
  }

  createForm() {
    if (!this.form) {
      this.form = this.formBuilder.group({
        addressType: [{ value: null, disabled: false }, [Validators.required]],
        addressLine1: [{ value: null, disabled: false }, [Validators.required]],
        addressLine2: [{ value: null, disabled: false }],
        postalCode: [{ value: null, disabled: false }, [Validators.required]],
        city: [{ value: null, disabled: false }, [Validators.required]],
        province: [{ value: null, disabled: false }, [Validators.required]],
        country: [{ value: null, disabled: false }, [Validators.required]],
      });
    }
  }

  setForm(leadAddress: LeadAddress) {
    this.selectedCountry = leadAddress.countryId ? leadAddress.countryId : 1;
    this.countrySelected(this.selectedCountry);

    this.form.patchValue({
      addressType: leadAddress.addressType ? AddressTypeEnum[leadAddress.addressType] : null,
      addressLine1: leadAddress.addressLine1 ? leadAddress.addressLine1 : null,
      addressLine2: leadAddress.addressLine2 ? leadAddress.addressLine2 : null,
      postalCode: leadAddress.postalCode ? leadAddress.postalCode : null,
      city: leadAddress.city ? leadAddress.city : null,
      province: leadAddress.province ? leadAddress.province : null,
      country: this.selectedCountry
    });
  }

  readForm(): LeadAddress {
    const leadAddress = new LeadAddress();

    leadAddress.addressId = this.selectedLeadAddress && this.selectedLeadAddress.addressId && this.selectedLeadAddress.addressId > 0 ? this.selectedLeadAddress.addressId : 0;
    leadAddress.leadId = this.lead.leadId;
    leadAddress.addressType = +AddressTypeEnum[this.form.controls.addressType.value];
    leadAddress.addressLine1 = this.form.controls.addressLine1.value;
    leadAddress.addressLine2 = this.form.controls.addressLine2.value;
    leadAddress.postalCode = this.form.controls.postalCode.value;
    leadAddress.city = this.form.controls.city.value;
    leadAddress.province = this.form.controls.province.value;
    leadAddress.countryId = this.form.controls.country.value;

    if (this.lead.leadId <= 0) {
      const currentUser = this.authService.getCurrentUser();
      leadAddress.createdBy = currentUser.email;
      leadAddress.createdDate = new Date();
      leadAddress.modifiedBy = currentUser.email;
      leadAddress.modifiedDate = new Date();
    }

    return leadAddress;
  }

  showForm(leadAddress: LeadAddress, enableForm: boolean) {
    if (leadAddress) {
      this.selectedLeadAddress = leadAddress;
      this.setForm(leadAddress);
    }

    if (enableForm) {
      this.form.enable();
    } else {
      this.form.disable();
    }

    this.showForm$.next(true);
  }

  save() {
    this.isLoading$.next(true);
    const leadAddress = this.readForm();
    if (this.selectedLeadAddress) {
      this.edit(leadAddress);
    } else {
      this.add(leadAddress);
    }
  }

  add(leadAddress: LeadAddress) {
    if (this.lead.leadId > 0) {
      this.leadService.addLeadAddress(leadAddress).subscribe(result => {
        this.getData();
        this.reset();

        if (this.lead.leadClientStatus == LeadClientStatusEnum.New) {
          this.isCompletedEmit.emit(true);
        }

        this.showForm$.next(false);
        this.isLoading$.next(false);
      });
    } else if (this.lead.leadId <= 0) {
      if (!this.lead.addresses) {
        this.lead.addresses = [];
      }
      this.lead.addresses.push(leadAddress);
      this.dataSource.getWizardData(this.lead.addresses);
      this.reset();

      if (this.lead.leadClientStatus == LeadClientStatusEnum.New) {
        this.isCompletedEmit.emit(true);
      }

      this.showForm$.next(false);
      this.isLoading$.next(false);
    }
  }

  edit(leadAddress: LeadAddress) {
    if (this.lead.leadId > 0) {
      this.leadService.editLeadAddress(leadAddress).subscribe(result => {
        this.getData();
        this.reset();

        if (this.lead.leadClientStatus == LeadClientStatusEnum.New) {
          this.isCompletedEmit.emit(true);
        }

        this.showForm$.next(false);
        this.isLoading$.next(false);
      });
    } else if (this.lead.leadId <= 0) {
      if (!this.lead.addresses) {
        this.lead.addresses = [];
      }
      const index = this.lead.addresses.findIndex(s => s == this.selectedLeadAddress)
      if (index > -1) {
        this.lead.addresses[index] = leadAddress;
        this.dataSource.getWizardData(this.lead.addresses);
        this.reset();

        if (this.lead.leadClientStatus == LeadClientStatusEnum.New) {
          this.isCompletedEmit.emit(true);
        }

        this.showForm$.next(false);
        this.isLoading$.next(false);
      }
    }
  }

  delete(leadAddress: LeadAddress) {
    const index = this.lead.addresses.findIndex(s => s == leadAddress)
    if (index > -1) {
      this.lead.addresses.splice(index, 1);
      this.dataSource.getWizardData(this.lead.addresses);
    }
  }

  getAddressType(addressType: AddressTypeEnum): string {
    return this.formatLookup(AddressTypeEnum[+addressType]);
  }

  reset() {
    this.form.controls.addressType.reset();
    this.form.controls.addressLine1.reset();
    this.form.controls.addressLine2.reset();
    this.form.controls.postalCode.reset();
    this.form.controls.city.reset();
    this.form.controls.province.reset();
    this.form.controls.country.reset();

    this.selectedLeadAddress = null;
  }

  getLookups() {
    this.addressTypes = this.ToArray(AddressTypeEnum);
    this.getCountries();
  }

  getCountries(): void {
    this.lookupService.getCountries().subscribe(results => {
      this.countries = results;

      if (this.lead && this.lead.leadId > 0 && this.lead.addresses && this.lead.addresses.length > 0) {
        this.getData();
      } else {
        this.selectedCountry = 1;
        this.countrySelected(this.selectedCountry);

        this.form.patchValue({
          country: this.selectedCountry,
          addressType: AddressTypeEnum[AddressTypeEnum.Postal]
        });

        this.form.controls.country.disable();
      }
    });
  }

  getCountryName(id: number): string {
    if (this.countries && this.countries.length > 0) {
      return this.countries.find(s => s.id === id).name;
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  countrySelected(countryId: number) {
    this.isLoadingStateProvinces$.next(true);
    this.stateProvinces = [];

    this.form.controls.province.reset();

    this.selectedCountry = countryId;
    this.lookupService.getStateProvincesByCountry(this.selectedCountry).subscribe(results => {
      this.stateProvinces = results;
      this.isLoadingStateProvinces$.next(false);
    });
  }

  openAuditDialog(address: LeadAddress) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.LeadManager,
        clientItemType: LeadItemTypeEnum.Address,
        itemId: address.addressId,
        heading: 'Address Details Audit',
        propertiesToDisplay: ['AddressTypeId', 'AddressLine1', 'AddressLine2', 'PostalCode', 'City', 'Province', 'CountryId']
      }
    });
  }
}
