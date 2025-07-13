import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Component, OnInit, Input } from '@angular/core';
import { DeclineReasonDialogComponent } from './decline-reason-dialog/decline-reason-dialog.component';
import { Quote } from '../shared/models/quote';
import { Lead } from '../shared/models/lead';
import { LeadContact } from '../shared/models/lead-contact';
import { LeadItemTypeEnum } from '../shared/enums/lead-item-type.enum';
import { LookupService } from '../shared/services/lookup.service';
import { WizardService } from '../shared/services/wizard.service';
import { MatDialog } from '@angular/material/dialog';
import { QuoteService } from '../shared/services/quote.service';
import { LeadService } from '../shared/services/lead.service';
import { CommunicationTypeEnum } from '../shared/enums/communication-type.enum';
import { QuoteStatusEnum } from '../shared/enums/quote-status.enum';
import { StartWizardRequest } from '../shared/models/start-wizard-request.model';
import { RolePlayer } from '../shared/models/roleplayer';
import { IdTypeEnum } from '../shared/enums/id-type.enum';
import { Person } from '../shared/models/person';
import { Company } from '../shared/models/company';
import { AddressTypeEnum } from '../shared/enums/address-type.enum';
import { ClientTypeEnum } from '../shared/enums/client-type-enum';
import { RolePlayerAddress } from '../shared/models/role-player-address';
import { User } from '../core/models/security/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../shared/services/alert.service';
import { LeadProduct } from '../shared/models/lead-product';
import { ProductService } from '../shared/services/product.service';
import { RolePlayerService } from '../shared/services/roleplayer.service';
import { ProductClassEnum } from '../shared/enums/product-class-enum';
import { ProductOptionDependency } from '../shared/models/product-option-dependency';
import { ContactDesignationTypeEnum } from '../shared/enums/contact-designation-type-enum';
import { RolePlayerIdentificationType } from '../shared/enums/roleplayer-identification-type-enum';
import { TitleEnum } from '../shared/enums/title-enum';
import { RolePlayerContact } from '../shared/models/roleplayer-contact';
import { DependentQuote } from '../shared/models/dependent-quote';


@Component({
  selector: 'app-quote-view',
  templateUrl: './quote-view.component.html',
  styleUrls: ['./quote-view.component.css']
})
export class QuoteViewComponent implements OnInit {

  @Input() member: RolePlayer = new RolePlayer();
  isViewMode: boolean;
  memberNumber: string;
  loadingMessage = 'loading...please wait';

  quoteForm: FormGroup;
  backgroundImage = '';
  oneTimePin: number;
  quoteNumber: string;
  otpStatus = 0;
  otpMessage = '';
  fetchMessageStatus = 0;
  fetchMessage = '';
  quote: Quote;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  quoteId: number;
  lead: Lead;
  reportViewer: User;
  reportUrlAudit = 'RMA.Reports.ClientCare.Quote/RMACOIDQuoteDB';
  parametersAudit: any;
  ssrsBaseUrl: string;
  reportServerAudit: string;
  showReport = false;
  declineReason: string;
  emailContacts: LeadContact[];
  quoteAuditType = LeadItemTypeEnum.Quote;
  quoteDetailAuditType = LeadItemTypeEnum.QuoteDetail;

  acceptedEnum = QuoteStatusEnum.Accepted as number;
  declinedEnum = QuoteStatusEnum.Declined as number;
  pendingApprovalEnum = QuoteStatusEnum.PendingApproval as number;
  rejectedEnum = QuoteStatusEnum.Rejected as number;



  //new
  dependentQuotes: Quote[] = [];
  statutoryQuoteReportURL = 'RMA.Reports.ClientCare.Quote/StatutoryQuote/RMAStatutoryProductsQuoteDB';
  nonStatutoryQuoteReportURL = 'RMA.Reports.ClientCare.Quote/NonStatutoryQuote/RMANonStatutoryProductsQuoteDB';
  assistanceQuoteReportURL = 'RMA.Reports.ClientCare.Quote/AssistanceQuote/RMAAssistanceProductsQuoteDB';
  dependencyQuoteReportURL = 'RMA.Reports.ClientCare.Quote/DependencyProductQuote/RMADependencyProductQuoteDB';

