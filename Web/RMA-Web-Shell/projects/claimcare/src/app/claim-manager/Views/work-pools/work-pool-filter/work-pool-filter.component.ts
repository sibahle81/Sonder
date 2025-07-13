import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { debounceTime } from 'rxjs/operators';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { DiseaseType } from '../../../shared/entities/diseaseType';
import { DiseaseTypeEnum } from '../../../shared/enums/disease-type-enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralSearchTypeEnum } from 'projects/shared-components-lib/src/lib/referrals/paged-referral-search/referral-search-type-enum';

@Component({
  selector: 'work-pool-filter',
  templateUrl: './work-pool-filter.component.html',
  styleUrls: ['./work-pool-filter.component.css']
})
export class WorkPoolFilterComponent extends UnSubscribe implements OnChanges {

  @Input() user: User;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  placeholder$: BehaviorSubject<string> = new BehaviorSubject('search by pev number, claim number, employee name, identification number');

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;
  currentQuery: any;
  isUserBox = false;

  users: User[];
  filteredUsers: User[];
  workPools: WorkPoolEnum[];
  typeOfDiseases: DiseaseTypeEnum[];
  filterByUserId: number;
  filteredPools: WorkPoolEnum[] = [];
  selectedWorkPoolType = WorkPoolEnum.CadPool;
  selectedUser = String.Empty;

  wizardConfigs: string = '';
  orderOverride: string = '';

  cadPool = WorkPoolEnum.CadPool;

  targetModuleType = ModuleTypeEnum.ClaimCare;

  constructor(private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    public userService: UserService,
  ) {
    super();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getWorkPoolsForUser();
    this.configureSearch();
  }

  getLookups() {
    this.typeOfDiseases = this.ToArray(DiseaseTypeEnum);
    this.workPools = this.ToArray(WorkPoolEnum);
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

    this.form.get('searchUserList').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
      let filter = response.toLowerCase();
      this.filteredUsers = this.setData(filter, this.filteredUsers, this.users);
    });
  }

  search(searchTerm: string) {
    this.currentQuery = searchTerm;
    if (this.currentQuery.length >= 3) {
      this.currentQuery = this.currentQuery.trim();
    }
  }

  searchUserBox($event) {
    this.isUserBox = $event;

    this.form.patchValue({
      filterUser: 'Unassigned'
    })
  }

  getWorkPoolsForUser() {
    this.workPools.forEach(workPool => {
      let permissionName = this.getWorkPoolType(workPool)
      if (this.userHasPermission(permissionName)) {
        if (+WorkPoolEnum.FuneralClaims !== +WorkPoolEnum[workPool]) {
          this.filteredPools.push(workPool);
        }
      }
    });
    this.createForm();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      searchTerm: [{ value: null, disabled: false }],
      searchUserList: [{ value: null, disabled: false }],
      filter: [{ value: this.setDefaultPool(), disabled: false }],
      filterUser: [{ value: 'Unassigned', disabled: false }],
      typeOfDisease: [{ value: '', disabled: false }],
    });
  }

  getWorkPoolType(type: any) {
    return this.formatText(type);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  setDefaultPool(): WorkPoolEnum {
    const workPoolType = this.filteredPools ? this.filteredPools[0] : null;
    this.getUsersForPool(workPoolType.toString());
    this.selectedWorkPoolType = +WorkPoolEnum[workPoolType];
    this.selectWizard(this.selectedWorkPoolType);
    return workPoolType;
  }

  selectedWorkPoolChanged($event: any) {
    this.isLoading$.next(true);
    this.users = null;
    this.selectedWorkPoolType = +WorkPoolEnum[$event.value];
    this.form.controls.searchTerm.setValue('');

    this.getUsersForPool($event.value);
    this.selectWizard(this.selectedWorkPoolType);
  }

  filterByUserName($event: any) {
    this.isLoading$.next(true);
    const searchValue = $event.value;
    const workPoolType = this.form.controls.filter.value;
    this.selectedWorkPoolType = +WorkPoolEnum[workPoolType];
    this.selectedUser = searchValue;
    this.form.controls.searchTerm.setValue('');

    this.getUsersForPool(this.form.controls.filter.value);
    if (searchValue !== null && searchValue !== undefined) {
      this.filteredUsers = this.users.filter(user =>
        user.id.toString().includes(searchValue)
      );
    } else {
      this.filteredUsers = this.users;
    }
  }

  selectWizard(selectedWorkPoolType: WorkPoolEnum) { // this should be permission driven as the framework dictates, this is the incorrect implementation of the framework
    this.orderOverride = '';

    switch (selectedWorkPoolType) {
      case WorkPoolEnum.InvestigationPool:
        this.wizardConfigs = '147';
        break;
      case WorkPoolEnum.CadPool:
        this.wizardConfigs = '77,128';
        break;
      case WorkPoolEnum.EarningsAssessorPool:
        this.orderOverride = 'FATAL';
        this.wizardConfigs = '166,192,197';
        break;
      case WorkPoolEnum.ScaPool:
        this.wizardConfigs = '';
        break;
      case WorkPoolEnum.CcaPool:
        this.wizardConfigs = '158,169,182,183,193,176,171,136,70,199';
        break;
      case WorkPoolEnum.CcaTeamLeadPool:
        this.wizardConfigs = '';
        break;
      case WorkPoolEnum.ClaimsAssessorPool:
        this.wizardConfigs = '169,156';
        break;
      case WorkPoolEnum.CmcPool:
        this.wizardConfigs = '161,195,194,202,203,170';
        break;
      case WorkPoolEnum.CompliancePool:
        this.wizardConfigs = '';
        break;
      case WorkPoolEnum.ScaTeamLeadPool:
        this.wizardConfigs = '156';
        break;
    }
  }

  getUsersForPool($event: string) {
    if (!$event) { return };
    let permission = this.formatText($event);
    this.userService.getUsersByPermission(permission).subscribe(result => {
      if (result) {
        this.users = result.filter(a => a.roleId != 1 || a.id != this.user.id);
        this.filteredUsers = result.filter(a => a.roleId != 1 || a.id != this.user.id);
        this.form.controls.filterUser.enable();
      }
      this.isLoading$.next(false);
    });
  }

  setData(filter: string, filteredList: any, originalList: any) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    } else {
      return filteredList.filter(user => user.displayName.toLocaleLowerCase().includes(filter));
    }
  }

  diseaseTypeChange(filterValue: string) {
    this.currentQuery = filterValue;

    this.form.patchValue({
      searchTerm: this.currentQuery
    });
  }
}
