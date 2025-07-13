import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Policy } from '../../../policy-manager/shared/entities/policy';
import { PolicyStatusEnum } from '../../../policy-manager/shared/enums/policy-status.enum';
import { PolicyService } from '../../../policy-manager/shared/Services/policy.service';


@Component({
  selector: 'app-policies-per-status-widget',
  templateUrl: './policies-per-status-widget.component.html',
  styleUrls: ['./policies-per-status-widget.component.css']
})
export class PoliciesPerStatusWidgetComponent implements OnInit {

  allPolicies: Policy[];
  form: FormGroup;
  hasData = false;
  isLoading = false;
  hideToggle: boolean;
  hasTotalPolicies = false;
  filteredPolicies: Policy[];
  numberOfPolicies: number;

  // Pie chart details
  public chartType = 'pie';
  public data: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  public chartOptions: any = { responsive: true };
  public chartLabels: Array<any> = ['Active', 'Cancelled', 'Continued', 'Expired', 'Lapsed', 'Legal', 'Not Taken Up', 'paused'
    , 'Pending Cancelled', 'Pending Continuation', 'Pending First Premium', 'Pending Re-Instatement', 'Pre-Legal', 'reInstated', 'transferred'];

  public chartColors: Array<any> = [{
    backgroundColor: ['#E56D99', '#f59d38', '#a68e3f', '#e8e517', '#55bbbd', '#90e86b', '#ed5345', '#ad979c', '#5062eb', '#b1bdbc', '#ffffff', '#4b364d', '#b1bdbc', '#ffffff', '#4b364d'],
    hoverBackgroundColor: ['#e61c66', '#f5880c', '#a88613', '#e8e517', '#10e7eb', '#53e815', '#ed2513', '#ab8a92', '#293fe6', '#7e8584', '#ffffff', '#4e2452', '#b1bdbc', '#ffffff', '#4b364d'],
    borderWidth: 2,
  }];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly policyService: PolicyService,
  ) {
    this.loadLookupLists();
  }

  loadLookupLists(): void {
    this.getPoliciesPerProduct(false);
  }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group({});
  }

  getPoliciesPerProduct(hasTotalPolicies: boolean) {
    if (hasTotalPolicies) {
      this.filteredPolicies = this.allPolicies;
      this.setPageData(this.filteredPolicies);
    } else {
      this.policyService.getPolicies().subscribe(result => {
        this.allPolicies = result;
        this.filteredPolicies = result;
        this.setPageData(this.filteredPolicies);
      });
    }
  }

  // Setting the piechart and deactivating if no data
  setPageData(result: Policy[]) {
    if (result.length > 0) {
      this.setPieChartData(result);
    } else {
      this.isLoading = false;
      this.hasData = false;
    }
  }

  // Set the pie chart with filtered data
  setPieChartData(policies: Policy[]) {
    this.numberOfPolicies = policies.length;
    const active = this.getStatusLength(PolicyStatusEnum.Active, policies);
    const cancelled = this.getStatusLength(PolicyStatusEnum.Cancelled, policies);
    const continued = this.getStatusLength(PolicyStatusEnum.Continued, policies);
    const expired = this.getStatusLength(PolicyStatusEnum.Expired, policies);
    const lapsed = this.getStatusLength(PolicyStatusEnum.Lapsed, policies);
    const legal = this.getStatusLength(PolicyStatusEnum.Legal, policies);
    const notTakenUp = this.getStatusLength(PolicyStatusEnum.NotTakenUp, policies);
    const paused = this.getStatusLength(PolicyStatusEnum.Paused, policies);
    const pendingCancelled = this.getStatusLength(PolicyStatusEnum.PendingCancelled, policies);
    const pendingContinuation = this.getStatusLength(PolicyStatusEnum.PendingContinuation, policies);
    const pendingFirstPremium = this.getStatusLength(PolicyStatusEnum.PendingFirstPremium, policies);
    const pendingReInstatement = this.getStatusLength(PolicyStatusEnum.PendingReinstatement, policies);
    const preLegal = this.getStatusLength(PolicyStatusEnum.PreLegal, policies);
    const reInstated = this.getStatusLength(PolicyStatusEnum.Reinstated, policies);
    const transferred = this.getStatusLength(PolicyStatusEnum.Transferred, policies);

    this.data = [active, cancelled, continued, expired, lapsed, legal, notTakenUp, paused
      , pendingCancelled, pendingContinuation, pendingFirstPremium, pendingReInstatement, preLegal, reInstated, transferred];
    this.hasData = true;
    this.isLoading = false;
  }

  getStatusLength(policyStatus: PolicyStatusEnum, policies: Policy[]): number {
    return policies.filter(c => c.policyStatus === policyStatus).length;
  }

  // The method being called by the period filter
  filterDate(backDate: Date, todayDate: Date) {
    const result = this.filteredPolicies.filter(a => new Date(a.createdDate) >= backDate && new Date(a.createdDate) <= todayDate);
    this.setPageData(result);
  }

  public chartHovered(e: any): void { }
}
