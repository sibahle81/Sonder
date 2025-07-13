import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { TravelAuthorisation } from '../../models/travel-authorisation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, EMPTY, of, Subject } from 'rxjs';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AuthorisedPartyEnum } from '../../models/authorised-party-enum';
import { TravelRateType } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/travelRateType';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MatSelectChange } from '@angular/material/select';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { TebaTariffCodeTypeEnum } from 'projects/shared-models-lib/src/lib/enums/teba-tariff-code-type-enum';
import { TebaInvoiceService } from '../../../medical-invoice-manager/services/teba-invoice.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TebaTariff } from '../../../medical-invoice-manager/models/teba-tariff';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { notBeforeEventDate } from 'projects/shared-utilities-lib/src/lib/validators/event-date.validator';

@Component({
  selector: 'app-manage-travel-auth',
  templateUrl: './manage-travel-auth.component.html',
  styleUrls: ['./manage-travel-auth.component.css'],
  providers: [
      { provide: DateAdapter, useClass: MatDatePickerDateFormat },
      { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
    ]
})
export class ManageTravelAuthComponent implements OnInit {
  form: FormGroup;
  isEdit: boolean = false;
  travelAuthorisation: TravelAuthorisation;
  yesNoOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];  
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  authorisedParties: { id: number; name: string }[] = [];
  typeRates: { id: number; name: string }[] = [];
  minDate = new Date();
  maxDate = new Date();
  isInternalUser = true;
  isReadOnly: boolean;
  selectedRolePlayer: RolePlayer;
  advancedFiltersExpanded: boolean;
  isSearchRolePlayer: boolean;
  personEvent: PersonEventModel;
  typeRateChangedSubject = new Subject<any>();
  authorisedRateChanged = new Subject<void>();
  isManualRateChange = false;
  typeRateIdsToExclude = [
    TebaTariffCodeTypeEnum.ReimbursementGeneralClaimsAdHocServices1037,
    TebaTariffCodeTypeEnum.ReimbursementMedicalCostsinRuralAreas1039,
    TebaTariffCodeTypeEnum.ReimbursementofTaxiFares1033,
    TebaTariffCodeTypeEnum.MedicalSupplies1211
  ];
  selectedTypeRate: any;
  tebaTariff: TebaTariff;
  tebaInvoiceMinimumCharge: number;
  insuredLife: string;
  isShowClaimaint = false;

  constructor(
    public dialogRef: MatDialogRef<ManageTravelAuthComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { personEvent: PersonEventModel,
      eventModel: EventModel, travelAuthorisation: TravelAuthorisation, action: string },
    private readonly fb: FormBuilder,
    private readonly rolePlayerService: RolePlayerService,
    private readonly claimCareService: ClaimCareService,
    private readonly tebaInvoiceService: TebaInvoiceService,
    private readonly lookupService: LookupService,
    private readonly authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.isInternalUser = this.authService.getCurrentUser().isInternalUser;
    this.isReadOnly = this.data.action === 'view';
    this.isEdit = !!this.data.travelAuthorisation;

    if(this.data?.personEvent != null){
        this.personEvent = this.data?.personEvent;
    }

    const eventDate = new Date(this.data.eventModel?.eventDate);

    this.form = this.fb.group({
      authorisedParty: [{ value: this.data.travelAuthorisation?.travelAuthorisedParty || '', disabled: this.isReadOnly }, Validators.required],
      dateAuthorisedFrom: [{ 
        value: this.data.travelAuthorisation?.dateAuthorisedFrom || '', 
        disabled: this.isReadOnly 
      }, [
        Validators.required, 
        notBeforeEventDate(eventDate)
      ]],
      dateAuthorisedTo: [{ 
        value: this.data.travelAuthorisation?.dateAuthorisedTo || '', 
        disabled: this.isReadOnly 
      }, [
        Validators.required, 
        notBeforeEventDate(eventDate)
      ]],
      claimantName: [{ value: '', disabled: this.isReadOnly }],
      authorisedKm: [{ value: this.data.travelAuthorisation?.authorisedKm || '', disabled: this.isReadOnly }, Validators.required],
      typeRate: [{ value: this.data.travelAuthorisation?.travelRateTypeId || '', disabled: this.isReadOnly }, Validators.required],
      authorisedRate: [{ value: this.data.travelAuthorisation?.authorisedRate || '', disabled: this.isReadOnly }, Validators.required],
      authorisedAmount: [{ value: this.data.travelAuthorisation?.authorisedAmount || '', disabled: this.isReadOnly }],
      finalAuthorisedAmount: [{ value: this.data.travelAuthorisation?.authorisedAmountInclusive || '', disabled: this.isReadOnly }, Validators.required],
      description: [{ value: this.data.travelAuthorisation?.description || '', disabled: this.isReadOnly }, Validators.required],
      isPreAuthorised: [{ value: this.data.travelAuthorisation?.isPreAuthorised || '', disabled: this.isReadOnly }, Validators.required]
    });

    if(this.data.travelAuthorisation?.travelRateTypeId > 0 && this.data.action === 'edit'){
      if (this.typeRateIdsToExclude.includes(this.data.travelAuthorisation?.travelRateTypeId)) {
        this.form.get('authorisedKm')?.disable();
        this.form.get('authorisedKm')?.clearValidators();
        this.form.get('authorisedKm')?.updateValueAndValidity();
      
        this.form.get('authorisedRate')?.disable();
        this.form.get('authorisedRate')?.clearValidators();
        this.form.get('authorisedRate')?.updateValueAndValidity();
      
        this.form.get('authorisedAmount')?.enable();
        this.form.get('authorisedAmount')?.setValidators(Validators.required);
        this.form.get('authorisedAmount')?.updateValueAndValidity();
      } else {
        this.form.get('authorisedKm')?.enable();
        this.form.get('authorisedKm')?.setValidators(Validators.required);
        this.form.get('authorisedKm')?.updateValueAndValidity();
      
        this.form.get('authorisedRate')?.enable();
        this.form.get('authorisedRate')?.setValidators(Validators.required);
        this.form.get('authorisedRate')?.updateValueAndValidity();
      
        this.form.get('authorisedAmount')?.disable();
        this.form.get('authorisedAmount')?.clearValidators();
        this.form.get('authorisedAmount')?.updateValueAndValidity();
      }
    }
    
  
    this.loadAuthorisedParties();
    this.loadTravelTypes();
    this.loadLookUps();
    this.isSearchRolePlayer = false;
  
    if (!this.isInternalUser) {
      this.form.disable();
    }

    this.typeRateChangedSubject.pipe(
      debounceTime(300), 
      switchMap(value => {
        const authorisedFromDateValue = this.form.get('dateAuthorisedFrom')?.value;
        if (!authorisedFromDateValue) return of(null);
    
        const authorisedFromDate = new Date(authorisedFromDateValue);
        authorisedFromDate.setMinutes(authorisedFromDate.getMinutes() - authorisedFromDate.getTimezoneOffset());
    
        this.selectedTypeRate = value?.value ?? value;
        if (this.typeRateIdsToExclude.includes(this.selectedTypeRate)) {
          this.form.get('authorisedKm')?.disable();
          this.form.get('authorisedKm')?.clearValidators();
          this.form.get('authorisedKm')?.updateValueAndValidity();
        
          this.form.get('authorisedRate')?.disable();
          this.form.get('authorisedRate')?.clearValidators();
          this.form.get('authorisedRate')?.updateValueAndValidity();
        
          this.form.get('authorisedAmount')?.enable();
          this.form.get('authorisedAmount')?.setValidators(Validators.required);
          this.form.get('authorisedAmount')?.updateValueAndValidity();
        } else {
          this.form.get('authorisedKm')?.enable();
          this.form.get('authorisedKm')?.setValidators(Validators.required);
          this.form.get('authorisedKm')?.updateValueAndValidity();
        
          this.form.get('authorisedRate')?.enable();
          this.form.get('authorisedRate')?.setValidators(Validators.required);
          this.form.get('authorisedRate')?.updateValueAndValidity();
        
          this.form.get('authorisedAmount')?.disable();
          this.form.get('authorisedAmount')?.clearValidators();
          this.form.get('authorisedAmount')?.updateValueAndValidity();
        }
        
        
        if (typeof this.selectedTypeRate === 'number' && this.selectedTypeRate >= 0) {
          return this.tebaInvoiceService.GetTebaTariff(this.selectedTypeRate, authorisedFromDate);
        }
    
        return of(null);
      })
    ).subscribe(tebaTariff => {
      this.tebaTariff = tebaTariff;
      
      if (this.typeRateIdsToExclude.includes(this.selectedTypeRate)) {
        return;
      }
    
      if (tebaTariff && tebaTariff.costValue != null) {
        const authorisedKm = this.form.get('authorisedKm')?.value ?? 0;
        const rate = tebaTariff.costValue ?? 0;
    
        if (!this.isManualRateChange) {
          this.form.get('authorisedRate')?.setValue(rate, { emitEvent: false });
        }
    
        const calculatedAmount = Math.round((rate * authorisedKm + Number.EPSILON) * 100) / 100;
        this.form.get('finalAuthorisedAmount')?.setValue(calculatedAmount, { emitEvent: false });
      }
    });
    
    

    this.authorisedRateChanged.pipe(debounceTime(300)).subscribe(() => {
      this.triggerCalculation();
    });

    this.form.get('authorisedRate').valueChanges.subscribe(() => {
      this.authorisedRateChanged.next();
    });

    this.form.get('authorisedAmount')?.valueChanges
    .pipe(
      debounceTime(700),
      distinctUntilChanged()
    )
    .subscribe(value => {
      const numericValue = Number(value);
      const control = this.form.get('authorisedAmount');

      if (
        this.tebaTariff &&
        this.typeRateIdsToExclude.includes(this.selectedTypeRate) &&
        numericValue > 0 &&
        control?.dirty
      ) {
        this.calculateAuthorisedAmount(this.tebaTariff);
      }
    });
  }

  get isTypeRateExcluded(): boolean {
    return this.typeRateIdsToExclude.includes(this.selectedTypeRate);
  }
  
  triggerCalculation() {
    const type = this.form.get('typeRate')?.value;
    this.typeRateChanged(type);
  }

  calculateAuthorisedAmount(tebaTariff: TebaTariff) {
    if (!tebaTariff) return;
  
    let authorisedAmountRaw = this.form.get('authorisedAmount')?.value ?? 0;
    let authorisedAmount = Number(authorisedAmountRaw);

    if (authorisedAmount <= 0) {
      return;
    }
    const minCharge = this.tebaInvoiceMinimumCharge || 0;
    const tebaAdminFee = tebaTariff.adminFeePercentage > 0 ? tebaTariff.adminFeePercentage : 0;

    let calculatedAuthAmount = authorisedAmount + (authorisedAmount * (tebaAdminFee / 100));
    calculatedAuthAmount = calculatedAuthAmount < minCharge && minCharge > 0 ? minCharge : calculatedAuthAmount;

    calculatedAuthAmount = parseFloat(calculatedAuthAmount.toFixed(2));
  
    const currentValue = Number(this.form.get('authorisedAmount')?.value ?? 0);
  
    if (parseFloat(currentValue.toFixed(2)) !== calculatedAuthAmount) {
      this.form.get('finalAuthorisedAmount')?.setValue(calculatedAuthAmount, { emitEvent: false });
    }
  }
  
  
  

  loadAuthorisedParties(): void {
    this.authorisedParties = Object.keys(AuthorisedPartyEnum)
      .filter(key => isNaN(Number(key))) 
      .map(key => ({
        id: AuthorisedPartyEnum[key as keyof typeof AuthorisedPartyEnum],
        name: key.replace(/([A-Z])/g, ' $1').trim()
      }));
  }

  loadLookUps(): void {
    this.lookupService.getItemByKey('TebaInvoiceMinimumCharge').subscribe(minimumCharge => {
      this.tebaInvoiceMinimumCharge = parseFloat(minimumCharge) || 0;
    });
  }
  
  
  loadTravelTypes(): void {
    this.typeRates = Object.keys(TebaTariffCodeTypeEnum)
      .filter(key => isNaN(Number(key))) 
      .map(key => ({
        id: TebaTariffCodeTypeEnum[key as keyof typeof TebaTariffCodeTypeEnum],
        name: key.replace(/([A-Z])/g, ' $1').trim()
      }));
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.readForm());
    }
  }
  
  readForm(): TravelAuthorisation {
    if (!this.form) {
      return;
    }
    const formDetails = this.form.getRawValue();
    let authorisedFromDate = new Date(formDetails.dateAuthorisedFrom);
    authorisedFromDate.setMinutes(authorisedFromDate.getMinutes() - authorisedFromDate.getTimezoneOffset());
    let authorisedToDate = new Date(formDetails.dateAuthorisedTo);
    authorisedToDate.setMinutes(authorisedToDate.getMinutes() - authorisedToDate.getTimezoneOffset());
    let travelAuthorisation = new TravelAuthorisation();
    travelAuthorisation.personEventId = this.data?.personEvent.personEventId;
    travelAuthorisation.travelAuthorisedParty = formDetails.authorisedParty;
    travelAuthorisation.dateAuthorisedFrom = authorisedFromDate;
    travelAuthorisation.dateAuthorisedTo = authorisedToDate;
    travelAuthorisation.travelRateTypeId = formDetails.typeRate;
    travelAuthorisation.authorisedAmount = formDetails.authorisedAmount;
    travelAuthorisation.authorisedAmountInclusive = formDetails.finalAuthorisedAmount;
    travelAuthorisation.description = formDetails.description;
    travelAuthorisation.isPreAuthorised = formDetails.isPreAuthorised;
    if(this.typeRateIdsToExclude.includes(this.selectedTypeRate))
    {
      travelAuthorisation.authorisedKm = 0;
      travelAuthorisation.authorisedRate = 0;
    } else {
      travelAuthorisation.authorisedKm = formDetails.authorisedKm;
      travelAuthorisation.authorisedRate = formDetails.authorisedRate;
    }
    if(this.isEdit){
      travelAuthorisation.travelAuthorisationId = this.data.travelAuthorisation?.travelAuthorisationId;
    }

    if(formDetails.authorisedParty === AuthorisedPartyEnum.Any){
      if(this.selectedRolePlayer){
        travelAuthorisation.payeeId = this.selectedRolePlayer.rolePlayerId;
      }
    }else if(formDetails.authorisedParty === AuthorisedPartyEnum.ClaimantReimbursement || formDetails.authorisedParty === AuthorisedPartyEnum.DeceasedRepatriation){
      travelAuthorisation.payeeId = this.personEvent.insuredLifeId;
    }
    return travelAuthorisation;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  authorisedPartyChanged(value: any): void {
    const type = value?.value ?? value;
  
    this.isSearchRolePlayer = type === AuthorisedPartyEnum.Any;
    this.isShowClaimaint = type === AuthorisedPartyEnum.ClaimantReimbursement;
    if(this.isShowClaimaint) {
      if (this.data?.personEvent) {
        this.form.get('claimantName').setValue(this.data?.personEvent.rolePlayer.displayName);
      }
      
    }
  }
  

  rolePlayerSelected($event: RolePlayer) {
    this.advancedFiltersExpanded = false;
    this.selectedRolePlayer = $event;
  }
  

  typeRateChanged(value: any) {
    this.typeRateChangedSubject.next(value);
  }

  onAuthorisedRateChange() {
    this.calculateAuthorisedAmount(this.tebaTariff);
  }
  
  onAuthorisedRateFocusOut() {
    this.calculateAuthorisedAmount(this.tebaTariff);
  }

  isPredAuthorisedChanged(value: any) {
    const type = value.value ? value.value : value;
  }
}