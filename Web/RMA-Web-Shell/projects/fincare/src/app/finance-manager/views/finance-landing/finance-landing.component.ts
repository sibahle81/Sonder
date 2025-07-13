import { AbilityPostingDatasource } from './../ability-posting-list/ability-posting-list.datasource';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'finance-landing',
  templateUrl: './finance-landing.component.html',
  styleUrls: ['./finance-landing.component.css']
})
export class FinanceLandingComponent implements OnInit {

  constructor(public readonly dataSource: AbilityPostingDatasource) { }

  ngOnInit() {
    // this.dataSource.ngOnInit();
  }

}
