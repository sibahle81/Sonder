import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import { DeclineReasonDialogComponent } from '../quote-view/decline-reason-dialog/decline-reason-dialog.component';
import { AppEventsManager } from '../shared-utilities/app-events-manager/app-events-manager';
import { AddressTypeEnum } from '../shared/enums/address-type.enum';
import { ClientTypeEnum } from '../shared/enums/client-type-enum';
import { CommunicationTypeEnum } from '../shared/enums/communication-type.enum';
import { IdTypeEnum } from '../shared/enums/id-type.enum';
import { QuoteStatusEnum } from '../shared/enums/quote-status.enum';
import { Company } from '../shared/models/company';
import { Lead } from '../shared/models/lead';
import { Person } from '../shared/models/person';
import { Quote } from '../shared/models/quote';
import { RolePlayerAddress } from '../shared/models/role-player-address';
import { RolePlayer } from '../shared/models/roleplayer';
import { StartWizardRequest } from '../shared/models/start-wizard-request.model';
import { AlertService } from '../shared/services/alert.service';
import { LeadService } from '../shared/services/lead.service';
import { LookupService } from '../shared/services/lookup.service';
import { QuoteService } from '../shared/services/quote.service';
import { WizardService } from '../shared/services/wizard.service';

@Component({
  selector: 'app-mobile-view-quote',
  templateUrl: './mobile-view-quote.component.html',
  styleUrls: ['./mobile-view-quote.component.scss']
})
export class MobileViewQuoteComponent implements OnInit {
  quoteForm: FormGroup;
  backgroundImage = '';
  oneTimePin: number;
  quoteNumber: string;
  isfetchingQuote: boolean;
  isRequestingOTP: boolean;
  otpStatus: number;
  otpMessage: string;
  fetchMessageStatus: number;
  fetchMessage: string;
  quote: Quote;

  reportUrlAudit = 'RMA.Reports.ClientCare.Quote/RMACOIDQuoteDB';
  parametersAudit: any;
  ssrsBaseUrl: string;
  reportServerAudit: string;
  showReport = false;
  coidProductId: number;
  declineReason: string;

  showParametersAudit: string;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  formatAudit = 'PDF';
  reportTitle: string;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSending$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  quoteId: number;
  lead: Lead;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
    private readonly appEventsManager: AppEventsManager,
    private readonly quoteService: QuoteService,
    private readonly lookupService: LookupService,
    private readonly leadService: LeadService,
    private readonly wizardService: WizardService,
    private readonly router: Router,
    private readonly alert: ToastrManager,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.createForm();
    this.appEventsManager.setLoggedInUser(null);
    const random = Math.floor(Math.random() * 11);
    this.backgroundImage = `/assets/images/landingpage${random}.jpg`;

    this.isfetchingQuote = false;
    this.isRequestingOTP = false;

    this.otpStatus = 0;
    this.otpMessage = '';
    this.fetchMessageStatus = 0;
    this.fetchMessage = '';

