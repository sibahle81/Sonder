import { Component, OnInit } from '@angular/core';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';

@Component({
  selector: 'app-legal-home',
  templateUrl: './legal-home.component.html',
  styleUrls: ['./legal-home.component.css']
})
export class LegalHomeComponent implements OnInit {

  targetModuleType = ModuleTypeEnum.LegalCare;
  
  constructor() { }

  ngOnInit() {
  }

}
