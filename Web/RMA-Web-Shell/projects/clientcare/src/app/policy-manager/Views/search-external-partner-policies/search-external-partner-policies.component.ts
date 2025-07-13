import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { ExternalPartnerPolicyData } from '../../shared/entities/external-partner-policy-data';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SearchExternalPartnerPoliciesDataSource } from './search-external-partner-policies.datasource';
import { FormBuilder } from '@angular/forms';
import { PolicyService } from '../../shared/Services/policy.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-search-external-partner-policies',
  templateUrl: './search-external-partner-policies.component.html',
  styleUrls: ['./search-external-partner-policies.component.css']
})
export class SearchExternalPartnerPoliciesComponent extends PermissionHelper implements OnInit, OnChanges {


  @Input() triggerReset: boolean;
  @Input() title ='Search External Partner Policies';

  @Output() debtorSelectedEmit = new EventEmitter<ExternalPartnerPolicyData>();
  @Output() resetEmit = new EventEmitter<boolean>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: SearchExternalPartnerPoliciesDataSource;

  form: any;

  searchTerm = '';
  selectedDebtor: ExternalPartnerPolicyData;

  constructor(
      private readonly formBuilder: FormBuilder,
      private readonly policyService: PolicyService,
  ) {
      super();
      this.dataSource = new SearchExternalPartnerPoliciesDataSource(this.policyService);
  }

  ngOnInit() {
      this.createForm();
      this.configureSearch();
      this.getData();
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes && changes.triggerReset && (changes.triggerReset.currentValue === false || changes.triggerReset.currentValue === true)) {
          this.reset();
      } else {
          this.getData();
      }
  }

  createForm(): void {
      if (this.form) { return; }
      this.form = this.formBuilder.group({
          searchTerm: [{ value: null, disabled: false }]
      });
  }

  configureSearch() {
      this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
          this.search(response as string);
      });
  }

  search(searchTerm: string) {
      this.searchTerm = searchTerm;
      if (!this.searchTerm || this.searchTerm === '') {
          this.getData();
      } else {
          this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
          this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
          this.getData();
      }
  }

  getData() {
      this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
  }

  memberSelected(member: ExternalPartnerPolicyData) {
      this.selectedDebtor = member;
      this.debtorSelectedEmit.emit(this.selectedDebtor);
  }

  reset() {
      this.searchTerm = null;
      this.selectedDebtor = null;

      if (this.form) {
          this.form.patchValue({
              searchTerm: this.searchTerm
          });
      }

      this.getData();

      this.resetEmit.emit(!this.triggerReset);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
      const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
      return Object.keys(anyEnum)
          .filter(StringIsNumber)
          .map(key => anyEnum[key]);
  }

  // getClientType(clientType: ClientTypeEnum) {
  //     return this.formatLookup(ClientTypeEnum[clientType]);
  // }

  // getIndustryClass(industryClass: IndustryClassEnum) {
  //     return this.formatLookup(IndustryClassEnum[industryClass]);
  // }

  formatLookup(lookup: string) {
      return lookup ? lookup.replace(/([a-z])([A-Z])/g, '$1 $2') : 'N/A';
  }

  getDisplayedColumns() {
      const columnDefinitions = [
          { def: 'policyNumber', show: true },
          { def: 'productName', show: true },
          { def: 'policyInceptionDate', show: true },
          { def: 'clientFirstName', show: true },
          { def: 'clientSurname', show: true },
          { def: 'policyStatus', show: true },
          { def: 'policyGrossPremium', show: true },
          { def: 'actions', show: true }
      ];
      return columnDefinitions
          .filter(cd => cd.show)
          .map(cd => cd.def);
  }
}
