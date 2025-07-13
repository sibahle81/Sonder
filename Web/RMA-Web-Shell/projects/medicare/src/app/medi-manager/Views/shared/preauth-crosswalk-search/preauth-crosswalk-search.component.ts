import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged } from 'rxjs/operators';
import { CrosswalkSearchDataSource } from 'projects/medicare/src/app/medi-manager/datasources/crosswalk-search-datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CrosswalkSearchComponentService } from 'projects/medicare/src/app/medi-manager/services/crosswalkSearchService';
import { Router } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { fromEvent, merge } from 'rxjs';
import { CrosswalkSearch } from 'projects/medicare/src/app/medi-manager/models/crosswalk-search';
import { TreatmentCodeSearchService } from 'projects/medicare/src/app/medi-manager/services/treatmentCodeSearch.service';
import { TreatmentCode } from 'projects/medicare/src/app/medi-manager/models/treatmentCode';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { isNullOrUndefined } from 'util';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';

@Component({
	selector: 'preauth-crosswalk-search',
	templateUrl: './preauth-crosswalk-search.component.html',
	styleUrls: ['./preauth-crosswalk-search.component.css']
})

export class CrosswalkSearchComponent implements OnInit {
	@Input() tariffSearchType: string;
	@Input() tariffTypeId: number;
    @Input() preAuthFromDate: Date;
	@Input() practitionerTypeId: number;
	form: UntypedFormGroup;
	currentQuery: string;
	displayedColumns: string[] = ['tariffCode', 'tariffDescription', 'treatmentCode', 'treatmentCodeDescription', 'defaultQuantity', 'tariffAmount', 'requestedQuantity', 'requestedAmount', 'select'];
	today = new Date();
	checks: boolean[] = [];
	showSearchProgress = false;
	treatmentCode: TreatmentCode;
	currentTreatmentCodeList: TreatmentCode[];
	crosswalkSearchList: CrosswalkSearch[];

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('filter', { static: false }) filter: ElementRef;
	dataSource: CrosswalkSearchDataSource;
	datePipe: any;

	constructor(
		readonly mediCarePreAuthService: CrosswalkSearchComponentService,
		private readonly treatmentCodeSearchService: TreatmentCodeSearchService,
		private readonly router: Router,
		private readonly formBuilder: UntypedFormBuilder,
		private readonly authService: AuthService,
		private readonly lookupService: LookupService,
        private readonly preauthBreakdownComponent: PreauthBreakdownComponent,
        readonly confirmservice: ConfirmationDialogsService,) { }

	ngOnInit(): void {
		this.dataSource = new CrosswalkSearchDataSource(this.mediCarePreAuthService);
		this.paginator.pageIndex = 0;
		this.crosswalkSearchList = [];
		this.createForm();
	}

	ngAfterViewInit(): void {
		this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
		this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
	}

	search(): void {
		if (!this.form) return;
		if (this.preAuthFromDate) {
			const form = this.form.controls;
			this.showSearchProgress = true;
			let treatmentCodesQuery = new TreatmentCode;
			treatmentCodesQuery.code = form.itemCode.value.trim();
			this.sort.active = 'treatmentCodeId';

			this.treatmentCodeSearchService.search(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, JSON.stringify(treatmentCodesQuery)).subscribe(
				(res) => {
					if (res.data != null) {
						this.currentTreatmentCodeList = res.data;
						this.treatmentCode = new TreatmentCode();
						this.treatmentCode.treatmentCodeId = res.data[0].treatmentCodeId;
						this.treatmentCode.description = res.data[0].description;
						form.itemDescription.setValue(res.data[0].description);
						this.loadData(this.treatmentCode);
					}
					else {
						this.treatmentCode = new TreatmentCode();
						this.treatmentCode.treatmentCodeId = -1;
						form.itemDescription.setValue('');
						this.loadData(this.treatmentCode);
					}
				});
		}
		else {
			this.confirmservice.confirmWithoutContainer('Date Validation', `Please select date From.`, 'Center', 'Center', 'OK').subscribe(result => { });
		}
	}

	loadData(treatmentCode: TreatmentCode): void {
		let queryData = new CrosswalkSearch;
		queryData.treatmentCodeId = treatmentCode.treatmentCodeId;
		queryData.practitionerTypeId = this.practitionerTypeId;
		queryData.tariffTypeId = this.tariffTypeId;
		queryData.tariffDate = this.preAuthFromDate;
		this.sort.active = 'tariffId';
		this.paginator.length = 0;
		this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction == '' ? "desc" : this.sort.direction, JSON.stringify(queryData));
	}

	calculateRequestedQty(requestedQuantity: number, crosswalkSearch: CrosswalkSearch) {
		if(!isNullOrUndefined(crosswalkSearch)) {
			crosswalkSearch.requestedAmount = crosswalkSearch.tariffAmount * requestedQuantity;
		}
	}

	onSelectCrosswalk(event: any, crosswalkSearch: CrosswalkSearch, treatmentCode: string) {
		if (event.checked) {
			crosswalkSearch.treatmentCode = treatmentCode;
			this.addItemtoCrosswalkSearchList(crosswalkSearch);
		}
		else {
			this.removeItemFromCrosswalkSearchList(crosswalkSearch);
		}
	}

	createForm(): void {
		if (this.form) { return; }

		this.form = this.formBuilder.group({
			itemCode: new UntypedFormControl(''),
			itemDescription: new UntypedFormControl({ value: '', disabled: true })
		});
	}

	addItemtoCrosswalkSearchList(crosswalkSearch: CrosswalkSearch): void {
		if (this.crosswalkSearchList !== undefined) {
			this.crosswalkSearchList.push(crosswalkSearch);
		}
		else {
			this.crosswalkSearchList = [];
			this.crosswalkSearchList.push(crosswalkSearch);
		}
		this.preauthBreakdownComponent.setCPTItems(this.crosswalkSearchList);		
	}

	removeItemFromCrosswalkSearchList(crosswalkSearch: CrosswalkSearch): void {
		let crosswalkSearchListCurrent = this.crosswalkSearchList.filter(({ tariffCode, tariffId, practitionerTypeId }) => tariffCode !== crosswalkSearch.tariffCode && tariffId !== crosswalkSearch.tariffId && practitionerTypeId !== crosswalkSearch.practitionerTypeId);
      	this.crosswalkSearchList = crosswalkSearchListCurrent;
	}

	reset(): void{
		this.crosswalkSearchList = [];
		if (!this.form) return;
		this.form.controls.itemCode.setValue('');
		this.form.controls.itemDescription.setValue('');
		this.paginator.length = 0;
	}

}