import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-case-home',
  templateUrl: './event-case-home.component.html',
  styleUrls: ['./event-case-home.component.css']
})

export class EventCaseHomeComponent implements OnInit {

  constructor(public readonly router: Router) { }

  ngOnInit() { }
}
