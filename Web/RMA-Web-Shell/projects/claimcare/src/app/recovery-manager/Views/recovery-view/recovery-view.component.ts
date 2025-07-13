import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ClaimRecoveryView } from 'projects/claimcare/src/app/recovery-manager/shared/entities/claim-recovery-view';
import { RecoveryNotesComponent } from 'projects/claimcare/src/app/recovery-manager/views/recovery-notes/recovery-notes.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';


@Component({
  selector: 'recovery-view',
  templateUrl: './recovery-view.component.html',
  styleUrls: ['./recovery-view.component.css'],
})
export class RecoveryViewComponent implements OnInit, AfterViewInit {

  private recoveryNotesComponent: RecoveryNotesComponent;

  @ViewChild(RecoveryNotesComponent, { static: false }) set content(content: RecoveryNotesComponent) {
    if (content) { // initially setter gets called with undefined
      this.recoveryNotesComponent = content;
    }
  }

  isLoading = true;
  claimId = 0;
  recoveryId: number;
  hasPermission: boolean;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  claimRecoveryView: ClaimRecoveryView;
  bankingDetails: RolePlayerBankingDetail = null;
  permission = 'View Recovery Details';

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly claimService: ClaimCareService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly lookup: LookupService,
  ) { }


  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
    if (this.recoveryNotesComponent) {
      this.recoveryNotesComponent.getNotes(this.claimId, ServiceTypeEnum.ClaimManager, 'Claim');
    }
  }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.permission);
    this.activatedRoute.params.subscribe((params: any) => {
      this.claimId = params.claimId;
      this.getRecoveryDetails(params.id);
    });
  }

  back() {
    this.router.navigateByUrl('');
  }

  getRecoveryDetails(recoveryId: number) {
    this.claimService.getRecoveryViewDetails(recoveryId).subscribe(result => {
      this.claimRecoveryView = result;
      this.claimId = result.claimId;
      this.isLoading = false;
      this.bankingDetails = result.recoveryRolePlayer.rolePlayerBankingDetails[0];
      this.getBankBranch();
    });
  }

  backToRecoveries() {
    this.router.navigate(['/claimcare/recovery-manager/recovery-list']);
  }

  getBankBranch() {
    this.lookup.getBankBranches().subscribe(result => {
      result.forEach(bank => {
        if (bank.bankId == this.bankingDetails.bankBranchId) {
          this.bankingDetails.bankName = bank.bank.name;
        }
      });
    });
  }
}
