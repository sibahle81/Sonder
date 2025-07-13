import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';

import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
 
import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { WorkItemTypeEnum } from 'projects/marketingcare/src/app/work-manager/models/enum/work-item-type.enum';
import { WorkItem } from 'projects/marketingcare/src/app/work-manager/models/work-item';
import { MarketingCareService } from 'projects/marketingcare/src/app/marketing-manager/services/marketingcare.service';
import { WorkItemSearchDataSource } from 'projects/marketingcare/src/app/work-manager/datasources/work-item-search-datasource';

@Component({
  selector: 'app-work-item-search',
  templateUrl: './work-item-search.component.html',
  styleUrls: ['./work-item-search.component.css']
})
export class WorkItemSearchComponent implements OnInit, AfterViewInit {
  form: UntypedFormGroup;
  currentQuery: string;
  displayedColumns: string[] = ['description', 'workItemState', 'createdBy', 'additionalInformation', 'modifiedDate', 'workItemIForWizard'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  dataSource: WorkItemSearchDataSource;

  constructor(private readonly router: Router, private readonly wizardService: WizardService, private readonly wizardConfigurationService: WizardConfigurationService,
                private readonly marketingService: MarketingCareService) { }
  ngAfterViewInit(): void {
    
  }

  ngOnInit() {
    this.dataSource = new WorkItemSearchDataSource(this.marketingService);
  }

  
}
