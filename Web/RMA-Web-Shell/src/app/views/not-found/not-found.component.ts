import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private readonly router: Router) { }

  ngOnInit() {
  }

  goHome(): void {
    //TODO need to determine user home page based on user role
    this.router.navigate(['clientcare']);
  }
}
