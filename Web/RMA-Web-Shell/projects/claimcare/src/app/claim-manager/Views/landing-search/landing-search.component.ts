import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { LandingSearchDataSource } from './landing-search.datasource';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClaimCareService } from '../../Services/claimcare.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { FuneralRuleResult } from '../../shared/entities/funeral/funeral-rule-result';
import { DialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/dialog/dialog.component';
import { PersonEventModel } from '../../shared/entities/personEvent/personEvent.model';
import { Router } from '@angular/router';
import { ClaimRuleAuditModel } from '../../shared/entities/claimRuleAudit.model';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-landing-search',
  templateUrl: './landing-search.component.html',
  styleUrls: ['./landing-search.component.css'],
})
export class LandingSearchComponent implements OnInit, AfterViewInit {
  selectedFilterTypeId = 0; // default to Filter
  url: string;
  claimId: number;
  isSearching: boolean;
  filterSearch: string;
  currentAction: string;
  insuredLifeId: string;
  ruleResult: FuneralRuleResult;
  ruleAuditModel: ClaimRuleAuditModel;
  ClaimRuleAuditModelList: ClaimRuleAuditModel[];

  filters: { title: string, id: number }[];
  subMenus: { title: string, url: string, disable: boolean }[];
  rootMenus: { title: string, url: string, submenu: boolean, disable: boolean }[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  form: any;
  router: Router;
  userService: any;
  formBuilder: any;
  currentQuery: any;
  alertService: AlertService;
  claimCareService: ClaimCareService;
  dataSource: LandingSearchDataSource;
  appEventManagerService: AppEventsManager;
  displayedColumns = ['policyNumber', 'productName', 'claimReferenceNumber', 'memberFirstName', 'memberLastName', 'memberRole', 'status', 'employeeNumber', 'actions'];

  constructor(
    router: Router,
    public dialog: MatDialog,
    alertService: AlertService,
    appEventsManager: AppEventsManager,
    claimCareService: ClaimCareService,
    private readonly claimService: ClaimCareService) {

    this.router = router;
    this.alertService = alertService;
    this.claimCareService = claimCareService;
    this.appEventManagerService = appEventsManager;
  }

  ngOnInit(): void {
    this.dataSource = new LandingSearchDataSource(this.claimCareService);
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.currentQuery = this.filter.nativeElement.value;
          if (this.currentQuery.length >= 3) {
            this.paginator.pageIndex = 0;
            this.loadData();
          }
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  loadData() {
    var trimCurrentQuery = this.currentQuery.trim();
    if(this.currentQuery.trim() != ''){
      this.dataSource.getData({
        query: trimCurrentQuery,
        pageNumber: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
        orderBy: this.sort.active,
        sortDirection: this.sort.direction,
      });
    }
  }

  search(): void {
    this.currentQuery = this.filter.nativeElement.value;

    if (this.currentQuery.length >= 3) {
      this.isSearching = true;
      this.loadData();
      this.isSearching = false;
    }
  }

  rootMenuClick(item: any) {
    this.claimId = item.claimId;
    this.insuredLifeId = item.insuredLifeId;
    this.url = 'claimcare/claim-manager/register-funeral-claim/continue/' + item.wizardId;

    // if (!item.isRuleOverridden) {
    //   this.currentAction = 'Getting Person Event...';
    //   this.claimService.getFatal(item.claimId).subscribe(result => {
    //     this.executeFuneralRegistrationRules(result);
    //   });
    // } else {
    this.router.navigateByUrl(this.url);
    // }
  }

  executeFuneralRegistrationRules(personEventModel: PersonEventModel) {
    this.currentAction = 'Executing fatal claim registration rules...';
    this.claimService.ExecuteFatalClaimRegistrationRules(personEventModel).subscribe(result => {
      this.ruleResult = result.ruleResult;
      personEventModel.ruleResult = this.ruleResult;
      if (this.ruleResult.passed) {
        this.router.navigateByUrl(this.url);
      } else {
        this.openRuleDialog();
      }
    });
  }

  openRuleDialog(): void {
    const messageList: string[] = [];
    const question = 'Business rules failed! Would you like to override?';

    // Adding messages to messageList
    // tslint:disable-next-line: forin
    for (const key in this.ruleResult.messageList) {
      messageList.push(this.ruleResult.messageList[key]);
    }
    // Sending messages to dialog Component
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { question, messageList }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response == null) {
        this.router.navigateByUrl('claimcare/claim-manager/search');
      } else {
        this.claimService.UpdateClaimIsRuleOverridden(this.claimId).subscribe(claimId => {
          // tslint:disable-next-line: forin
          for (const message in messageList) {
            this.ruleAuditModel = new ClaimRuleAuditModel();
            this.ruleAuditModel.claimId = this.claimId;
            this.ruleAuditModel.reason = message;
            this.ruleAuditModel.isResolved = false;
            this.ruleAuditModel.isDeleted = false;
            this.ClaimRuleAuditModelList.push(this.ruleAuditModel);
          }
          this.claimService.AddClaimRuleAudit(this.ClaimRuleAuditModelList).subscribe(result => {
            this.router.navigateByUrl(this.url);
          });
        });
      }
    });
  }

  getWizardId(wizardURL: string) {
    const index = wizardURL.lastIndexOf('/');
    const wizardId = wizardURL.substring(index + 1);
    return wizardId;
  }

  validateQuery() {
    this.form.get('query').setErrors(null);
    this.form.get('query').updateValueAndValidity();
    const query = this.form.get('query').value as string;

    switch (this.selectedFilterTypeId) {
      case 2:
        const maxDigits = query.match('^[0-9]{13}$');
        const numbersOnly = query.match('^[0-9]*$');
        if (maxDigits === null) {
          this.form.get('query').setErrors({ idCheck: true });
        }
        if (numbersOnly === null) {
          this.form.get('query').setErrors({ onlyNumbers: true });
        }
        if (maxDigits !== null && numbersOnly !== null) {
          this.form.get('query').setErrors(null);
          this.form.get('query').updateValueAndValidity();
        }
        break;
      case 7:
        const alphaOnly = query.match('^[a-zA-Z ]+$');
        if (alphaOnly === null) {
          this.form.get('query').setErrors({ onlyAlpha: true });
        }
        if (alphaOnly !== null) {
          this.form.get('query').setErrors(null);
          this.form.get('query').updateValueAndValidity();
        }
        break;
      default: return;
    }
  }

  createForm(): void {
    this.populateSearchFilter();
    this.currentQuery = '';
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      query: new UntypedFormControl('', [Validators.minLength(3), Validators.required])
    });
    this.patchDefaultValues();
  }

  patchDefaultValues() {
    this.form.patchValue({
      filter: this.filters
    });
  }

  selectedFilterChanged($event: any) {
    if (this.filters[0].id === 0) {
      this.filters.shift();
    }
    this.selectedFilterTypeId = $event.value as number;
  }

  populateSearchFilter() {
    this.filters = [
      { title: 'Filter By', id: 0 },
      { title: 'Policy Number', id: 1 },
      { title: 'Identity Number', id: 2 },
      { title: 'Passport Number', id: 3 },
      { title: 'Claim Reference Number', id: 4 },
      // { title: 'Industry Number', id: 5 },
      { title: 'Employee Number', id: 6 },
      { title: 'Name and Surname', id: 7 }
    ];
  }
}
