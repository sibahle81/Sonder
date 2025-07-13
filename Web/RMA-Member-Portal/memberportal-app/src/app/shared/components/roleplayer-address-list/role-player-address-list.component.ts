import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RolePlayerAddressDetailsComponent } from './role-player-address-details/role-player-address-details.component';
import { RolePlayerAddressListDataSource } from './role-player-address-list.datasource';
import { BehaviorSubject } from 'rxjs';
import { UnSubscribe } from '../../common/unsubscribe';
import { RolePlayer } from '../../models/roleplayer';
import { Lookup } from '../../models/lookup.model';
import { RolePlayerService } from '../../services/roleplayer.service';
import { LookupService } from '../../services/lookup.service';
import { RolePlayerAddress } from '../../models/role-player-address';
import { AddressTypeEnum } from '../../enums/address-type.enum';

@Component({
  selector: 'role-player-address-list',
  templateUrl: './role-player-address-list.component.html',
  styleUrls: ['./role-player-address-list.component.css']
})
export class RolePlayerAddressListComponent extends UnSubscribe implements OnChanges {

  addPermission = 'Add Address';
  editPermission = 'Edit Address';
  viewPermission = 'View Address';
  viewAuditPermission = 'View Audits';

  @Input() rolePlayer: RolePlayer;
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  @Output() rolePlayerAddressEditedEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  dataSource: RolePlayerAddressListDataSource;
  currentQuery: any;
  selectedRolePlayer: RolePlayer;
  showDetail: boolean;
  countries: Lookup[];
  selectedRowIndex: number;
  selectedRowIndex2: number;

  requiredAddPermission = 'Add Address';

  constructor(
    private readonly rolePlayerService: RolePlayerService,
    public dialog: MatDialog,
    private readonly lookupService: LookupService,
  ) {
    super();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new RolePlayerAddressListDataSource(this.rolePlayerService);
    this.currentQuery = this.rolePlayer.rolePlayerId ? this.rolePlayer.rolePlayerId.toString() : 0;
    this.getWizardData();
  }

  refresh() {
    this.dataSource.refresh$.subscribe(result => {
      if (result && this.dataSource && this.dataSource.data) {
        this.rolePlayer.rolePlayerAddresses = this.dataSource.data.data;
      }
    });
  }

  getData() {
    if (!this.isWizard) {
      this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
      this.refresh();
    }
  }

  getWizardData() {
    if (this.isWizard) {
      if (this.rolePlayer.rolePlayerAddresses) {
        this.dataSource.getWizardData(this.rolePlayer.rolePlayerAddresses, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
      } else {
        this.dataSource.getWizardData([], this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
      }
    }
  }

  viewDetails(rolePlayer: RolePlayer) {
    this.selectedRolePlayer = rolePlayer;
    this.showDetail = true;
  }

  closeDetails() {
    this.showDetail = false;
    this.reset();
  }

  reset() {
    this.selectedRolePlayer = null;
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getType(id: number) {
    const addresstype = AddressTypeEnum[id];
    return addresstype;
  }

  getLookups() {
    this.getCountries();
  }

  getCountries(): void {
    this.lookupService.getCountries().subscribe(data => {
      this.countries = data;
    });
  }

  add() {
    this.showAddressDialog(null, false);
  }

  showAddressDialog(row: RolePlayerAddress, isReadOnly: boolean) {
    const dialogRef = this.dialog.open(RolePlayerAddressDetailsComponent, {
      width: '70%',
      data: {
        address: row,
        isReadOnly: isReadOnly,
        isWizard: false,
        addresses: this.dataSource.data.data
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      this.isLoading$.next(true);
      if (data && data?.length > 0 && !isReadOnly) {
        this.rolePlayer.rolePlayerAddresses = data;
        this.dataSource.getWizardData(data, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
        this.rolePlayerAddressEditedEmit.emit(true);
        this.isLoading$.next(false);

      } else if (!isReadOnly) {
        this.getData();
        this.isLoading$.next(false);
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  getCountryName(id: number): string {
    if (this.countries && this.countries?.length > 0) {
      return this.countries.find(s => s.id === id).name;
    }
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'isPrimary', show: true },
      { def: 'addressType', show: true },
      { def: 'addressLine1', show: true },
      { def: 'addressLine2', show: true },
      { def: 'postalCode', show: true },
      { def: 'city', show: true },
      { def: 'province', show: true },
      { def: 'countryId', show: true },
      { def: 'effectiveDate', show: true },
      { def: 'actions', show: true },
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

}
