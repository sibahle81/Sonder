import { Component, OnInit, Inject } from '@angular/core';
import { AccountSearchResult } from '../../../shared/models/account-search-result';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-search-debtor-dialog',
  templateUrl: './search-debtor-dialog.component.html'
})
export class SearchDebtorDialogComponent implements OnInit {
  accountSearchResult: AccountSearchResult;
  titleIcon ='person';
  showSubmit = false;

  constructor(public dialogRef: MatDialogRef<SearchDebtorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: any) { }

  ngOnInit() {
  }

  onAccountSelected(accountSearchResult: AccountSearchResult) {
    this.accountSearchResult = accountSearchResult;
    if (accountSearchResult) {
      this.dialogRef.close(accountSearchResult);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
