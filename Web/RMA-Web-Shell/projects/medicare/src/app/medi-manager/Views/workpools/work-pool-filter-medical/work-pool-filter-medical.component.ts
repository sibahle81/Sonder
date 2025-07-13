import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-work-pool-filter-medical',
  templateUrl: './work-pool-filter-medical.component.html',
  styleUrls: ['./work-pool-filter-medical.component.css']
})
export class WorkPoolFilterMedicalComponent extends UnSubscribe implements OnChanges, OnInit {

  @Input() user: User;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  placeholder$: BehaviorSubject<string> = new BehaviorSubject('search by Hcp, claim number, employee name, identification number');

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;
  currentQuery: any;
  isUserBox = false;

  users: User[];
  filteredUsers: User[];
  workPools: { id: number, name: string }[] = [];
  workPoolsPermissions: { id: number, name: string }[] = [];
  filterByUserId: number;
  filteredPools: { id: number, name: string }[] = [];
  selectedWorkPoolType = WorkPoolEnum.MAAMedicalPool;
  selectedUser = String.Empty;
  wizardConfigs: string = '';
  targetModuleType = ModuleTypeEnum.MediCare;

  constructor(private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    public userService: UserService,
  ) {
    super();
    this.getLookups();
  }
  ngOnInit(): void {
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.configureSearch();
  }

  getLookups() {
    const workpools = this.ToKeyValuePair(WorkPoolEnum);
    this.workPools = workpools.filter(c => c.id == +WorkPoolEnum.MAAMedicalPool
      || c.id == +WorkPoolEnum.MIAMedicalPool || c.id == +WorkPoolEnum.MICMedicalPool || c.id == +WorkPoolEnum.CSAMedicalPool);

    this.workPoolsPermissions = workpools.filter(c => c.id == +WorkPoolEnum.MAAMedicalPool
      || c.id == +WorkPoolEnum.MIAMedicalPool || c.id == +WorkPoolEnum.MICMedicalPool || c.id == +WorkPoolEnum.CSAMedicalPool);


    this.getWorkPoolsForUser();
    const miaWorkpoolIndex = this.workPools.findIndex(c => c.id == +WorkPoolEnum.MIAMedicalPool);
    this.workPools[miaWorkpoolIndex].name = 'HCP Registration Pool';
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums).filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
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
    this.filteredPools = this.workPoolsPermissions;
    this.workPoolsPermissions.forEach(workPool => {
      let permissionName = this.getWorkPoolType(workPool.name)
      if (permissionName && permissionName.length > 0 && this.userHasPermission(permissionName)) {
        if (!this.filteredPools.some(c => c.id == workPool.id))
          this.filteredPools.push(workPool);
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
      filterUser: [{ value: 'Unassigned', disabled: false }]
    });
  }

  getWorkPoolType(type: string) {
    return this.formatText(type);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  setDefaultPool(): WorkPoolEnum {
    const workPoolType = this.filteredPools ? this.filteredPools[0] : null;
    this.getUsersForPool(workPoolType.name.toString());
    this.selectedWorkPoolType = +workPoolType.id;
    this.selectWizard(this.selectedWorkPoolType);
    return this.selectedWorkPoolType;
  }

  selectedWorkPoolChanged($event: any) {
    this.isLoading$.next(true);
    this.users = null;
    this.selectedWorkPoolType = $event.value;
    this.form.controls.searchTerm.setValue('');
    this.getUsersForPool($event.source.triggerValue);
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

  //207 added on all lists until we can clean up workpool. The wizard should be wizard config driven as designed
  //not driven by external components to manage logic already available
  selectWizard(selectedWorkPoolType: WorkPoolEnum) {
    switch (selectedWorkPoolType) {
      case WorkPoolEnum.MAAMedicalPool:
        this.wizardConfigs = '67,70,74,145,141,176,175,207';
        break;
      case WorkPoolEnum.MICMedicalPool:
        this.wizardConfigs = '77,128,207';
        break;
      case WorkPoolEnum.MIAMedicalPool:
        this.wizardConfigs = '181,188,189,80,81,207';
        break;
      case WorkPoolEnum.CSAMedicalPool:
        this.wizardConfigs = '77,128,207';
        break;
      default:
        this.wizardConfigs = '207';
        break;
    }
  }

  getUsersForPool($event: string) {
    if (!$event) { return };
    let permission = this.formatText($event);
    if ($event.toLocaleLowerCase() === 'hcp  registration  pool') {
      permission = this.formatText('MIAMedicalPool');;
    }
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
}
