import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RolePlayerAddress } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-address';
import { CityRetrieval } from 'projects/shared-models-lib/src/lib/common/city-retrieval.model';
import { AddressTypeEnum } from 'projects/shared-models-lib/src/lib/enums/address-type-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject } from 'rxjs';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { takeUntil } from 'rxjs/operators';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { DocumentUploaderDialogComponent } from '../../dialogs/document-uploader-dialog/document-uploader-dialog.component';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentSystemNameEnum } from '../../document/document-system-name-enum';

@Component({
  selector: 'role-player-address-details',
  templateUrl: './role-player-address-details.component.html',
  styleUrls: ['./role-player-address-details.component.css']
})
export class RolePlayerAddressDetailsComponent extends UnSubscribe {

  form: UntypedFormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingStateProvinces$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  data: any;
  address: RolePlayerAddress;
  addresses: RolePlayerAddress[];

  addressTypes: AddressTypeEnum[];
  defaultAddressType = AddressTypeEnum.Physical;
  selectedAddressType: AddressTypeEnum;

  countries: Lookup[];
  selectedCountry: number;
  stateProvinces: Lookup[];

  postalSame = false;
  postal = AddressTypeEnum.Postal;
  showCitySearch: boolean;
  isOriginalPrimaryAddress: boolean;

  allRequiredDocumentsUploaded: boolean;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<RolePlayerAddressDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    super();
    this.data = data;

