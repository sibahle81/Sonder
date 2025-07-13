import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TreatmentCodeSearchDataSource } from 'projects/medicare/src/app/medi-manager/datasources/treatmentCode-search-datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TreatmentCodeSearchService } from 'projects/medicare/src/app/medi-manager/services/treatmentCodeSearch.service';
import { Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { fromEvent, merge } from 'rxjs';
import { TreatmentCode } from '../../../models/treatmentCode';

@Component({
	selector: 'preauth-treatmentcode-search',
  	templateUrl: './preauth-treatmentcode-search.component.html',
  	styleUrls: ['./preauth-treatmentcode-search.component.css']
})

export class PreauthTreatmentCodeSearchComponent implements OnInit {

  form: UntypedFormGroup;
  currentQuery: string;
  displayedColumns: string[] = ['Code', 'Description'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  dataSource: TreatmentCodeSearchDataSource;

  constructor(
    readonly mediCarePreAuthService: TreatmentCodeSearchService,
    private readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly lookupService: LookupService) { }

	ngOnInit(): void {
        this.createForm();
		this.dataSource = new TreatmentCodeSearchDataSource(this.mediCarePreAuthService);
}

ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
	this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
	fromEvent(this.filter.nativeElement, 'keyup')
        .pipe(
            debounceTime(200),
            distinctUntilChanged(),
            tap(() => {
                this.paginator.pageIndex = 0;
                this.loadData();
            })
        )
        .subscribe();

        merge(this.sort.sortChange, this.paginator.page)
        .pipe(
            tap(() => this.loadData())
        )
		.subscribe();
        }
        
		search() {
			this.paginator.pageIndex = 0;
			this.loadData();
		  }
		  
		  loadData(): void {

            if (!this.form) return;
            const form = this.form.controls;

            const treatmentCodesQuery: TreatmentCode = { code: form.treatmentCode.value, description: form.treatmentCodeDescription.value, treatmentCodeId: 0 };
            const treatmentCodesQueryStringified = JSON.stringify(treatmentCodesQuery);            
			this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, treatmentCodesQueryStringified);
          }
          
          createForm(): void {
            if (this.form) { return; }
        
            this.form = this.formBuilder.group({
        
                treatmentCode: new UntypedFormControl(''),
                treatmentCodeDescription: new UntypedFormControl('')
            });
          }

		}
