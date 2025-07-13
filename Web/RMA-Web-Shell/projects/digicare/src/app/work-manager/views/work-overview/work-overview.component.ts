import { Component, OnInit } from '@angular/core';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-work-overview',
  templateUrl: './work-overview.component.html',
  styleUrls: ['./work-overview.component.css']
})
export class WorkOverviewComponent implements OnInit {


  constructor() { }

  ngOnInit() {

  }

  loadWizard() { }

  canAddWorkItem(): boolean {
    return userUtility.hasPermission('Create work item');
  }

}
