import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DebtorSearchResult } from '../../../shared/models/debtor-search-result';

@Component({
  selector: 'app-member-letter-of-good-standing',
  templateUrl: './member-letter-of-good-standing.component.html',
  styleUrls: ['./member-letter-of-good-standing.component.css']
})
export class MemberLetterOfGoodStandingComponent implements OnInit{
  rolePlayerId = 0;
  panelOpenState = true;
  constructor() { }
 
  ngOnInit(): void {
  }

  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.rolePlayerId = debtorSearchResult.roleplayerId;
    this.panelOpenState = false;
  }
}
