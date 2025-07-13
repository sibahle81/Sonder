import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TransactionsService } from '../../services/transactions.service';
import { map } from 'rxjs/operators';
import { PendingInterestDate } from '../../models/pending-interest-date';

@Component({
  selector: 'app-adhoc-interest-months-dialog',
  templateUrl: './adhoc-interest-months-dialog.component.html',
  styleUrls: ['./adhoc-interest-months-dialog.component.css']
})
export class AdhocInterestMonthsDialogComponent implements OnInit, AfterViewInit {
  isLoading = false;
  interestDates: PendingInterestDate[] = [];
  interestDateIds: number[] = [];
  interestTransactionId: number;
  errorMessage = '';
  constructor(public dialogRef: MatDialogRef<AdhocInterestMonthsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder, private transactionService: TransactionsService
  ) {
    this.interestTransactionId = data.transactionId;
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.transactionService.getDatesPendingInterest(this.interestTransactionId).pipe(map(data => {
      if (data && data.length > 0) {
        let dates = [...data];
        dates.forEach(c => c.itemId = ([...data].indexOf(c) + 1));
        this.datasource.data = [...dates];
      }
      else {
        this.errorMessage = 'No pending interest months found.'
      }
      this.isLoading = false;
    })).subscribe();
  }

  showSubmit = false;
  displayedColumns = ['pendingDate', 'actions'];
  currentQuery: string;
  datasource = new MatTableDataSource<PendingInterestDate>();
  form: UntypedFormGroup;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;


  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  dateChecked(event: any, item: PendingInterestDate) {
    if (event.checked) {
      this.interestDateIds.push(item.itemId);
      this.interestDates.push(item);
    } else {
      this.unTickItem(item.itemId);
    }
  }

  canShowSubmit() {
    if (this.interestDates.length > 0) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }
  }

  unTickItem(itemId: number) {
    for (let i = 0; i < this.interestDates.length; i++) {
      if ((this.interestDateIds[i] === itemId)) {
        this.interestDateIds.splice(i, 1);
        const indexOfItem = this.interestDates.findIndex(c => c.itemId === itemId)
        if (indexOfItem > -1) {
          this.interestDates.splice(indexOfItem, 1);
        }

        break;
      }
    }
  }

  submit() {
    if (this.interestDates.length > 0) {
      this.dialogRef.close({ interestDates: this.interestDates });
    }
    else {
      this.dialogRef.close();
    }
  }

  close() {
    this.dialogRef.close();
  }

  confirmChecked(event: any) {
    if (event.checked) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }
  }
}