    this.quote = null;
    this.getLookups();
  }

  getLookups() {
    this.lookupService.getItemByKeyAnon('ssrsBaseUrl').subscribe(ssrsSetting => {
      this.ssrsBaseUrl = ssrsSetting;
      this.lookupService.getItemByKeyAnon('COIDProductId').subscribe(coidProductIdsetting => {
        this.coidProductId = +coidProductIdsetting as number;
      });
    });
  }

  createForm(): void {
    this.quoteForm = this.formBuilder.group({
      quotenumber: ['', Validators.required],
      onetimepin: [''],
    });
  }

  readForm(): any {
    this.quoteNumber = this.quoteForm.value.quotenumber as string;
    this.oneTimePin = this.quoteForm.value.onetimepin as number;
  }

  requestPin(): void {
    if (this.quoteForm.valid) {
      this.otpStatus = 0;
      this.otpMessage = '';
      this.isRequestingOTP = true;
      this.quoteForm.disable();
      this.alertService.loading('Requesting One Time Pin...');

      this.quoteNumber = this.quoteForm.value.quotenumber as string;
      this.oneTimePin = this.quoteForm.value.onetimepin as number;
      this.quoteService.getOneTimePinByQuoteNumber(this.quoteNumber).subscribe(otpm => {
        this.alertService.clear();
        this.quoteForm.enable();
        this.isRequestingOTP = false;
        if (otpm !== null) {
          this.otpStatus = otpm.status;
          this.otpMessage = otpm.message;

          if (otpm.status === 200) {
            this.alertService.success(otpm.message);
          } else {
            this.alertService.loading(otpm.message);
          }
        } else {
          this.otpMessage = 'One Time Pin Request Failed';
          this.alertService.loading('One Time Pin Request Failed');
        }
      }, () => {
        this.quoteForm.enable();
        this.isRequestingOTP = false;
        this.otpMessage = 'One Time Pin Request Failed';
        this.alertService.error('One Time Pin Request Failed');
      });
    }
  }

  getQuoteDetails(): void {
    this.readForm();
    if (this.quoteForm.valid) {
      this.quoteForm.disable();
      this.fetchMessageStatus = 0;
      this.fetchMessage = '';
      this.isfetchingQuote = true;
      this.quote = new Quote();

      this.alertService.loading('Fetching quote details');
      this.quoteService.getQuoteDetailsByQuoteNumber(this.quoteNumber, this.oneTimePin).subscribe(quote => {
        this.alertService.clear();
        this.quoteForm.enable();
        this.isfetchingQuote = false;
        if (quote !== null) {
          this.isLoading$.next(false);
          this.quoteForm.disable();
          this.quote = quote;
          this.fetchMessageStatus = 200;
          this.fetchMessage = 'Please download quote details below:';
          this.generateQuote(quote.quoteId);
        } else {
          this.fetchMessage = 'Error occured fetching quote details';
          this.alertService.error('Error occured fetching quote details');
        }
      }, () => {
        this.quoteForm.enable();
        this.isfetchingQuote = false;
        this.fetchMessage = 'New One Time Pin Required';
        this.alertService.error('New One Time Pin Required');
      });
    }
  }

  generateQuote(quoteId: number): void {
    this.reportServerAudit = this.ssrsBaseUrl;
    this.parametersAudit = { QuoteId: quoteId };
    this.showReport = true;
  }

  exportReport() {
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.ClientCare.Quote/RMACOIDQuoteDB';
    this.parametersAudit = { QuoteId: this.quoteId };
    this.showParametersAudit = 'false';
    this.languageAudit = 'en-us';
    this.widthAudit = 100;
    this.heightAudit = 100;
    this.toolbarAudit = 'true';
    this.showReport = true;
  }

  accept() {
    this.isLoading$.next(true);
    this.quote.quoteStatusId = QuoteStatusEnum.Accepted;
    this.quoteService.updateQuoteAnon(this.quote).subscribe(result => {
      if (result) {
        this.alert.successToastr(`Quote ${this.quote.quoteNumber} was Accepted...`);
        this.startMemberWizard();
        this.isLoading$.next(false);
      }
    }, error => {
      this.alert.errorToastr(error.message);
      this.router.navigateByUrl('/');
    });
  }

  decline() {
    this.isLoading$.next(true);
    this.quote.quoteStatusId = QuoteStatusEnum.Declined;
    this.quoteService.updateQuoteAnon(this.quote).subscribe(result => {
      if (result) {
        this.alert.successToastr(`Quote ${this.quote.quoteNumber} was Declined...`);
        this.isLoading$.next(false);
      }
    }, error => {
      this.alert.errorToastr(error.message);
      this.router.navigateByUrl('/');
    });
  }

  getQuoteStatus(id: number): string {
    return QuoteStatusEnum[id].replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  startMemberWizard() {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();

    const member = new RolePlayer();
    // TODO - Map the lead fields to the roleplayer fields
    member.displayName = this.lead.displayName;
    member.preferredCommunicationTypeId = (this.lead.contacts.find(s => s.isPreferred)).communicationTypeId;

    if (member.preferredCommunicationTypeId === CommunicationTypeEnum.Email) {
      member.emailAddress = (this.lead.contacts.find(s => s.communicationTypeId === CommunicationTypeEnum.Email).communicationTypeValue);
    } else if (member.preferredCommunicationTypeId === CommunicationTypeEnum.SMS) {
      const sms = (this.lead.contacts.find(s => s.communicationTypeId === CommunicationTypeEnum.SMS));
      member.cellNumber = sms.communicationTypeValue;
    } else if (member.preferredCommunicationTypeId === CommunicationTypeEnum.Phone) {
      const phone = (this.lead.contacts.find(s => s.communicationTypeId === CommunicationTypeEnum.Phone));
      member.tellNumber = phone.communicationTypeValue;
    }
    member.joinDate = new Date();

    if (this.lead.clientTypeId === ClientTypeEnum.Individual) {
      member.company = null;
      member.person = new Person();
      member.person.idType = IdTypeEnum[IdTypeEnum[this.lead.person.idTypeId]];
      member.person.idNumber = this.lead.person.idNumber;
      member.person.firstName = this.lead.person.firstName;
      member.person.surname = this.lead.person.surname;
    } else {
      member.person = null;
      member.company = new Company();
      member.company.companyIdType = this.lead.company.registrationTypeId;
      member.company.name = this.lead.company.name;
      member.company.companyRegNo = this.lead.company.registrationNumber;
      member.company.industryClass = this.lead.company.industryClassId;
      member.company.referenceNumber = this.lead.company.compensationFundReferenceNumber;
    }

    this.lead.addresses.forEach(s => {
      const rolePlayerAddress = new RolePlayerAddress();
      rolePlayerAddress.addressType = AddressTypeEnum[s.addressTypeId];
      rolePlayerAddress.city = s.city;
      rolePlayerAddress.countryId = s.countryId;
      rolePlayerAddress.postalCode = s.postalCode;
      rolePlayerAddress.province = s.province;
      rolePlayerAddress.addressLine1 = s.addressLine1;
      rolePlayerAddress.addressLine2 = s.addressLine2;
      rolePlayerAddress.effectiveDate = s.createdDate;

      member.rolePlayerAddresses.push(rolePlayerAddress);
    });
    // -----------------------------
    startWizardRequest.data = JSON.stringify(member);

    startWizardRequest.type = 'new-member';
    this.createWizard(startWizardRequest);
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizardAnon(startWizardRequest).subscribe(result => {
      this.alert.successToastr(startWizardRequest.type + ' wizard started successfully');
      this.router.navigateByUrl('/');
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(DeclineReasonDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (data) => {
        if (data != null) {
          this.declineReason = data.declineReason as string;
          this.quote.declineReason = this.declineReason;
          this.decline();
        }
      }
    });
  }

  openAcceptDialog() { this.accept(); }
}

