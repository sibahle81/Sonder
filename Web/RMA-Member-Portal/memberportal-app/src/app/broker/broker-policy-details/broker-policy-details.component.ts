import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, merge, of } from 'rxjs';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { BankAccountTypeEnum } from 'src/app/shared/enums/bank-account-type-enum';
import { BankingPurposeEnum } from 'src/app/shared/enums/banking-purpose.enum';
import { IndustryClassTypeEnum } from 'src/app/shared/enums/industry-class-type.enum';
import { IndustryTypeEnum } from 'src/app/shared/enums/industry-type.enum';
import { InsuredLifeStatusEnum } from 'src/app/shared/enums/insured-life-status.enum';
import { PolicyStatus } from 'src/app/shared/enums/policy-status.enum';
import { Contact } from 'src/app/shared/models/contact';
import { Policy } from 'src/app/shared/models/policy';
import { RolePlayerAddress } from 'src/app/shared/models/role-player-address';
import { RolePlayerBankingDetail } from 'src/app/shared/models/role-player-banking-detail';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { Statement } from 'src/app/shared/models/statement';
import { AlertService } from 'src/app/shared/services/alert.service';
import { RolePlayerService } from 'src/app/shared/services/roleplayer.service';
import { BrokerPolicyService } from '../services/broker-policy-service';

