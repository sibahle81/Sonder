import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetails } from 'src/app/core/models/security/user-details.model';
import { WizardNameConstants } from 'src/app/shared/constants/wizard-name-constants';
import { DocumentSetEnum } from 'src/app/shared/enums/document-set.enum';
import { IdTypeEnum } from 'src/app/shared/enums/id-type.enum';
import { UserRegistrationDetails } from 'src/app/shared/models/user-registration-details';
import { AlertService } from 'src/app/shared/services/alert.service';
import { UserRegistrationService } from '../services/user-registration.service';
import { UserRegistrationDocumentsComponent } from '../user-registration-documents/user-registration-documents.component';

@Component({
  selector: 'app-user-registration-vopd-failed',
  templateUrl: './user-registration-vopd-failed.component.html',
  styleUrls: ['./user-registration-vopd-failed.component.scss']
})
export class UserRegistrationVopdFailedComponent implements OnInit {
  @ViewChild('userRegistrationDocuments') userRegistrationDocuments: UserRegistrationDocumentsComponent;
  private userDetails: UserRegistrationDetails;
  public vopdResponse: string;
  public isLoading = false;
  public disabledSubmit = false;

  constructor(
    private userRegistrationService: UserRegistrationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    private readonly router: Router
    ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.activatedRoute.params.subscribe((params: any) => {
      this.userRegistrationService.getUserDetailsByActivateId(params.id).subscribe((result) => {
        if (result) {
          this.userDetails = result;
          this.userRegistrationDocuments.documentSet = DocumentSetEnum.UserVopdFailedDocuments;
          this.userRegistrationDocuments.userRegistrationIdnumber = this.userDetails.saId;
          this.userRegistrationDocuments.getDocuments();
        }
      }, (error) => {
        this.userRegistrationDocuments.isLoading = false;
        this.alertService.error(error);
        this.isLoading = false;
      }, () => {
        if (this.userDetails.idTypeEnum === IdTypeEnum.SAIDDocument){
          this.GetVOPDResponse(this.userDetails.saId);
          this.CheckForWizard();
        } else {
          this.alertService.error('Only Sa Id numbers can be verfied');
          this.isLoading = false;
        }
      });
    });
  }

  Submit() {
    const isDocumentsUploaded = this.userRegistrationDocuments.checkAllDocumentsUpload();
    if (isDocumentsUploaded){
      this.userRegistrationService.onDocumentUpload(this.userDetails).subscribe(() => {
        this.alertService.success('Document sent for verification successfully ');
        this.router.navigateByUrl('');
      }, (error) => {
        this.alertService.error(error);
      });
    } else {
      this.alertService.error('Not all Documents have been uploaded');
    }
  }

  GetVOPDResponse(idNumber: string){
    this.userRegistrationService.getUserDetailsVopdResponse(idNumber).subscribe((result) => {
      this.vopdResponse = result;
      this.isLoading = false;
    }, (error) => {
      this.alertService.error('Vopd response was not found');
      this.isLoading = false; });
  }

  CheckForWizard(){
    this.userRegistrationService.checkIfWizardHasBeenCreated(WizardNameConstants.UserApprovalMemberPortal, this.userDetails.saId).subscribe(result => {
      this.disabledSubmit = result;
    }, (error) => {
      this.alertService.error(error);
    });
  }
}
