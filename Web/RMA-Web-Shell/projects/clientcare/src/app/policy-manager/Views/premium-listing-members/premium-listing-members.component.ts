import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { PremiumListingMemberDatasource } from '../../datasources/premium-listing-member.datasource';
import { PremiumListingService } from '../../shared/Services/premium-listing.service';
import { PremiumListing } from '../../shared/entities/premium-listing';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';

@Component({
  selector: 'app-premium-listing-members',
  templateUrl: './premium-listing-members.component.html',
  styleUrls: ['./premium-listing-members.component.css']
})
export class PremiumListingMembersComponent extends WizardDetailBaseComponent<PremiumListing> implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  
  dataSource: PremiumListingMemberDatasource;

  memberColumns = ['memberName', 'idNumber', 'dateOfBirth', 'age', 'memberType', 'benefitName', 'benefitAmount'];

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly premiumListingService: PremiumListingService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }
  
  ngOnInit(): void {
    this.dataSource = new PremiumListingMemberDatasource(this.premiumListingService);
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }
  
  loadData(): void {
    if (!this.model) { return; }
    const fileIdentifier = this.model.fileIdentifier;
    const pageNumber = this.paginator.pageIndex + 1;
    const pageSize = this.paginator.pageSize;
    this.dataSource.getData(pageNumber, pageSize, fileIdentifier);
  }

  onLoadLookups() {}

  createForm() {}

  populateForm() {
    if (!this.model) { return; }
    if (!this.dataSource) { return; }
    this.loadData();
  }

  populateModel() {}

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
