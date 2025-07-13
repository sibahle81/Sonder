import { Component, OnInit } from '@angular/core';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(readonly wizardService: WizardService) { }

  ngOnInit(): void {
  }

}
