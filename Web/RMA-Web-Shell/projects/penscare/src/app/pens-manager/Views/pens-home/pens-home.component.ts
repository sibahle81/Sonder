import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';

@Component({
  selector: 'app-pens-home',
  templateUrl: './pens-home.component.html',
  styleUrls: ['./pens-home.component.css']
})
export class PensHomeComponent extends ModuleMenuComponent implements OnInit {
  loadingMessage: string;
  error: Error;
  canRefund: boolean;


  constructor(
    readonly router: Router) {
    super(router);
  }

  ngOnInit() {

  }
}