  productDependencyURL: string;
  selectedQuoteProductClass: ProductClassEnum;
  autoAcceptedEnum = QuoteStatusEnum.AutoAccepted as number;
  allProductOptionDependancies: ProductOptionDependency[];
  quotedLeadProduct: LeadProduct;

  constructor(
    private readonly quoteService: QuoteService,
    private readonly router: Router,
    private readonly alert: ToastrManager,
    private readonly activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
    private readonly leadService: LeadService,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly productService: ProductService,
    private readonly rolePlayerService: RolePlayerService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.createForm();
    sessionStorage.setItem('reportviewer-user', 'reportviewer-user');
    this.activatedRoute.params.subscribe((params: any) => {
      this.quoteId = params.id;
      this.getAllProductDependancies();
    });

    const random = Math.floor(Math.random() * 11);
    this.backgroundImage = `/assets/images/landingpage${random}.jpg`;
  }

  getnerateMemberNumber() {
    this.quoteService.generateMemberNumber(this.lead.displayName).subscribe(result => {
      this.memberNumber = result;
    });
  }

  getLookups() {
    this.lookupService.getItemByKeyAnon('ssrsBaseUrl').subscribe(ssrsSetting => {
      this.ssrsBaseUrl = ssrsSetting;
      this.getQuote(this.quoteId);
    });
  }

  setForm() {
    this.quoteForm.patchValue({
      quotenumber: this.quote.quoteNumber
    })
  }

  createForm(): void {
    this.quoteForm = this.formBuilder.group({
      quotenumber: [{ value: '', disabled: true }, [Validators.required]],
      onetimepin: [''],
    });
  }

  readForm(): any {
    this.quoteNumber = this.quoteForm.controls.quotenumber.value as string;
    this.oneTimePin = this.quoteForm.value.onetimepin as number;
  }

  requestPin(): void {
    this.loadingMessage = 'requesting one time pin';
    this.isLoading$.next(true);

    if (this.quoteForm.valid) {
      this.otpStatus = 0;
      this.otpMessage = '';

      this.quoteNumber = this.quoteForm.controls.quotenumber.value as string;
      this.oneTimePin = this.quoteForm.value.onetimepin as number;
      this.quoteService.getOneTimePinByQuoteNumberViaEmail(this.quoteNumber).subscribe(otpm => {
        this.alertService.clear();
        if (otpm !== null) {
          this.otpStatus = otpm.status;
          this.otpMessage = otpm.message;

          if (otpm.status === 200) {
            this.alertService.success(otpm.message);
            this.isLoading$.next(false);
          } else {
            this.alertService.loading(otpm.message);
            this.isLoading$.next(false);
          }
        } else {
          this.otpMessage = 'one time pin request failed';
          this.alertService.loading(this.otpMessage);
          this.isLoading$.next(false);
        }
      }, () => {
        this.quoteForm.enable();
        this.isLoading$.next(false);
        this.otpMessage = 'one time pin request failed';
        this.alertService.error(this.otpMessage);
      });
    }
  }

  generateQuote(quoteId: number): void {
    this.reportServerAudit = this.ssrsBaseUrl;
    this.parametersAudit = { QuoteId: quoteId };

    if (this.dependentQuotes && this.dependentQuotes.length > 0) {
      this.reportUrlAudit = this.dependencyQuoteReportURL;
    } else {
      this.reportUrlAudit = this.selectedQuoteProductClass === ProductClassEnum.Statutory ?
        this.statutoryQuoteReportURL : this.selectedQuoteProductClass === ProductClassEnum.NonStatutory ?
          this.nonStatutoryQuoteReportURL : this.selectedQuoteProductClass === ProductClassEnum.Assistance ?
            this.assistanceQuoteReportURL : '';
    }
    this.isLoading$.next(false);
    this.showReport = true;
  }

