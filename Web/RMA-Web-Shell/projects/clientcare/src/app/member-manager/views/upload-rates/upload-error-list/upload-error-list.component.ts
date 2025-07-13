import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UploadErrorListDataSource } from './upload-error-list.datasource';
import { DeclarationService } from '../../../services/declaration.service';

@Component({
  selector: 'upload-error-list',
  templateUrl: './upload-error-list.component.html',
  styleUrls: ['./upload-error-list.component.css']
})
export class UploadErrorListComponent implements OnChanges {

  @Input() fileIdentifier: string;
  @Output() hasErrorsEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['fileName', 'errorCategory', 'errorMessage', 'excelRowNumber'];

  form: UntypedFormGroup;
  dataSource: UploadErrorListDataSource;
  currentQuery: any;

  constructor(
    private readonly declarationService: DeclarationService,
    public dialog: MatDialog
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.fileIdentifier) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new UploadErrorListDataSource(this.declarationService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.fileIdentifier.toString();
      this.getData();
      this.hasData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  hasData() {
    this.dataSource.hasData$.subscribe(result => {
      this.hasErrorsEmit.emit(result);
    });
  }
}
