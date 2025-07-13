import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pensioncase-overview',
  templateUrl: './pensioncase-overview.component.html',
  styleUrls: ['./pensioncase-overview.component.css']
})
export class PensionCaseOverviewComponent implements OnInit {
  pensioncaseSearching: boolean;

  constructor() {
  }

  ngOnInit(): void {

  }

  emitt($event: boolean) {

    this.pensioncaseSearching = $event;
  }
}
