import { Component } from '@angular/core';
import { Lead } from '../../models/lead';
import { ClientTypeEnum } from '../../../policy-manager/shared/enums/client-type-enum';
import { LeadCompany } from '../../models/lead-company';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { IndustryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/industry-type.enum';
import { LeadContactV2 } from '../../models/lead-contact-V2';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { LeadService } from '../../services/lead.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { LeadClientStatusEnum } from '../../../policy-manager/shared/enums/leadClientStatusEnum';
import { LeadSourceEnum } from 'projects/shared-models-lib/src/lib/enums/lead-source.enum';
import { BehaviorSubject } from 'rxjs';
import { CompanyIdTypeEnum } from 'projects/shared-models-lib/src/lib/enums/company-id-type-enum';

@Component({
  templateUrl: './bulk-lead-upload.component.html',
  styleUrls: ['./bulk-lead-upload.component.css']
})
export class BulkLeadUploadComponent {

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('processing...please wait');

  // inputs for the xml parser component
  title = 'Upload Leads';
  expectedColumnHeadings = ['Display Name', 'Company Type', 'Industry Class', 'Industry Type', 'Registration Type', 'Registration Number', 'Compensation Fund Reference Number', 'Compensation Fund Registration Number', 'Contact First Name', 'Contact Last Name', 'Contact Email Address', 'Contact Mobile Number', 'Contact Telephone Number', 'Assigned To'];
  invalidRowsForExport: any[][] = [];

  leads: Lead[];

  constructor(
    private readonly leadService: LeadService,
    private readonly alertService: ToastrManager) { }

  receiveFileData($event: any[][]) {
    if ($event && $event.length > 0) {
      this.parseFileData($event);
    }
  }

  parseFileData(fileData: any[][]) {
    this.invalidRowsForExport = [];
    this.leads = [];

    fileData.forEach(row => {
      const lead = new Lead();

      // Lead Details
      lead.displayName = row[0] as string;

      try {
        lead.clientType = ClientTypeEnum[this.format((row[1] as string)).replace(/\s/g, "")];
      } catch {
        lead.clientType = null;
      };

      lead.leadClientStatus = LeadClientStatusEnum.New;
      lead.leadSource = LeadSourceEnum.Spreadsheet;
      lead.receivedDate = new Date().getCorrectUCTDate();
      lead.assignedTo = row[13] as string;

      // Lead Company
      lead.company = new LeadCompany();
      lead.company.name = lead.displayName;

      try {
        lead.company.industryClass = IndustryClassEnum[this.format((row[2] as string)).replace(/\s/g, "")];
      } catch {
        lead.company.industryClass = null;
      };

      try {
        lead.company.industryTypeId = IndustryTypeEnum[this.format((row[3] as string)).replace(/\s/g, "")];
      } catch {
        lead.company.industryTypeId = null;
      };

      try {
        lead.company.registrationType = CompanyIdTypeEnum[this.format((row[4] as string)).replace(/\s/g, "")];
      } catch {
        lead.company.registrationType = null;
      };

      lead.company.registrationNumber = row[5] as string;
      lead.company.compensationFundReferenceNumber = row[6] as string;
      lead.company.compensationFundRegistrationNumber = row[7] as string;

      // Lead Contact
      lead.contactV2 = [];
      const leadContact = new LeadContactV2();

      leadContact.name = row[8] as string;
      leadContact.surname = row[9] as string;
      leadContact.emailAddress = row[10] as string;
      leadContact.contactNumber = row[11] as string;
      leadContact.telephoneNumber = row[12] as string;
      leadContact.preferredCommunicationTypeId = CommunicationTypeEnum.Email;

      lead.contactV2.push(leadContact);

      if (this.isValid(lead, row)) {
        this.leads.push(lead);
      } else {
        this.invalidRowsForExport.push(row);
      }
    });
  }

  isValid(lead: Lead, row: any[]): boolean {
    let isValid = true;
    let failedValidationReasons = '';

    // Validate Details
    if (!lead.displayName || lead.displayName == '') {
      failedValidationReasons += 'Display Name is required, ';
      isValid = false;
    }

    if (!lead.clientType) {
      failedValidationReasons += 'Company Type is invalid, ';
      isValid = false;
    }

    if (lead.assignedTo && lead.assignedTo.length > 0) {
      const matched = lead.assignedTo.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (!matched) {
        failedValidationReasons += 'Assigned To username is invalid, ';
        isValid = false;
      }
    }

    // Validate Company
    if (!lead.company.industryClass) {
      failedValidationReasons += 'Industry Class is invalid, ';
      isValid = false;
    }

    if (!lead.company.industryTypeId) {
      failedValidationReasons += 'Industry Type is invalid, ';
      isValid = false;
    }

    if (!lead.company.registrationType) {
      failedValidationReasons += 'Registration Type is invalid, ';
      isValid = false;
    }

    if (!lead.company.registrationNumber || lead.company.registrationNumber == '') {
      failedValidationReasons += 'Registration Number is required, ';
      isValid = false;
    }

    if (!lead.company.compensationFundReferenceNumber || lead.company.compensationFundReferenceNumber == '') {
      failedValidationReasons += 'Compensation Fund Reference Number is required, ';
      isValid = false;
    }

    if (!lead.company.compensationFundRegistrationNumber || lead.company.compensationFundRegistrationNumber == '') {
      failedValidationReasons += 'Compensation Fund Registration Number is required, ';
      isValid = false;
    }

    // Validate Contact
    if (!lead.contactV2[0].name || lead.contactV2[0].name == '') {
      failedValidationReasons += 'Contact First Name is required, ';
      isValid = false;
    }

    if (!lead.contactV2[0].surname || lead.contactV2[0].surname == '') {
      failedValidationReasons += 'Contact Last Name is required, ';
      isValid = false;
    }

    if (!lead.contactV2[0].emailAddress || lead.contactV2[0].emailAddress == '') {
      failedValidationReasons += 'Contact Email Address is required, ';
      isValid = false;
    }

    if (lead.contactV2[0].emailAddress && lead.contactV2[0].emailAddress.length > 0) {
      const matched = lead.contactV2[0].emailAddress.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (!matched) {
        failedValidationReasons += 'Contact Email Address is invalid, ';
        isValid = false;
      }
    }

    if (lead.contactV2[0].contactNumber && lead.contactV2[0].contactNumber.length > 0) {
      const matched = lead.contactV2[0].contactNumber.match(/\d{10}/);
      if (!matched) {
        failedValidationReasons += 'Contact Number is invalid, ';
        isValid = false;
      }
    }

    if (isValid) {
      this.addReasonColumn('N/A', row);
    } else {
      this.addReasonColumn(failedValidationReasons, row);
    }

    return isValid;
  }

  addReasonColumn(reasons: any, row: any[]) {
    row.push(reasons);
  }

  submit($event: boolean) {
    if ($event) {
      this.isLoading$.next(true);
      this.leadService.bulkLeadUpload(this.leads).subscribe(results => {
        if (results && results.length == this.leads.length) {
          this.alertService.successToastr(`${results.length} leads queued successfully`);
        }
        this.isLoading$.next(false);
      });
    }
  }

  format(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