@Component({
  selector: 'app-broker-policy-details',
  templateUrl: './broker-policy-details.component.html',
  styleUrls: ['./broker-policy-details.component.scss']
})
export class BrokerPolicyDetailsComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isLoadingPolicy$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingRolePlayer$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingBanking$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingAddress$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingStatement$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  policyId: number;
  policy: Policy;
  policies: Policy[] = [];
  clientName: string;
  policyNumber: string;
  policyOwner: RolePlayer;
  rolePlayerAddress: RolePlayerAddress;
  rolePlayerBankingDetail: RolePlayerBankingDetail;
  gender: string;
  contact: Contact;
  statements: Statement[];
  smallScreen = false;

  annualPremium = 0.00;
  monthlyPremium = 0.00;

  redPolicyStatus = ['Cancelled', 'Expired', 'Lapsed', 'Legal', 'Not Taken Up'];
  amberPolicyStatus = ['Paused', 'Pending Cancelled', 'Pending Continuation', 'Pending First Premium', 'Pending Reinstatement', 'Pre Legal'];
  greenPolicyStatus = ['Active'];
  bluePolicyStatus = ['Transferred', 'Reinstated', 'Premium Waivered', 'Premium Waived'];

  finPayeeClass = '';
  placeHolder = ConstantPlaceholder.SearchByDescription;
  searchText: string;
  public searchContainsNothing: boolean;
  public hidePaginator = false;

  displayedColumns: string[] = ['Month', 'Description', 'Debit', 'Credit'];
  public dataSource = new MatTableDataSource<Statement>();


  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly policyService: BrokerPolicyService,
    private readonly alertService: AlertService,
    private readonly rolePlayerService: RolePlayerService,
    public readonly router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      this.smallScreen = result.matches;
    });
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.policyId = params.id;
        this.getPolicyDetails(params.id);
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getPolicyDetails(policyId: number) {
    this.isLoadingPolicy$.next(true);
    this.policyService.getPolicy(policyId).subscribe(result => {
      this.getAccountHistory(result.policyId);
      this.policy = result;
      this.policies.push(result);
      this.getFinPayeeDetails();
      this.clientName = result.clientName;
      this.annualPremium = this.policy.annualPremium;
      this.monthlyPremium = this.policy.installmentPremium;
      this.getPolicyOwner(this.policy.policyOwnerId);
      this.getBanking(this.policy.policyPayeeId);
      this.isLoadingPolicy$.next(false);
    }, error => { this.alertService.error(error.message); this.isLoadingPolicy$.next(false); });
  }


  getPolicyOwner(policyOwnerId: number) {
    this.isLoadingRolePlayer$.next(true);
    this.rolePlayerService.GetMemberPortalPolicyRolePlayer(policyOwnerId).subscribe(result => {
      this.policyOwner = result;
      this.rolePlayerAddress = result.rolePlayerAddresses.find(a => a.addressType == 2);
      this.contact = new Contact();
      this.contact.email = result.emailAddress;
      this.contact.mobileNumber = result.cellNumber;
      this.contact.telephoneNumber = result.tellNumber;
      this.contact.name = this.clientName;
      this.isLoadingRolePlayer$.next(false);

      if (this.policyOwner.person) {
        this.SetGender();
      }
    });
  }

  getBanking(rolePlayerId: number) {
    this.isLoadingBanking$.next(true);
    this.rolePlayerService.getBankingDetailsByRolePlayerId(rolePlayerId).subscribe(results => {
      const mostRecentDate = new Date(Math.max.apply(null, results.map(e => {
        return new Date(e.effectiveDate);
      })));
      this.rolePlayerBankingDetail = results.filter(e => { const d = new Date(e.effectiveDate); return d.getTime() === mostRecentDate.getTime(); })[0];
      this.isLoadingBanking$.next(false);
    }, error => { this.alertService.error(error.message); this.isLoadingPolicy$.next(false); });
  }

  SetGender() {
    const idNumber = this.policyOwner.person.idNumber;
    if (idNumber) {
      const genderNumber = idNumber.substring(6);
      const gender = genderNumber.substring(0, 4);
      // tslint:disable-next-line: radix
      const sex = parseInt(gender);
      if (sex > 0 && sex < 4999) {
        this.gender = ConstantPlaceholder.Female;
      } else if (sex > 5000 && sex < 9999) {
        this.gender = ConstantPlaceholder.Male;
      }
    }
  }

  getAccountType(accountTypeId: number): string {
    const statusText = BankAccountTypeEnum[accountTypeId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getPurpose(purposeId: number): string {
    const statusText = BankingPurposeEnum[purposeId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getStatus(policyStatusId: number): string {
    const statusText = PolicyStatus[policyStatusId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  back() {
    this.router.navigateByUrl('broker-policy-list');
  }

  getInsuredLifeStatus(insuredLifeStatusId: number): string {
    const statusText = InsuredLifeStatusEnum[insuredLifeStatusId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getPolicyStatus(policyStatusId: number): string {
    const statusText = PolicyStatus[policyStatusId];
    return statusText.replace(/([A-Z])/g, ' $1').trim();
  }

  getAccountHistory(policyId: number) {
    this.isLoadingStatement$.next(true);
    this.policyService.getStatementByPolicy(policyId).subscribe(statements => {
      this.searchContainsNothing = false;
      this.dataSource.data = statements;
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
      this.isLoadingStatement$.next(false);
    });
  }

  getFinPayeeDetails() {
    this.rolePlayerService.getFinPayee(this.policy.policyOwnerId).subscribe(data => {
      switch (data.industryId) {
        case IndustryTypeEnum.DefaultMetals:
          this.finPayeeClass = IndustryClassTypeEnum[2];
          return this.finPayeeClass.replace(/([A-Z])/g, ' $1').trim();
        case IndustryTypeEnum.DefaultMining:
          this.finPayeeClass = IndustryClassTypeEnum[1];
          return this.finPayeeClass.replace(/([A-Z])/g, ' $1').trim();
        case IndustryTypeEnum.Individual:
          this.finPayeeClass = IndustryClassTypeEnum[4];
          return this.finPayeeClass.replace(/([A-Z])/g, ' $1').trim();
        default: this.finPayeeClass = IndustryClassTypeEnum[3];
          return this.finPayeeClass.replace(/([A-Z])/g, ' $1').trim();
      }
    });
  }

  searchData(data) {
    this.applyFilter(data);
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator.firstPage();

    this.setPaginatorFilter(this.dataSource.paginator.length);
  }

  setPaginatorFilter(paginatorLength: number) {
    if (paginatorLength === 0) {
      this.searchContainsNothing = true;
      this.hidePaginator = true;
    } else {
      this.searchContainsNothing = false;
      this.hidePaginator = false;
    }
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  fillTable(isData) {
    if (isData) {
      this.searchContainsNothing = false;
      this.hidePaginator = false;
    }
  }
}
