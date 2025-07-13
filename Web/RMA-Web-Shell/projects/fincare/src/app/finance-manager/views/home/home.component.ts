import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
 url: string;
  constructor(public readonly router: Router,
              private readonly route: ActivatedRoute) { }

  ngOnInit() {
    if (this.router.url === '/fincare/finance-manager') {
      this.url = '/fincare/finance-manager';
    } else {
      this.url = '';
    }

  }
}
