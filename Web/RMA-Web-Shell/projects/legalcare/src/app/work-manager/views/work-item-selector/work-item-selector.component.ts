import { DatePipe } from "@angular/common";
import { UntypedFormGroup, UntypedFormBuilder } from "@angular/forms";
import { Component, OnInit } from "@angular/core";

import { Tenant } from "projects/shared-models-lib/src/lib/security/tenant";

import { WorkItem } from "projects/legalcare/src/app/work-manager/models/work-item";
import { WorkItemType } from "projects/legalcare/src/app/work-manager/models/work-item-type";

@Component({
  selector: "app-work-item-selector",
  templateUrl: "./work-item-selector.component.html",
  styleUrls: ["./work-item-selector.component.css"],
})
export class WorkItemSelectorComponent implements OnInit {
  form: UntypedFormGroup;
  workItem: WorkItem;
  workItemTypes: WorkItemType[];
  selectedWorkType: WorkItemType;
  selectedWizardConfiguration: string;
  loadingWorkItemTypesInProgress = false;
  disableSave = false;
  tenant: Tenant;
  progressText = "";

  newWorkItemId: number;
  constructor(public datepipe: DatePipe) {}
  ngOnInit(): void {}
}
