import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ClinicalUpdateService } from 'projects/medicare/src/app/hospital-visit-manager/services/hospital-visit.service';
import { ClinicalUpdate } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update.interface';
import { UntypedFormControl } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ClinicalUpdateSearchDataSource } from 'projects/medicare/src/app/hospital-visit-manager/datasources/clinicalupdate-search-datasource';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { ClinicalUpdateStatus } from 'projects/medicare/src/app/medi-manager/enums/hospital-visit-status-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'app-list-hospital-visit',
  templateUrl: './list-hospital-visit.component.html',
  styleUrls: ['./list-hospital-visit.component.css']
})
export class ListHospitalVisitComponent implements OnInit {

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  dataSource: ClinicalUpdate[];
  displayedColumns: string[] = ['preAuthNumber', 'diagnosis', 'medication', 'comments', 'visitCompletionDate', 'dischargeDate', 'subsequentCare', 'updateSequenceNo', 'Status','clinicalUpdateId', 'reviewHospitalVisitReport', 'editHospitalVisitReport'];
  clinicalUpdatesList: any;
  searchControl = new UntypedFormControl();
  currentPreAuth = new PreAuthorisation();
  currentHCP = new HealthCareProvider();
  isLoading: boolean = false;
  isInternalUser: boolean = false;

  clinicalUpdateSearchDataSource: ClinicalUpdateSearchDataSource;
  pageSize: number = 5;
  pageIndex: number = 0;
  orderBy: string = "clinicalUpdateId";
  sortDirection: string = "desc";

  constructor(private router: Router,
    private clinicalUpdateService: ClinicalUpdateService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private readonly authService: AuthService
  ) { }

  ngOnInit() {
    this.clinicalUpdateSearchDataSource = new ClinicalUpdateSearchDataSource(this.clinicalUpdateService);
    this.clinicalUpdateSearchDataSource.loading$
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;    
  }

  ngAfterViewInit(): void {

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0
    });

    this.clinicalUpdateSearchDataSource.rowCount$.subscribe(count => {
      this.paginator.length = count
    });

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
            this.search();
        })
      ).subscribe();

    let personEventId = sessionStorage.getItem('personEventId') as unknown as number;    
    if (!isNullOrUndefined(personEventId) && personEventId > 0) {
      this.getMedicalVisitReportList(personEventId);   
    }else{
      this.getMedicalVisitReportList();  
    }
  }

  search(): void {
    this.getMedicalVisitReportList(this.searchControl.value);    
  }
  getMedicalVisitReportList(searchValue?: any){

    this.sortDirection = isNullOrUndefined(this.sort.direction) || this.sort.direction == "" ? "desc" : this.sort.direction;
    this.orderBy = isNullOrUndefined(this.sort.active) || this.sort.active == "" ? "clinicalUpdateId" : this.sort.active;
    this.pageIndex = this.paginator.pageIndex;
    this.pageSize = this.paginator.pageSize > 0 ? this.paginator.pageSize : 5;

    if(searchValue){
      searchValue = searchValue?.trim();
    }
    else
    {
      searchValue = '';
    }

    this.clinicalUpdateSearchDataSource.getData(this.pageIndex + 1, this.pageSize, this.orderBy, this.sortDirection, searchValue);
  }

  newHospitalVisit() {
    this.router.navigate(['medicare/hospital-visit-manager/hospital-visits/new/-1']);
  }

  viewHospitalVisitReport(clinicalUpdateId: number, preAuthId: number): void{
    this.router.navigate(['medicare/hospital-visit-manager/clinical-updates/view/', clinicalUpdateId]);
  }

  reviewHospitalVisitReport(clinicalUpdateId: number): void{
    this.router.navigate(['medicare/hospital-visit-manager/hospital-visits/review', clinicalUpdateId], { state: { clinicalUpdateId: clinicalUpdateId } });
  }

  editHospitalVisitReport(clinicalUpdateId: number): void{
    this.router.navigate(['medicare/hospital-visit-manager/hospital-visits/edit/', clinicalUpdateId], { state: { clinicalUpdateId: clinicalUpdateId } });
  }

  showReview(clinicalUpdateStatus: number) {
    let canReview = true;
    if(!this.isInternalUser)
    {
      canReview = false;
    }
    else if (PreAuthStatus.Authorised === clinicalUpdateStatus) {
      canReview = false;
    }
    return canReview;
  }

  showEdit(clinicalUpdateStatus: number) {
    let canEdit = true;

    if(!this.isInternalUser && PreAuthStatus.Authorised === clinicalUpdateStatus){
      canEdit = false;
    }
    
    return canEdit;
  }

  getClinicalUpdateStatus(clinicalUpdateStatus: number): string {
    let clinicalUpdteStatus = "";
    if(clinicalUpdateStatus){
     clinicalUpdteStatus = ClinicalUpdateStatus[clinicalUpdateStatus].replace(/([a-z])([A-Z])/g, '$1 $2');
    }
    return clinicalUpdteStatus;
  }
}
