import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { InvoiceFormService } from '../claim-invoice-container/invoice-form.service';
import { SundryProvider } from '../claim-invoice-container/invoice-sundry/sundry-provider';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PersonEventModel } from '../../entities/personEvent/personEvent.model';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';

@Component({
  selector: 'payee-type-search',
  templateUrl: './payee-type-search.component.html',
  styleUrls: ['./payee-type-search.component.css']
})
export class PayeeTypeSearchComponent extends UnSubscribe implements OnChanges {

  @Input() payeeType: PayeeTypeEnum;
  @Input() personEvent: PersonEventModel;

  @Output() populatePayee: EventEmitter<any> = new EventEmitter();
  @Output() closePayeeTableEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  placeholder$: BehaviorSubject<string> = new BehaviorSubject('search by provider name');

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;
  currentQuery: any;
  user: User;
  healthCareProvider = PayeeTypeEnum.HealthCareProvider;
  sundryProviderEnum = PayeeTypeEnum.SundryProvider;
  beneficiary = PayeeTypeEnum.Individual;

  payeeCompare: PayeeTypeEnum;
  healthCareProviders: HealthCareProvider[];
  showHealthCareProviders: boolean;
  filteredUserHealthCareProviders: HealthCareProvider[];
  sundryProviders: SundryProvider[];
  beneficiaries: RolePlayer[] = [];
  noBeneficiaries = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly claimCareService: ClaimCareService,
    public readonly invoiceFormService: InvoiceFormService,
    public readonly rolePlayerService: RolePlayerService,
    public healthcareProviderService: HealthcareProviderService,

  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading$.next(true);
    this.payeeCompare = this.payeeType;
    this.createForm();
    this.getUser();
    this.configureSearch();

    this.noBeneficiaries = false;
    if (this.payeeType === this.beneficiary) {
      this.getBeneficiaries();
    } else {
      this.isLoading$.next(false);
    }
  }

  getUser() {
    this.user = this.authService.getCurrentUser();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      searchTerm: [{ value: null, disabled: false }]
    });
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  configureSearch() {
    this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
      this.search(response as string);
    });
  }

  clearSearch() {
    this.form.get('searchTerm').setValue('');
    this.dataSource = new MatTableDataSource([]);
  }

  search(searchTerm: string) {
    this.currentQuery = searchTerm;
    if (this.currentQuery.length >= 3) {
      this.isLoading$.next(true);
      this.currentQuery = this.currentQuery.trim();

      if (this.payeeType == this.healthCareProvider) {
        this.user.isInternalUser ? this.getUserHealthCareProvidersForInternalUser(this.currentQuery) : this.getUserHealthCareProviders();
      }
      if (this.payeeType == this.sundryProviderEnum) {
        this.getSundryProviders(searchTerm);
      }
    }
  }

  getBeneficiaries() {
    this.isLoading$.next(true);
    this.claimCareService.getPersonEventDetails(this.personEvent.personEventId).subscribe(result =>{
      if(result.personEvents && result.personEvents.length > 0){
        this.personEvent = result.personEvents[0];
        let beneficiaryIds = this.personEvent.rolePlayer.toRolePlayers.map(a => a.fromRolePlayerId);

        beneficiaryIds?.forEach(id => {
          this.rolePlayerService.getBeneficiary(id).subscribe(beneficiary => {
            if (beneficiary) {
              this.beneficiaries.push(beneficiary);
              this.setTable(this.beneficiaries);
            }
          })
        })

        if (beneficiaryIds.length <= 0) {
          this.noBeneficiaries = true;
          this.isLoading$.next(false);
          this.populatePayee.emit(undefined);
        }
      }
    })
  }

  getRelationName(rolePlayerType: BeneficiaryTypeEnum): string {
    return rolePlayerType ? this.formatText(BeneficiaryTypeEnum[rolePlayerType]) : 'N/A';
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'N/A';
  }

  getSundryProviders(searchTerm: string) {
    this.claimCareService.getSundryProviders(searchTerm).subscribe(result => {
      this.invoiceFormService.populateSundryProviders(result);
      this.sundryProviders = result;

      this.setTable(result);
    })
  }

  providerDetailsChange($event: any) {

    if (this.payeeType == this.healthCareProvider) {
      const healthCareProvider = this.healthCareProviders.find(a => a.rolePlayerId === $event.healthCareProviderId);
      this.populatePayee.emit(healthCareProvider);
    } else if (this.payeeType == this.sundryProviderEnum) {
      const sundryProvider = this.sundryProviders.find(a => a.rolePlayerId === $event.rolePlayerId);
      this.populatePayee.emit(sundryProvider);
    } else {
      const beneficiary = this.beneficiaries.find(a => a.rolePlayerId === $event.rolePlayerId);
      this.populatePayee.emit(beneficiary);
    }
    this.clearSearch();
  }

  getUserHealthCareProviders(): void {
    const user = this.authService.getCurrentUser();
    this.healthcareProviderService.filterHealthCareProviders(user.email).subscribe(
      healthCareProviders => {
        if (healthCareProviders) {
          this.healthCareProviders = healthCareProviders;
          this.filteredUserHealthCareProviders = healthCareProviders;

          this.setTable(healthCareProviders);
          this.isLoading$.next(false);
        }
      }
    );
  }

  getUserHealthCareProvidersForInternalUser(searchCriteria: string): void {
    this.healthcareProviderService.filterHealthCareProviders(searchCriteria).subscribe(
      healthCareProviders => {
        if (healthCareProviders) {
          this.healthCareProviders = healthCareProviders;
          this.filteredUserHealthCareProviders = healthCareProviders;

          this.setTable(healthCareProviders);
          this.isLoading$.next(false);
        }
      }
    );
  }

  setTable(dataSource: any) {
    this.dataSource = new MatTableDataSource(dataSource);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.isLoading$.next(false);
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'name', show: +PayeeTypeEnum[this.payeeType] !== PayeeTypeEnum.Individual },
      { def: 'companyNumber', show: +PayeeTypeEnum[this.payeeType] == PayeeTypeEnum.SundryProvider },
      { def: 'practiceNumber', show: +PayeeTypeEnum[this.payeeType] == PayeeTypeEnum.HealthCareProvider },
      { def: 'displayName', show: +PayeeTypeEnum[this.payeeType] == PayeeTypeEnum.Individual },
      { def: 'relation', show: this.payeeType == PayeeTypeEnum.Individual },
      { def: 'identityNumber', show: +PayeeTypeEnum[this.payeeType] == PayeeTypeEnum.Individual },
      { def: 'payeeType', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  formatLookup(lookup: number) {
    let item = PayeeTypeEnum[lookup]
    return item.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  close() {
    this.closePayeeTableEmit.emit(true);
  }
}
