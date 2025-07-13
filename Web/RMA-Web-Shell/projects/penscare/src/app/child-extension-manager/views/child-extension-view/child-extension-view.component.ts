import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChildToAdultPensionLedger } from '../../../shared-penscare/models/child-to-adult-pension-ledger.model';

@Component({
  selector: 'app-child-extension-view',
  templateUrl: './child-extension-view.component.html',
  styleUrls: ['./child-extension-view.component.css']
})
export class ChildExtensionViewComponent implements OnInit {

  model: ChildToAdultPensionLedger;
  loadedTab: any;
  beneficiaryRolePlayerId: number;
  recipientRolePlayerId: number;
  isLoading: boolean;

  constructor(
    private readonly activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.beneficiaryRolePlayerId) {
        this.beneficiaryRolePlayerId =  params.beneficiaryRolePlayerId;
        this.recipientRolePlayerId = params.recipientRolePlayerId;
        this.loadBeneficiary();
      }
    });
  }

  loadNotes() {
    // this.loadedTab = null;
    // this.pensCareService.getNotes(this.pensionCaseId, 'PensionCase').subscribe(result => {
    //   this.notes = result
    //   this.loadedTab='notes';
    //   this.cdr.detectChanges();
    // });
  }

  loadBeneficiary() {
    this.isLoading = false;
    this.model  = {
      beneficiaryRolePlayerId: this.beneficiaryRolePlayerId
    }
    this.loadedTab = 'beneficiary-details'
  }

  loadRecipient() {
    this.isLoading = false;
    this.model  = {
      recipientRolePlayerId: this.recipientRolePlayerId
    }
    this.loadedTab = 'recipient-details'
  }
}
