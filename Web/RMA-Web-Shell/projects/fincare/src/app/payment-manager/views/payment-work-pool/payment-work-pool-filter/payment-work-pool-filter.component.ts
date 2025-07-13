import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'payment-work-pool-filter',
  templateUrl: './payment-work-pool-filter.component.html',
  styleUrls: ['./payment-work-pool-filter.component.css']
})
export class PaymentWorkPoolFilterComponent extends UnSubscribe implements OnChanges {

  @Input() user: User;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  placeholder$: BehaviorSubject<string> = new BehaviorSubject('search by claim number, employee First Name, surname or Identification Number');

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;
  currentQuery: any;

  users: User[];
  workPools: WorkPoolEnum[];
  filterByUserId: number;
  filteredPools: WorkPoolEnum[] = [];
  selectedWorkPoolType = WorkPoolEnum.PaymentPool;

  paymentPools = [WorkPoolEnum.PaymentPool, WorkPoolEnum.PremiumCashBack];

  constructor(private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    public userService: UserService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookups();
    this.getWorkPoolsForUser();
    this.configureSearch();
  }

  getLookups() {
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
  }

  search(searchTerm: string) {
    this.currentQuery = searchTerm;
    if (this.currentQuery.length >= 3) {
      this.currentQuery = this.currentQuery.trim();
    }
  }

  refreshLoading($event) {
    this.isLoading$.next($event);
  }

  getWorkPoolsForUser() {
    this.workPools.forEach(
      workPool => {
        const pool = +WorkPoolEnum[workPool] as WorkPoolEnum;
        if (this.paymentPools.indexOf(pool) >= 0) {
          let permissionName = this.getWorkPoolType(workPool);
          if (this.userHasPermission(permissionName)) {
            this.filteredPools.push(workPool);
          }
        }
      }
    );
    this.createForm();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      searchTerm: [{ value: null, disabled: false }],
      filter: [{ value: this.setDefaultPool(), disabled: false }],
      filterUser: [{ value: 0, disabled: false }],
      typeOfDisease: [{ value: '', disabled: this.selectedWorkPoolType != +WorkPoolEnum.CadPool }],
    });
    this.isLoading$.next(false);
  }

  getWorkPoolType(type: any) {
    return this.formatText(type);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  setDefaultPool(): WorkPoolEnum {
    const workPoolType = this.filteredPools ? this.filteredPools[0] : null;
    if (!workPoolType) { return null; }
    this.getUsersForPool(workPoolType.toString());
    this.selectedWorkPoolType = +WorkPoolEnum[workPoolType];
    return workPoolType;
  }

  selectedWorkPoolChanged($event: any) {
    this.users = null;
    this.selectedWorkPoolType = +WorkPoolEnum[$event.value];
    this.form.controls.searchTerm.setValue('');
    this.isLoading$.next(true);
    this.getUsersForPool($event.value);
  }

  getUsersForPool($event: string) {
    if (!$event) { return };
    let permission = this.formatText($event);
    this.userService.getUsersByPermission(permission).subscribe(result => {
      if (result) {
        this.users = result.filter(a => a.roleId != 1 || a.id != this.user.id);
        this.form.controls.filterUser.enable();
      }
    });
  }

  filterByUserName($event: any) {
    this.filterByUserId = $event.value;
    this.search(this.filterByUserId.toString());
  }
}

