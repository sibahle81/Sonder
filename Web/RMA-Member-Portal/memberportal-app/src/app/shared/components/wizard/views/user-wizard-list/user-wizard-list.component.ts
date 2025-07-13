import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { Wizard } from '../../shared/models/wizard';
import { UserWizardListDatasource } from './user-wizard-list.datasource';

@Component({
  templateUrl: './user-wizard-list.component.html',
  // tslint:disable-next-line:component-selector
  selector: 'user-wizard-list',
  styleUrls: ['./user-wizard-list.component.css']
})
export class UserWizardListComponent implements OnInit {
  get isError(): boolean { return this.dataSource.isError; }
  get isLoading(): boolean { return this.dataSource.isLoading; }
  displayedColumns = ['name', 'type', 'createdBy', 'lockedStatus', 'wizardStatusText', 'overAllSLAHours', 'actions'];
  placeHolder = 'Filter tasks by name, type, created by or status...';
  searchText: string;
  @Input() wizardConfigIds: string;
  @Input() title: string;
  @Input() filterOnLinkedItemId: number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  currentUser: string;

  constructor(
    private readonly router: Router,
    public readonly dataSource: UserWizardListDatasource,
    private readonly authService: AuthService) {
  }

  ngOnInit() {
    this.title = !this.title ? 'My Tasks' : this.title;
    this.currentUser = this.authService.getCurrentUser().username;
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.getData(this.wizardConfigIds, this.filterOnLinkedItemId);
    this.clearInput();

  }

  formatWizardType(type: string) {
    const temp = type.replace('-', ' ');
    return temp.replace('-', ' ').replace(/(\b[a-z](?!\s))/g, a => a.toUpperCase());
  }


  onSelect(item: Wizard): void {
    let itemType = item.type;
    if (item.type === 'inter-debtor-transfer' || item.type === 'claims-interbank-transfer') {
      itemType = 'inter-bank-transfer';
    }
    Wizard.redirect(this.router, itemType, item.id);
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  searchData(data) {
    this.applyFilter(data);
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator.firstPage();
  }

  filterOnLinkedItem(filterOnLinkedItemId: number) {
    this.dataSource.getData(this.wizardConfigIds, filterOnLinkedItemId);
    this.dataSource.paginator.firstPage();
  }
}
