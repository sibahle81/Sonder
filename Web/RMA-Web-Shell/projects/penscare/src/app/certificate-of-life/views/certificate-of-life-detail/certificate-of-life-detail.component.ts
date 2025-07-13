import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PensCareService } from '../../../pensioncase-manager/services/penscare.service';
import { PensionCaseContextEnum } from '../../../shared-penscare/enums/pensioncase-context-enum';
import { InitiatePensionCaseData } from '../../../shared-penscare/models/initiate-pensioncase-data.model';
import { PenscareLookups } from '../../../shared-penscare/models/penscare-lookups';
import { PensCareUtilities } from '../../../shared-penscare/utils/penscare-utilities';

class ComponentInputData {
  public isRecipient: string;
  public recipientId: number;
  public beneficiaryId: number;
  public pensionCaseNumber: string;
}

@Component({
  selector: 'app-certificate-of-life-detail',
  templateUrl: './certificate-of-life-detail.component.html',
  styleUrls: ['./certificate-of-life-detail.component.css']
})
export class CertificateOfLifeDetailComponent implements OnInit {
  @Input() componentInputData: ComponentInputData;
  @Output() onBackToSearch = new EventEmitter();
  model: InitiatePensionCaseData;
  loadedTab = null;
  lookups: PenscareLookups;
  form: UntypedFormGroup;
  pensCareContext: PensionCaseContextEnum = PensionCaseContextEnum.Manage;
  personType = '';

  constructor(
    private pensCareService: PensCareService,
    private formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.loadPersonalDetails();
  }

  loadPersonalDetails() {
    if (this.componentInputData.isRecipient) {
      this.pensCareService.getRecipientDetails(this.componentInputData.beneficiaryId).subscribe(
        response => {
          this.form = PensCareUtilities.createPersonFromPersonModel(this.formBuilder, response);
          this.lookups = PensCareUtilities.generateLookupsFromPersonModel(response);
          this.personType = 'recipient';
          this.loadedTab = 'personal-details';
        }
      )
    } else {
      this.pensCareService.getBeneficiaryDetails(this.componentInputData.beneficiaryId).subscribe(
        response => {
          this.form = PensCareUtilities.createPersonFromPersonModel(this.formBuilder, response);
          this.lookups = PensCareUtilities.generateLookupsFromPersonModel(response);
          this.personType = 'beneficiary';
          this.loadedTab = 'personal-details';
        }
      )
    }
  }

  loadDocuments() {
    this.model = {};
    this.model['pensionCase'] = {pensionCaseNumber: this.componentInputData.pensionCaseNumber};
    this.loadedTab = 'documents';
  }

  loadNotes() {

  }

  backToSearch() {
    this.onBackToSearch.emit();
  }

}
