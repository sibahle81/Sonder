import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuoteV2 } from '../../models/quoteV2';

@Component({
  templateUrl: './quote-search.component.html',
  styleUrls: ['./quote-search.component.css']
})
export class QuoteSearchComponent implements OnInit {
  constructor(
    private readonly router: Router
  ) { }

  ngOnInit() { }

  navigate($event: QuoteV2) {
    this.router.navigate([`/clientcare/quote-manager/quote-view/${$event.quoteId}`]);
  }
}
