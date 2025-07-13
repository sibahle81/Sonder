import {  Component, OnInit, ViewChild, Input, Output,EventEmitter  } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { merge, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { isNullOrUndefined } from 'util';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { TariffSearchDataSource } from 'projects/medicare/src/app/medi-manager/datasources/tariff-search-datasource';


@Component({
  selector: 'app-medical-tariff',
  templateUrl: './medical-tariff.component.html',
  styleUrls: ['./medical-tariff.component.css']
})
export class MedicalTariffComponent implements OnInit {

  @Input() showNavigation:boolean = false;
  @Input() practitionerName:string = "";
  @Output() onSearchClose: EventEmitter<boolean> = new EventEmitter();
  @Output() onTariffSelect: EventEmitter<any> = new EventEmitter();

  form: UntypedFormGroup;
  tariffTypes: any=[];
  practitionerTypes: Lookup[];
  selectedTariffId: number;
  showViewMedicalTariff:boolean = false;
  selectedRowIndex = -1;

  displayedColumns: string[] = ['tariffId','tariffCode', 'tariffType','tariffDescription','validFrom','validTo','itemCost','defaultQuantity','practitionerType','basicUnitCost','recomendedUnits','unitType'];

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  tariffSearchDataSource: TariffSearchDataSource;
  pageSize: number = 5;
  pageIndex: number = 0;
  orderBy: string = "tariffId";
  sortDirection: string = "desc";

  loading$ = new BehaviorSubject<boolean>(false);
  search$ = new BehaviorSubject<string>(null);
  showSearchProgress: boolean;

  constructor(private readonly formBuilder: UntypedFormBuilder,
    public datepipe: DatePipe,
    readonly mediCarePreAuthService: MediCarePreAuthService,
    private router: Router,
    private readonly lookupService: LookupService,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService) {
      this.getLookups();
    }

  ngOnInit() {
    this.createForm();
  }

  getLookups() {
    this.getTariffTypes();
    this.getPractitionerTypes();
  }

  createForm() {
    this.form = this.formBuilder.group({
      tariffCode: [''],
      tariffType: [''],
      tariffDescription: [''],
      practitionerName: [{ value :this.practitionerName, disabled: true} ],
      practitionerType: [''],
      tariffDate: ['']
    });
    this.tariffSearchDataSource = new TariffSearchDataSource(this.mediCarePreAuthService);
   
  }

  onResetForm() {
    this.form.reset();
  }

  getTariffTypes(){
    let tariffTypeTemp = [];
    this.mediCarePreAuthService.getTariffTypes().subscribe(
       (x) => {
        tariffTypeTemp = x;
      },
      () => { },
      () => {
        if (tariffTypeTemp) {
          tariffTypeTemp.forEach(x => {
            this.tariffTypes.push({'id': x.id, 'name': x.name, 'description':x.description});
          });
        }
      });
  }

  getPractitionerTypes(): void {
    this.lookupService.getMedicalPractitionerTypes().subscribe(data => {
      this.practitionerTypes = data;
      this.practitionerTypes.pop();
    });
  }

  ngAfterViewInit(): void {

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0
    });

    this.tariffSearchDataSource.rowCount$.subscribe(count => {
      this.paginator.length = count
    });


    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
            this.onMedicalTariffSearch();
        })
      ).subscribe();
  }

  onMedicalTariffSearch() {
    this.sortDirection = isNullOrUndefined(this.sort.direction) || this.sort.direction == "" ? "desc" : this.sort.direction;
    this.orderBy = isNullOrUndefined(this.sort.active) || this.sort.active == "" ? "tariffId" : this.sort.active;
    this.pageIndex = this.paginator.pageIndex;
    this.pageSize = this.paginator.pageSize > 0 ? this.paginator.pageSize : 5;

    
    let searchParams: {[key: string]:any} = {};

    searchParams.practitionerTypeId = -1;

    if(this.form.controls.tariffCode.value != null && this.form.controls.tariffCode.value != ''){
      searchParams.tariffCode = this.form.controls.tariffCode.value;
    }
    if(this.form.controls.tariffType.value != null && this.form.controls.tariffType.value != ''){
      searchParams.tariffTypeId = this.form.controls.tariffType.value;
    }
    if(this.form.controls.tariffDescription.value != null && this.form.controls.tariffDescription.value != ''){
      searchParams.tariffDescription = this.form.controls.tariffDescription.value;
    }
    if(this.form.controls.practitionerType.value != null && this.form.controls.practitionerType.value != ''){
      searchParams.practitionerTypeId = this.form.controls.practitionerType.value;
    }
    if(this.form.controls.tariffDate.value != null && this.form.controls.tariffDate.value != ''){
      searchParams.tariffDate = this.datepipe.transform(this.form.controls.tariffDate.value, 'yyyy-MM-dd');
    }
    
    this.tariffSearchDataSource.getData(this.pageIndex + 1, this.pageSize, this.orderBy, this.sortDirection, JSON.stringify(searchParams));
    
  }

  onMedicalTariffReset() {
    this.form.reset();
    this.form.controls['practitionerName'].setValue(this.practitionerName);
  }

  viewMedicalTariff(tariffRow){
   this.selectedTariffId = tariffRow.tariffId;
   this.showViewMedicalTariff = true;
   this.selectedRowIndex = tariffRow.tariffId;
  }

  onClose(){
    this.showViewMedicalTariff = false;
  }

  onNavigateBack(){
    this.onSearchClose.emit(true);
  }

  onSubmit(event){
    this.onTariffSelect.emit(event);
  } 
}
