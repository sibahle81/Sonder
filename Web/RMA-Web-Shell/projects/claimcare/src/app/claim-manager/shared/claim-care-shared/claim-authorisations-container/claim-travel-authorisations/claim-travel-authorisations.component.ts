import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Claim } from '../../../entities/funeral/claim.model';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { AuthorisationsFormService } from '../claim-authorisations-form.service';
import { TravelAuthorisation } from './claimTravelAuthorisations';
import { TravelAuthorisedParty } from '../../../entities/personEvent/travel-authorised-Party';
import { TravelRateType } from '../../../entities/personEvent/travelRateType';



@Component({
  selector: 'claim-travel-authorisations',
  templateUrl: './claim-travel-authorisations.component.html',
  styleUrls: ['./claim-travel-authorisations.component.css']
})
export class ClaimTravelAuthorisationsComponent implements OnInit {
  @Input() claimTravelAuthorisations: TravelAuthorisation;
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() disableControls: string[] = [];
  @Input() user: User;
  claims: Claim;
  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading authorisations details...please wait');

  form: UntypedFormGroup;
  filterByUserId: number;
  currentQuery: any;
  filteredUsers: User[];
  users: User[];
  authorisedParties: TravelAuthorisedParty[];
  typeRates: TravelRateType[];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public readonly authorisationsFormService: AuthorisationsFormService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    public userService: UserService,
  ) { }

  ngOnInit(): void {
    this.getClaimDetails();
    this.createForm();
    this.getUsersForPool()
    this.getTravelAuthorisedParties();
    this.getTravelRateTypes();
  }

  getTravelAuthorisedParties(){
    this.claimInvoiceService.GetTravelAuthorisedParties().subscribe(result => {
      if(result){
        this.authorisedParties = result;
      }
    });
  }

  getTravelRateTypes(){
    this.claimInvoiceService.GetTravelRateTypes().subscribe(result => {
      if(result){
        this.typeRates = result;
      }
    });
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      dateAuthorisedFrom: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      dateAuthorisedTo: [{ value: '', disabled: this.isReadOnly }],
      authorisedKms: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      authorisedRate: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      authorisedParty: [{ value: 0, disabled: false }],
      typeRate: [{ value: 0, disabled: false }],
      authorisedAmount: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      description: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      isPreAuthorised: [{ value: 0, disabled: false }]
    });

    this.authorisationsFormService.addForm(this.form);
     this.setForm();
  }
  setForm() {
    this.form.patchValue({
      dateAuthorisedFrom: this.claimTravelAuthorisations && this.claimTravelAuthorisations.dateAuthorisedFrom ? this.claimTravelAuthorisations.dateAuthorisedFrom : null,
      dateAuthorisedTo: this.claimTravelAuthorisations && this.claimTravelAuthorisations.dateAuthorisedTo ? this.claimTravelAuthorisations.dateAuthorisedTo : null,
      authorisedKms: this.claimTravelAuthorisations && this.claimTravelAuthorisations.authorisedKm ? this.claimTravelAuthorisations.authorisedKm : null,
      authorisedRate: this.claimTravelAuthorisations && this.claimTravelAuthorisations.authorisedRate ? this.claimTravelAuthorisations.authorisedRate : null,
      authorisedParty: this.claimTravelAuthorisations && this.claimTravelAuthorisations.travelAuthorisedPartyId ? this.claimTravelAuthorisations.travelAuthorisedPartyId : null,
      typeRates: this.claimTravelAuthorisations && this.claimTravelAuthorisations.travelRateTypeId ? this.claimTravelAuthorisations.travelRateTypeId : null,
      authorisedAmount: this.claimTravelAuthorisations && this.claimTravelAuthorisations.authorisedAmount ? this.claimTravelAuthorisations.authorisedAmount : null,
      description: this.claimTravelAuthorisations && this.claimTravelAuthorisations.description ? this.claimTravelAuthorisations.description : null,
      isPreAuthorised: this.claimTravelAuthorisations && this.claimTravelAuthorisations.isPreAuthorised ? this.claimTravelAuthorisations.isPreAuthorised : null,
    });

    this.isLoading$.next(false);
  }

  readForm(): TravelAuthorisation {
    if (!this.form) {
      return;
    }
    const formDetails = this.form.getRawValue();
    let claimTravelAuthorisation = new TravelAuthorisation();
    claimTravelAuthorisation.personEventId = this.personEvent.personEventId;
    claimTravelAuthorisation.travelAuthorisedPartyId = formDetails.authorisedParty;
    claimTravelAuthorisation.dateAuthorisedFrom = formDetails.dateAuthorisedFrom;
    claimTravelAuthorisation.dateAuthorisedTo = formDetails.dateAuthorisedTo;
    claimTravelAuthorisation.authorisedKm = formDetails.authorisedKms;
    claimTravelAuthorisation.travelRateTypeId = formDetails.typeRate;
    claimTravelAuthorisation.authorisedRate = formDetails.authorisedRate;
    claimTravelAuthorisation.authorisedAmount = formDetails.authorisedAmount;
    claimTravelAuthorisation.description = formDetails.description;
    claimTravelAuthorisation.isPreAuthorised = formDetails.isPreAuthorised === 'true' ? true : false;

    return claimTravelAuthorisation;
  }

  getClaimDetails(){
    this.personEvent.claims.forEach(claimdetails => {
      this.claims = claimdetails;
    });
  }
  formValid(): boolean {
    return this.authorisationsFormService.isValidSave();
  }

  filterByUserName($event: any) {
    this.filterByUserId = $event.value;
    this.search(this.filterByUserId.toString());
  }

  search(searchTerm: string) {
    this.currentQuery = searchTerm;
    if (this.currentQuery.length >= 3) {
      this.currentQuery = this.currentQuery.trim();
    }
  }
  onUserKeyChange(value) {
    if(value){
      let filter = value.toLowerCase();
      this.filteredUsers = this.setData(filter, this.filteredUsers, this.users);
    }
  }

  setData(filter: string, filteredList: any, originalList: any) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    } else {
      return filteredList.filter(user => user.displayName.toLocaleLowerCase().includes(filter));
    }
  }

  save(){
    this.isLoading$.next(true);
    let data = this.readForm();
    this.claimInvoiceService.addTravelAuthorisation(data).subscribe(result => {
      if (result) {
        this.closeEmit.emit(true);
      }
    })
  }

  getUsersForPool() {
    var workpool = WorkPoolEnum[WorkPoolEnum.CcaPool];
    let permission = this.formatText(workpool);
    this.userService.getUsersByPermission(permission).subscribe(result => {
      if (result) {
        this.users = result.filter(a => a.roleId != 1 || a.id != this.user.id);
        this.filteredUsers = result.filter(a => a.roleId != 1 || a.id != this.user.id);
        this.form.controls.assessedby.enable();
      }
    });
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
