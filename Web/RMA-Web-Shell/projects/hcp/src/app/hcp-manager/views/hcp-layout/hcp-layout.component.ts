import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleMenuComponent } from 'projects/shared-components-lib/src/lib/menu/module-menu.component';
@Component({
  styleUrls: ['../../../../../../../assets/css/site.css'],
  templateUrl: './hcp-layout.component.html'
})
export class HcpLayoutComponent extends ModuleMenuComponent{
  
  constructor(readonly router: Router){
    super(router);
  }
}
