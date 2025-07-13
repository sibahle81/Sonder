import { Component, ViewChild, AfterViewChecked, OnInit, AfterViewInit } from '@angular/core';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Brokerage } from '../../models/brokerage';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { BrokerConsultant } from '../../models/broker-consultant';
import { SelectionModel } from '@angular/cdk/collections';
import { BrokerageService } from '../../services/brokerage.service';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BrokerItemTypeEnum } from '../../models/enums/broker-item-type.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'brokerage-consultant',
  templateUrl: './brokerage-consultant.component.html',
  styleUrls: ['./brokerage-consultant.component.css']
})
export class BrokerageConsultantComponent extends WizardDetailBaseComponent<Brokerage> {


  firstName: string;
  displayName: string;
  step: string;
  isWizard: boolean;
  rowCount: number;
  form: UntypedFormGroup;
  displayedColumns = ['select', 'displayName', 'email', 'isActive'];
  currentQuery: string;
  datasourceConsultants = new MatTableDataSource<BrokerConsultant>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  consultants: BrokerConsultant[];
  selection = new SelectionModel<BrokerConsultant>(true, []);
  selectedConsultants: BrokerConsultant[] = [];
  selectedConsultantIds: number[] = [];
  loadingBrokerages = false;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly brokerageService: BrokerageService,
    public dialog: MatDialog
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  loadConsultants(selectConsultants: BrokerConsultant[]) {
    this.loadingBrokerages = true;
    const sortDirection = this.sort.direction ? this.sort.direction : 'asc';
    this.brokerageService.getAllBrokerConsultants(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, sortDirection, this.currentQuery)
      .subscribe(result => {
        this.consultants = result.data;
        this.maintainState(selectConsultants);
        this.datasourceConsultants.data = this.consultants;
        this.rowCount = result.rowCount;
        this.loadingBrokerages = false;
      });
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id]
    });
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
    this.model.brokerageBrokerConsultantIds = this.selectedConsultantIds;
    this.model.brokerageBrokerConsultants = this.selectedConsultants;
    if (this.model.id > 0) {
      this.model.brokerageBrokerConsultants.forEach(c => c.brokerageId = this.model.id);
    }
  }

  populateForm(): void {
    if (this.model.brokerageBrokerConsultants) {
      if (this.model.brokerageBrokerConsultantIds)
        {
          this.selectedConsultantIds = this.model.brokerageBrokerConsultantIds;
        }else {
          this.selectedConsultantIds = this.model.brokerageBrokerConsultants.map(consultant => consultant.id);
        }
      
      this.selectedConsultants = this.model.brokerageBrokerConsultants; 
      this.datasourceConsultants.data = this.model.brokerageBrokerConsultants;
    }
    
    if (!this.isDisabled) {
      this.loadConsultants(this.selectedConsultants);
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model.brokerageBrokerConsultantIds === undefined || this.model.brokerageBrokerConsultantIds.length === 0) {
      validationResult.errorMessages = ['No consultants added'];
      validationResult.errors = 1;
    }
    return validationResult;
  }

  addConsultant(event: any, consultant: BrokerConsultant) {
    this.selectedConsultantIds = [];
    let index = -2;
    this.selectedConsultants.forEach((element, i) => {
      if (element.id === consultant.id) {
        index = i;
      }
    });
    if (event.checked) {
      if (index < 0) {
        this.selectedConsultants.push(consultant);
      }
    } else {
      if (index > -1) {
        this.selectedConsultants.splice(index, 1);
      }
    }
    this.selectedConsultants.forEach(c => this.selectedConsultantIds.push(c.id));
  }

  maintainState(selectedConstultans: BrokerConsultant[]) {
    this.selectedConsultantIds = [];
    this.selectedConsultants = selectedConstultans;
    this.selectedConsultants.forEach(c => this.selectedConsultantIds.push(c.id));
  }

  onPaginateChange() {
    this.loadConsultants(this.selectedConsultants);
  }

  openAuditDialog() {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.BrokerageManager,
        clientItemType: BrokerItemTypeEnum.BrokerageBrokerConsultant,
        itemId: this.model.id,
        heading: 'Brokerage Consultant Details Audit',
        propertiesToDisplay: ['BrokerageId', 'UserId']
      }
    });
  }
}
