import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InitiatePensionCaseData } from 'projects/penscare/src/app/shared-penscare/models/initiate-pensioncase-data.model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { BehaviorSubject } from 'rxjs';

class ComponentInputData {
  public model: InitiatePensionCaseData
}

@Component({
  selector: 'app-pension-banking-details-tab',
  templateUrl: './pension-banking-details-tab.component.html',
  styleUrls: ['./pension-banking-details-tab.component.css']
})
export class PensionBankingDetailsTabComponent implements OnInit {
  @Input() componentInputData: ComponentInputData;
  rolePlayerIDs: number[] = [];
  rolePlayers: RolePlayer[] = [];
  isLoading: boolean  = false;
  
  constructor(private readonly _rolePlayerService: RolePlayerService,) { }

  ngOnInit(): void {
   this.setRolePlayerIds();
   this.getRolePlayerDetails();
  }

  setRolePlayerIds() {
    this.componentInputData.model.bankingDetails.forEach(bank => {
      if (!this.rolePlayerIDs.includes(bank.rolePlayerId)) {
        this.rolePlayerIDs.push(bank.rolePlayerId);
      }
    });
  }

  async getRolePlayerDetails() {
    this.rolePlayerIDs.forEach(async id => {
      this.isLoading = true;
      await this._rolePlayerService.getRolePlayer(id).subscribe(res => {
        this.rolePlayers.push(res);
        this.isLoading = false
      });
    });
  }
}
