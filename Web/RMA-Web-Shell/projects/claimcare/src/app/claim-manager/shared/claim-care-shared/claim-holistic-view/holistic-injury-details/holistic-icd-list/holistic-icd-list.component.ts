import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { HolisticIcdListDataSource } from './holistic-icd-list.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EventTypeEnum } from '../../../../enums/event-type-enum';

@Component({
  selector: 'holistic-icd-list',
  templateUrl: './holistic-icd-list.component.html',
  styleUrls: ['./holistic-icd-list.component.css']
})
export class HolisticIcdListComponent implements OnChanges {

  @Input() icd10List = [];
  @Input() eventType = EventTypeEnum.Accident;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  displayedColumns: string[] = ['ICD10Code', 'ICD10CodeDescription'];
  dataSource: HolisticIcdListDataSource;
  currentQuery: any;

  constructor(
    private readonly icd10CodeService: ICD10CodeService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new HolisticIcdListDataSource(this.icd10CodeService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    this.currentQuery = this.icd10List;
    this.getData();
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