  getQuote(quoteId: number) {
    this.quoteService.getQuote(quoteId).subscribe(result => {
      this.quote = result;
      this.generateQuote(this.quote.quoteId);
      this.getLead(this.quote.quoteId);
      this.setForm();
    });
  }

  getLead(quoteId: number) {
    this.leadService.getLeadByQuoteId(quoteId).subscribe(result => {
      this.lead = result;
      this.emailContacts = this.lead.contacts.filter(s => s.communicationTypeId === CommunicationTypeEnum.Email);
      this.getnerateMemberNumber();
      this.getQuotationProductClass(this.quote);

    });
  }

  accept(quote: Quote, isDependent: boolean) {
    this.isLoading$.next(true);
    this.loadingMessage = 'loading please wait';
    quote.quoteStatusId = QuoteStatusEnum.Accepted;
    this.quoteService.updateQuote(quote).subscribe(result => {
      if (result) {
        if (!isDependent) {
          this.rolePlayerService.rolePlayerExists(this.lead.rolePlayerId).subscribe(existingMember => {
            if (!existingMember) {
              this.startMemberWizard();
            } else {
              this.memberExistsStartPolicyWizard();
            }
          });
        }
      }
    }, error => {
      this.alert.errorToastr(error.message);
    });
  }

  decline(quote: Quote) {
    this.isLoading$.next(true);
    quote.quoteStatusId = QuoteStatusEnum.Declined;
    this.quoteService.updateQuoteAnon(quote).subscribe(result => {
      if (result) { }
    }, error => {
      this.alert.errorToastr(error.message);
    });
  }

