import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { ActivatedRoute } from "@angular/router";
import { WizardService } from "projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service";
import { map } from "rxjs/operators";

@Component({
  selector: "lib-view-approvals",
  templateUrl: "./view-approvals.component.html",
  styleUrls: ["./view-approvals.component.css"],
})
export class ViewApprovalsComponent implements OnInit {
  displayedColumns = ["actionBy", "actionDate", "status", "reason"];
  wizardApprovalStages = [];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("filter", { static: true }) filter: ElementRef;
  currentQuery: any;
  errorMessage = "";

  constructor(
    readonly wizardService: WizardService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.getWizardApprovalStage(+params.id);
      }
    });
  }

  getWizardApprovalStage(id: number) {
    this.wizardApprovalStages = [];
    this.errorMessage = "";
    this.wizardService
      .GetWizardApprovalStages(id)
      .pipe(
        map((data) => {
          if (data.length > 0) {
            this.wizardApprovalStages = [...data];
          } else {
            this.errorMessage =
              "No approval stages found using search criteria";
          }
        })
      )
      .subscribe();
  }

  search() {
    this.currentQuery = this.filter.nativeElement.value;
    if (this.currentQuery) {
      this.getWizardApprovalStage(+this.currentQuery);
    }
  }

  keyPress(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }
}
