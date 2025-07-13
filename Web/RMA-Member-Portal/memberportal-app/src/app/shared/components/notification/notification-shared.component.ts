import { Component, OnInit, ElementRef, ViewChild, Inject, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UserDetails } from 'src/app/core/models/security/user-details.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { Wizard } from 'src/app/shared/models/wizard.model';
import { MatTableDataSource } from '@angular/material/table';
import { WizardService } from '../../services/wizard.service';
import { BehaviorSubject } from 'rxjs';


@Component({
  templateUrl: './notification-shared.component.html',
  styleUrls: ['./notification-shared.component.css']
})

export class NotificationSharedComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataSource = new MatTableDataSource<Wizard>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  placeHolder = 'Filter by name, type, created by or status';
  displayedColumns = ['name', 'type', 'createdBy', 'createdDate', 'lockedStatus', 'wizardStatusText', 'actions'];

  title: string;
  type: string;
  searchText: string;
  wizardConfigIds: string;
  currentUser: UserDetails;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly wizardService: WizardService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NotificationSharedComponent>
  ) {
    this.wizardConfigIds = data.wizardConfigIds;
    this.title = data.title;
    this.type = data.type;
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.getData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  getData() {
    this.wizardService.getUserWizards(this.wizardConfigIds, this.currentUser.email, this.currentUser.roleId).subscribe(
      data => {
        this.dataSource.data = data;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      });
  }

  formatWizardType(type: string) {
    const temp = type.replace('-', ' ');
    return temp.replace('-', ' ').replace(/(\b[a-z](?!\s))/g, a => a.toUpperCase());
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  searchData(data: any) {
    this.applyFilter(data);
  }

  close(): void {
    this.dialogRef.close();
  }

  onSelect(item: Wizard): void {
    Wizard.redirect(this.router, item.type, item.id);
    this.close();
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator.firstPage();
  }
}
