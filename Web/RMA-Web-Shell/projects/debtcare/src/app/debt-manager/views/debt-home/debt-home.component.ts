import { Component, OnInit } from '@angular/core';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';

@Component({
  selector: 'app-debt-home',
  templateUrl: './debt-home.component.html',
  styleUrls: ['./debt-home.component.css']
})
export class DebtHomeComponent implements OnInit {

  targetModuleType = ModuleTypeEnum.DebtCare;

  constructor() { }

  ngOnInit() {
  }

}