    if (this.data) {
      this.addresses = this.data.addresses ? this.data.addresses : [];
      this.address = this.data.address ? this.data.address : new RolePlayerAddress();

      this.isOriginalPrimaryAddress = this.address.isPrimary ? this.address.isPrimary : false;

      this.getLookups();
    }
  }

  getLookups() {
    this.addressTypes = this.ToArray(AddressTypeEnum);
    this.getCountries();
  }

  getAddressType(id: number) {
    if (!id) {
      id = +AddressTypeEnum[this.form.controls.addressType.value];
    }

    return this.formatText(AddressTypeEnum[id]);
  }

  formatText(text: string): string {
    if (!text) { return; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      line1: [{ value: null, disabled: this.data.isReadOnly }, Validators.required],
      line2: [{ value: null, disabled: this.data.isReadOnly }],
      city: [{ value: null, disabled: this.data.isReadOnly }, Validators.required],
      postalCode: [{ value: null, disabled: this.data.isReadOnly }, [Validators.required]],
      province: [{ value: null, disabled: this.data.isReadOnly }],
      effectiveDate: [{ value: new Date().getCorrectUCTDate(), disabled: this.data.isReadOnly }, [Validators.required]],
      addressType: [{ value: null, disabled: this.data.isReadOnly }, Validators.required],
      country: [{ value: null, disabled: true }],
      isPrimary: [{ value: this.address.isPrimary ? this.address.isPrimary : false, disabled: this.data.isReadOnly || (this.address.isPrimary && this.address.rolePlayerAddressId && this.address.rolePlayerAddressId > 0) }],
    });
  }

  getCountries(): void {
    this.lookupService.getCountries().pipe(takeUntil(this.unSubscribe$)).subscribe(results => {
      this.countries = results;
      this.createForm();
      this.patchForm();
      this.isLoading$.next(false);
    });
  }

  toggleCitySearch() {
    this.showCitySearch = !this.showCitySearch;
  }

  setCity($event: CityRetrieval) {
    this.form.patchValue({
      city: $event.city,
      postalCode: $event.code,
      province: $event.province,
    });

    this.form.markAsDirty();
    this.toggleCitySearch();
  }

  checkKYC() {
    if ((this.address.rolePlayerId && this.address.rolePlayerId > 0) && ((this.isOriginalPrimaryAddress && this.form.controls.isPrimary.value) || (!this.isOriginalPrimaryAddress && this.form.controls.isPrimary.value))) {
      this.openDocumentUploaderDialog();
    } else {
      this.save();
    }
  }

  save() {
    this.readForm();
    this.dialogRef.close(this.addresses);
  }

  openDocumentUploaderDialog() {
    const dialogRef = this.dialog.open(DocumentUploaderDialogComponent, {
      width: '70%',
      data: {
        title: `Documents Required (K.Y.C): Primary ${this.getAddressType(+this.selectedAddressType)} Address Changed`,
        documentSystemName: DocumentSystemNameEnum.MemberManager,
        documentSet: DocumentSetEnum.MemberDocumentSet,
        keyName: 'MemberId',
        keyValue: this.address.rolePlayerId && this.address.rolePlayerId > 0 ? this.address.rolePlayerId : null,
        documentTypeFilter: [DocumentTypeEnum.LetterheadConfirmingDetails],
        forceRequiredDocumentTypeFilter: [DocumentTypeEnum.LetterheadConfirmingDetails]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.allRequiredDocumentsUploaded = result;
      if (this.allRequiredDocumentsUploaded) {
        this.save();
      } else {
        // DO SOMETHING MAYBE
      }
    });
  }

  patchForm() {
    this.selectedCountry = this.address && this.address.countryId ? this.address.countryId : 1;
    this.countrySelected(this.selectedCountry);

    this.selectedAddressType = this.address.rolePlayerAddressId && this.address.rolePlayerAddressId > 0 ? this.address.addressType : this.defaultAddressType;

    this.form.patchValue({
      addressType: AddressTypeEnum[+this.selectedAddressType],
      line1: this.address.addressLine1 ? this.address.addressLine1 : null,
      line2: this.address.addressLine2 ? this.address.addressLine2 : null,
      postalCode: this.address.postalCode ? this.address.postalCode : null,
      province: this.address.province ? this.address.province : null,
      city: this.address.city ? this.address.city : null,
      country: this.selectedCountry,
      effectiveDate: this.address.effectiveDate ? new Date(this.address.effectiveDate) : new Date().getCorrectUCTDate(),
      isPrimary: this.address.isPrimary ? this.address.isPrimary : false
    });
  }

  addressTypeChange($event: any) {
    this.selectedAddressType = +AddressTypeEnum[$event.value];
    this.postalSame = false;
  }

  readForm() {
    this.selectedCountry = this.form.controls.country.value ? this.form.controls.country.value : 1;
    this.countrySelected(this.selectedCountry);

    this.address.addressType = +this.selectedAddressType;
    this.address.addressLine1 = this.form.controls.line1.value ? this.form.controls.line1.value : null;
    this.address.addressLine2 = this.form.controls.line2.value ? this.form.controls.line2.value : null;
    this.address.postalCode = this.form.controls.postalCode.value ? this.form.controls.postalCode.value : null;
    this.address.province = this.form.controls.province.value ? this.form.controls.province.value : null;
    this.address.city = this.form.controls.city.value ? this.form.controls.city.value : null;
    this.address.countryId = this.selectedCountry;
    this.address.effectiveDate = this.form.controls.effectiveDate.value ? this.form.controls.effectiveDate.value : null;

    this.handlePrimaryIndicator(this.address);

    const index = this.addresses.findIndex(s => s.rolePlayerAddressId == this.address.rolePlayerAddressId && s.addressType == this.address.addressType);
    if (index > -1) {
      this.addresses[index] = this.address;
    } else {
      this.addresses.push(this.address);
    }

    if (this.postalSame) {
      const postalAddress = JSON.parse(JSON.stringify(this.address)) as RolePlayerAddress; // creates a deep copy
      postalAddress.addressType = +AddressTypeEnum.Postal;

      this.handlePrimaryIndicator(postalAddress);

      const index = this.addresses.findIndex(s => s.rolePlayerAddressId == this.address.rolePlayerAddressId && s.addressType == postalAddress.addressType);
      if (index > -1) {
        this.addresses[index] = postalAddress;
      } else {
        this.addresses.push(postalAddress);
      }
    }
  }

  cancel() {
    if (this.showCitySearch) {
      this.toggleCitySearch();
    } else {
      this.dialogRef.close(this.data.isReadOnly);
    }
  }

  countrySelected(countryId: number) {
    this.isLoadingStateProvinces$.next(true);
    this.stateProvinces = [];

    this.selectedCountry = countryId;
    this.lookupService.getStateProvincesByCountry(this.selectedCountry).subscribe(results => {
      this.stateProvinces = results;
      this.isLoadingStateProvinces$.next(false);
    });
  }

  handlePrimaryIndicator(address: RolePlayerAddress) {
    if (!address.isPrimary || !this.addresses || this.addresses.length <= 0) { return; }

    if (address.isPrimary) {
      const originalPrimaryAddressForAddressTypeIndex = this.addresses.findIndex(s => s.isPrimary && s.addressType == address.addressType);
      if (originalPrimaryAddressForAddressTypeIndex > -1 && this.addresses[originalPrimaryAddressForAddressTypeIndex].rolePlayerAddressId != address.rolePlayerAddressId) {
        this.addresses[originalPrimaryAddressForAddressTypeIndex].isPrimary = false;
      }
    }
  }

  openConfirmationDialog($event: boolean) {
    if ($event) {
      const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
        width: '40%',
        disableClose: true,
        data: {
          title: `Change Primary Address?`,
          text: `All documentation that displays ${this.getAddressType(this.address.addressType)} address details will use the selected ${this.getAddressType(this.address.addressType)} address. Are you sure you want to proceed?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // continue
        } else {
          this.address.isPrimary = false;
          this.form.controls.isPrimary.reset();
        }
      });
    }
  }
}
