import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SearchEventDataSource } from './search-event.datasource';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { Router } from '@angular/router';
import { EventModel } from '../../../shared/entities/personEvent/event.model';

@Component({
  selector: 'app-search-event',
  templateUrl: './search-event.component.html',
  styleUrls: ['./search-event.component.css']
})
export class SearchEventComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }

  form: UntypedFormGroup;
  currentQuery: string;
  displayedColumns = ['eventReferenceNumber', 'eventType', 'eventStatus', 'adviseMethod', 'dateAdvised', 'numberOfPeopleInvolved', 'actions'];

  constructor(
    private readonly router: Router,
    public readonly claimCareService: ClaimCareService,
    public readonly dataSource: SearchEventDataSource,
  ) { }

  ngOnInit(): void {
    this.getAllevents();
  }

  getAllevents(): void {
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.getData();
    this.dataSource.isLoading = false;
  }

  onSelected(item: EventModel): void {
    this.router.navigate(['claimcare/claim-manager/event-manager/event/event-details', item.eventId]);
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
