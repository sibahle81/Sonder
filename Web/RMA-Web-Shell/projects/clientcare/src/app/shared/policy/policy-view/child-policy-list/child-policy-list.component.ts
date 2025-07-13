import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InsuredLifeStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/insured-life-status.enum';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { ChildPolicyListDataSource } from './child-policy-list.datasource';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { debounceTime } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { PolicyGroupMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-group-member';
import { Router } from '@angular/router';

@Component({
  selector: 'child-policy-list',
  templateUrl: './child-policy-list.component.html',
  styleUrls: ['./child-policy-list.component.css']
})
export class ChildPolicyListComponent implements OnInit, OnChanges {

  @Input() policyId: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: any;
  dataSource: ChildPolicyListDataSource;
  searchTerm = '';

  constructor(
    private readonly policyService: PolicyService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router
  ) {
    this.dataSource = new ChildPolicyListDataSource(this.policyService);
  }

  ngOnInit() {
    this.createForm();
    this.configureSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.policyId) {
      this.createForm();
      this.configureSearch();
      this.searchTerm = this.policyId.toString();
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
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
      this.search(response as string);
    });
  }

  search(searchTerm: string) {
    this.searchTerm = `${this.policyId.toString()},${searchTerm ? searchTerm : ''}`;
    if (!this.searchTerm || this.searchTerm.length > 2) {
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
  }

  reset() {
    this.searchTerm = '';

    this.form.patchValue({
      searchTerm: this.searchTerm
    });
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getPolicyStatus(policyStatus: PolicyStatusEnum): string {
    return this.formatText(PolicyStatusEnum[policyStatus]);
  }

  getInsuredLifeStatus(insuredLifeStatus: InsuredLifeStatusEnum): string {
    return this.formatText(InsuredLifeStatusEnum[insuredLifeStatus]);
  }

  getRolePlayerType(rolePlayerTypeEnum: RolePlayerTypeEnum): string {
    return this.formatText(RolePlayerTypeEnum[rolePlayerTypeEnum]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'policyNumber', show: true },
      { def: 'clientReference', show: true },
      { def: 'policyStatus', show: true },
      { def: 'memberName', show: true },
      { def: 'idNumber', show: true },
      { def: 'dateOfBirth', show: true },
      { def: 'insuredLifeStatus', show: true },
      { def: 'policyJoinDate', show: true },
      { def: 'premium', show: true },
      { def: 'actions', show: true },
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  navigate($event: PolicyGroupMember) {
    this.router.navigate([`/clientcare/member-manager/holistic-role-player-view/${$event.rolePlayerId}/1/${$event.policyId}`]);
  }
}