  getQuoteStatus(id: number): string {
    return QuoteStatusEnum[id].replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  startMemberWizard() {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();

    const member = new RolePlayer();
    // Map the lead fields to the roleplayer fields
    member.rolePlayerId = this.lead.rolePlayerId;
    member.displayName = this.lead.displayName;
    member.rolePlayerBenefitWaitingPeriod = this.lead.rolePlayerBenefitWaitingPeriod;
    member.preferredCommunicationTypeId = (this.lead.contacts.find(s => s.isPreferred)).communicationTypeId;
    member.clientType = this.lead.clientTypeId;

    if (member.preferredCommunicationTypeId === CommunicationTypeEnum.Email) {
      member.emailAddress = (this.lead.contacts.find(s => s.communicationTypeId === CommunicationTypeEnum.Email).communicationTypeValue);
    } else if (member.preferredCommunicationTypeId === CommunicationTypeEnum.SMS) {
      const sms = (this.lead.contacts.find(s => s.communicationTypeId === CommunicationTypeEnum.SMS));
      member.cellNumber = sms.communicationTypeValue;
    } else if (member.preferredCommunicationTypeId === CommunicationTypeEnum.Phone) {
      const phone = (this.lead.contacts.find(s => s.communicationTypeId === CommunicationTypeEnum.Phone));
      member.tellNumber = phone.communicationTypeValue;
    }

    const emailContact = this.lead.contacts.find(s => s.communicationTypeId === CommunicationTypeEnum.Email);
    const rolePlayerContact = new RolePlayerContact();
    rolePlayerContact.communicationType = CommunicationTypeEnum.Email;
    rolePlayerContact.contactDesignationType = ContactDesignationTypeEnum.PrimaryContact;
    rolePlayerContact.emailAddress = emailContact.communicationTypeValue;
    rolePlayerContact.firstname = emailContact.name;
    rolePlayerContact.surname = '';
    rolePlayerContact.rolePlayerId = member.rolePlayerId;
    rolePlayerContact.title = TitleEnum.Mr;
    member.rolePlayerContacts = member.rolePlayerContacts ? member.rolePlayerContacts : [];
    member.rolePlayerContacts.push(rolePlayerContact);

    member.joinDate = new Date();

    if (this.lead.clientTypeId === ClientTypeEnum.Individual) {
      member.company = null;
      member.rolePlayerIdentificationType = RolePlayerIdentificationType.Person;
      member.person = new Person();
      member.person.idType = IdTypeEnum[IdTypeEnum[this.lead.person.idTypeId]];
      member.person.idNumber = this.lead.person.idNumber;
      member.person.firstName = this.lead.person.firstName;
      member.person.surname = this.lead.person.surname;
    } else {
      member.person = null;
      member.rolePlayerIdentificationType = RolePlayerIdentificationType.Company;
      member.company = new Company();
      member.company.name = this.lead.company.name;
      member.company.companyIdType = this.lead.company.registrationTypeId;
      member.company.industryClass = this.lead.company.industryClassId;
      member.company.industryId = this.lead.company.industryTypeId;

      member.company.referenceNumber = this.lead.company.compensationFundRegistrationNumber;
      member.company.idNumber = this.lead.company.registrationNumber;
      member.company.compensationFundReferenceNumber = this.lead.company.compensationFundReferenceNumber;
    }

    this.lead.addresses.forEach(s => {
      member.rolePlayerAddresses = [];
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
    // End mapping -----------------------------
    startWizardRequest.data = JSON.stringify(member);
    startWizardRequest.linkedItemId = this.lead.rolePlayerId;
    startWizardRequest.type = 'new-member';
    this.createWizard(startWizardRequest);
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizardAnon(startWizardRequest).subscribe(() => {
      if (startWizardRequest.type !== 'quotation') {
        this.dependentQuotes.forEach(dependentQuote => {
          this.accept(dependentQuote, true);
        });
        this.startPolicyWizard(this.quote);
      }
      this.alert.successToastr(startWizardRequest.type + ' wizard started successfully');
      this.router.navigateByUrl('/');
      this.isLoading$.next(false);
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(DeclineReasonDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (data) => {
        if (data != null) {
          this.declineReason = data.declineReason as string;
          this.quote.declineReason = this.declineReason;
          this.decline(this.quote);
          this.dependentQuotes.forEach(dependentQuote => {
            dependentQuote.declineReason = this.declineReason;
            this.decline(dependentQuote);
          });
          this.router.navigateByUrl('/');
        }
      }
    });
  }

  ngDestroy() {
    sessionStorage.removeItem('reportviewer-user');
  }

  openAcceptDialog() {
    const quote = this.quote;
    this.accept(this.quote, false);
  }

  view() {
    this.isViewMode = !this.isViewMode;
  }

  submitWizard() {
    this.startMemberWizard();
  }

  getQuoteDetails(): void {
    this.readForm();
    if (this.quoteForm.valid) {
      this.quoteForm.disable();
      this.fetchMessageStatus = 0;
      this.fetchMessage = '';
      this.isLoading$.next(true);
      this.loadingMessage = 'fetching quote details';
      this.quote = new Quote();

      this.quoteService.getQuoteDetailsByQuoteNumber(this.quoteNumber, this.oneTimePin).subscribe(quote => {
        this.alertService.clear();
        this.quoteForm.disable();
        if (quote !== null) {
          this.isLoading$.next(false);
          this.quoteForm.disable();
          this.quote = quote;
          this.fetchMessageStatus = 200;
          this.fetchMessage = 'please download quote details below:';
          this.generateQuote(quote.quoteId);
        } else {
          this.fetchMessage = 'error occurred fetching quote details';
          this.alertService.error(this.fetchMessage);
          this.isLoading$.next(false);
        }
      }, () => {
        this.otpStatus = 0;
        this.quoteForm.enable();
        this.isLoading$.next(false);
        this.fetchMessage = 'new one time pin required';
        this.alertService.error(this.fetchMessage);
      });
    }
  }

  getAllProductDependancies() {
    this.productService.getProductOptionDependencies().subscribe(results => {
      this.allProductOptionDependancies = results;
      this.getLookups();
    });
  }

  getQuotationProductClass(quote: Quote) {
    this.quotedLeadProduct = new LeadProduct();

    this.lead.leadProducts.forEach(s => {
      if (s.quote.quoteId === quote.quoteId) {
        this.quotedLeadProduct = s;
      }
    });

    this.productService.getProduct(this.quotedLeadProduct.productId).subscribe(product => {
      this.selectedQuoteProductClass = ProductClassEnum[ProductClassEnum[product.productClassId]];
      this.getDependentQuotes();
      this.generateQuote(this.quote.quoteId);
    });
  }

  getDependentQuotes() {
    if (!this.allProductOptionDependancies || !(this.lead.company && this.lead.company.industryClassId)) { return; }

    const appliedProductDependancies = this.allProductOptionDependancies.filter(s => s.productOptionId === this.quotedLeadProduct.productOptionId && s.industryClass === this.lead.company.industryClassId && s.quoteAutoAcceptParentAccount);

    if (appliedProductDependancies && appliedProductDependancies.length > 0) {
      appliedProductDependancies.forEach(appliedDependency => {
        const parentLeadProduct = this.lead.leadProducts.find(s => s.productOptionId === appliedDependency.productOptionId);
        this.quote.productId = parentLeadProduct.productId;
        this.quote.productOptionId = parentLeadProduct.productOptionId;

        const childLeadProduct = this.lead.leadProducts.find(s => s.productOptionId === appliedDependency.childOptionId);
        const childQuote = childLeadProduct.quote;
        childQuote.productId = childLeadProduct.productId;
        childQuote.productOptionId = childLeadProduct.productOptionId;
        this.dependentQuotes.push(childLeadProduct.quote);
      });
    }
  }

  edit() {
    this.startAmendWizard();
  }

  viewLead() {
    this.router.navigateByUrl(`/clientcare/lead-manager/manage-lead/${this.lead.leadId}`);
  }

  startAmendWizard() {
    this.isLoading$.next(true);

    const startWizardRequest = new StartWizardRequest();

    startWizardRequest.linkedItemId = this.lead.leadId;
    this.lead.modifiedDate = new Date();
    startWizardRequest.data = JSON.stringify(this.lead);

    startWizardRequest.type = 'quotation';
    this.createWizard(startWizardRequest);

  }

  memberExistsStartPolicyWizard() {
    this.dependentQuotes.forEach(dependentQuote => {
      this.accept(dependentQuote, true);
    });
    this.startPolicyWizard(this.quote);
  }

  startPolicyWizard(quote: Quote) {
    let wizardType = '';

    let quoteProductClass: ProductClassEnum;
    this.productService.getProduct(quote.productId).subscribe(product => {
      quoteProductClass = ProductClassEnum[ProductClassEnum[product.productClassId]];

      if (quoteProductClass === ProductClassEnum.Statutory) {
        wizardType = 'expense-based-policy';
      } else if (quoteProductClass === ProductClassEnum.Assistance) {
        wizardType = 'expense-based-policy';
      } else if (quoteProductClass === ProductClassEnum.NonStatutory) {
        wizardType = 'expense-based-policy';
      }

      const dependentQuotes = [];
      this.dependentQuotes?.forEach(s => {
        const dependentQuote = new DependentQuote();
        dependentQuote.quote = s;
        dependentQuotes.push(dependentQuote);
      });
      quote.dependentQuotes = dependentQuotes;

      if (wizardType) {
        const startWizardRequest = new StartWizardRequest();
        startWizardRequest.type = wizardType;
        startWizardRequest.linkedItemId = this.lead.rolePlayerId;
        startWizardRequest.data = JSON.stringify(quote);
        startWizardRequest.allowMultipleWizards = true;

        this.wizardService.startWizardAnon(startWizardRequest).subscribe(result => {
          if (result) {
            this.isLoading$.next(false);
          }
        }, error => {
          this.alert.errorToastr(wizardType + ' wizard failed to start...' + error.message);
        });
      } else {
        this.alert.warningToastr('No wizard exists for the selected product class...(Possibly Under Construction)');
      }
    });
  }
}
