import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PensionCase } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { GenderEnum } from 'projects/shared-models-lib/src/lib/enums/gender-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { forkJoin } from 'rxjs';
import { PensCareService } from '../../../pensioncase-manager/services/penscare.service';
import { PensionCaseContextEnum } from '../../../shared-penscare/enums/pensioncase-context-enum';
import { InitiatePensionCaseData } from '../../../shared-penscare/models/initiate-pensioncase-data.model';
import { PensCareNote } from '../../../shared-penscare/models/penscare-note';

@Component({
  selector: 'app-pension-case-view',
  templateUrl: './pension-case-view.component.html',
  styleUrls: ['./pension-case-view.component.css']
})
export class PensionCaseViewComponent implements OnInit {
  @Input() passedPensionCaseId: number;
  isLoading = false;
  pensionCaseNotification: InitiatePensionCaseData;
  tabName = '';
  pensionCaseContext = PensionCaseContextEnum;

  isPensionLedgersLoaded = false;
  pensionCaseId: any;
  model: InitiatePensionCaseData;
  loadedTab: string;
  select = 0;
  pensionCaseSubscription: any;
  genders: Lookup[];
  benefitTypes: Lookup[];
  notes: PensCareNote[];


  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly pensCareService: PensCareService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.pensionCaseId) {
        this.tabName =  params.tabName;
        this.pensionCaseId = params.pensionCaseId;
        this.loadPensionLedgers();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.passedPensionCaseId?.currentValue) {
      this.pensionCaseId = changes?.passedPensionCaseId?.currentValue;
      this.loadPensionLedgers();
    }

  }

  close() {
    if (this.router.url.includes('view-child-extension')) {
      this.router.navigate(['penscare/child-extension-manager/child-extensions']);
      return
    }
    this.router.navigate(['penscare/pension-cases']);
  }

  loadNotes() {
    this.loadedTab = null;
    this.pensCareService.getNotes(this.pensionCaseId, 'PensionCase').subscribe(result => {
      this.notes = result
      this.loadedTab='notes';
      this.cdr.detectChanges();
    });
  }

  loadCorrectiveEntries() {
    this.loadedTab = 'corrective-entries';
  }

  loadPensionLedgers() {
    this.loadedTab = null;
    this.pensCareService.getPensionLedgersByPensionCaseId(this.pensionCaseId).subscribe(result => {
      this.model = new InitiatePensionCaseData()
      this.model.pensionLedger = result;
      this.loadedTab='ledgers';
      this.cdr.detectChanges();
    });
  }

  loadPensionCase() {
    this.loadedTab = null;
    let pensionCase = this.pensCareService.getPensionCase(this.pensionCaseId);
    let pensioner = this.pensCareService.getPensionerByPensionCaseId(this.pensionCaseId)
    this.pensionCaseSubscription = forkJoin([
      pensionCase,
      pensioner
    ]).subscribe(
      responseList => {
        this.model = new InitiatePensionCaseData();
        this.model.pensionCase = responseList[0] as PensionCase;
        this.model.pensioner = responseList[1] as Person;
        this.genders  = [
          new Lookup(this.model.pensioner.gender, GenderEnum[this.model.pensioner.gender])
        ];
        this.benefitTypes = [
          new Lookup(this.model.pensionCase.benefitType, BenefitTypeEnum[this.model.pensionCase.benefitType])
        ];
        this.loadedTab='pensionCase';
      }
    );
  }

  loadBeneficiaries() {
    this.loadedTab = null;
    this.pensCareService.getBeneficiariesByPensionCaseId(this.pensionCaseId).subscribe(result => {
      this.model = new InitiatePensionCaseData()
      this.model.beneficiaries = result;
      this.loadedTab='beneficiaries';
      this.cdr.detectChanges();
    })
  }

  loadRecipients() {
    this.loadedTab = null;
    this.pensCareService.getRecipientsByPensionCaseId(this.pensionCaseId).subscribe(result => {
      this.model = new InitiatePensionCaseData()
      this.model.recipients = result;
      this.loadedTab='recipients';
      this.cdr.detectChanges();
    })
  }

  loadBankingDetails() {
    this.loadedTab = null;
    this.pensCareService.getBankingDetailsByPensionCaseId(this.pensionCaseId).subscribe(result => {
      this.model = new InitiatePensionCaseData()
      this.model.bankingDetails = result;
      this.loadedTab='banking-details';
      this.cdr.detectChanges();
    })
  }

  loadClaims() {
    this.loadedTab = null;
    this.pensCareService.getClaimsByPensionCaseId(this.pensionCaseId).subscribe(result => {
      this.model = new InitiatePensionCaseData()
      this.model.pensionClaims = result;
      this.loadedTab = 'claims';
      this.cdr.detectChanges();
    })
  }
}
