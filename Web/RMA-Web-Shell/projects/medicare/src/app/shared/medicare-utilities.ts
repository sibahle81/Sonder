import { PreAuthStatus } from "projects/medicare/src/app/medi-manager/enums/preauth-status-enum";
import { PreauthTypeEnum } from "projects/medicare/src/app/medi-manager/enums/preauth-type-enum";
import { RequestType } from "projects/medicare/src/app/medi-manager/enums/request-type.enum";
import { CrudActionType } from "./enums/crud-action-type";
import { ProstheticTypeEnum } from "../medi-manager/enums/prosthetic-type-enum";
import { ProstheticQuotationTypeEnum } from "../medi-manager/enums/prosthetic-quotation-type-enum";
import { InvoiceDetails } from "../medical-invoice-manager/models/medical-invoice-details";
import { TebaInvoice } from "../medical-invoice-manager/models/teba-invoice";
import { InvoiceLineDetails } from "../medical-invoice-manager/models/medical-invoice-line-details";
import { VatCodeEnum } from "../medical-invoice-manager/enums/vat-code.enum";
import { InvoiceStatusEnum } from "../medical-invoice-manager/enums/invoice-status.enum";
import { SwitchBatchType } from "./enums/switch-batch-type";
import { PayeeTypeEnum } from "../medical-invoice-manager/enums/payee-type.enum";
import { TebaInvoiceLine } from "../medical-invoice-manager/models/teba-invoice-line";
import { LookupTypeEnum } from "projects/shared-models-lib/src/lib/enums/lookup-type-enum";
import { TravelAuthorisation } from "../preauth-manager/models/travel-authorisation";
import { PreAuthorisation } from "../preauth-manager/models/preauthorisation";

export class MedicareUtilities {



  public static Icd10CodesListByCommonSeperator(invoiceLinesIcd10Codes: string[]) {
    let commonSeperatoratedIcd10CodesListResult: string[] = [];
    invoiceLinesIcd10Codes.forEach(lineIcd10Code => {
      //formats
      // S89.9, W22.92 - comma
      // L03.0;M65.04; - semicolon
      // T31.2 T20.1 T21.1 T29.1 W87.62 E61.7 E46 Z50.1 Z71 - space
      // S06.10#S42.10#S61.9#S01.9#S81.0#S82.90#Y34.99 - hash
      // S33.5+M54.16+S93.4 - plus
      // S30.9V49.01 - no seperator

      //remove leading and trainling spaces then use / demiliter for all and join to 1 one
      var commonSeperatoratedIcd10Codes = lineIcd10Code.trim().split(/[\s,;#+]+/).join('/');

      if (commonSeperatoratedIcd10Codes.includes("/")) {
        //remove multiple or duplicate / demiliters example -> "S89.9///W22.92" to "S89.9/W22.92"
        commonSeperatoratedIcd10Codes = commonSeperatoratedIcd10Codes.replace(/\/+/g, '/')
        //remove trailing delimeter  example -> "S89.9/W22.92/" to "S89.9/W22.92"
        commonSeperatoratedIcd10Codes = commonSeperatoratedIcd10Codes.replace(/\/$/g, '')
      }
      else {
        // S30.9V49.01 - no seperator - will handle later once formart has been confirmed
        //commonSeperatoratedIcd10Codes = commonSeperatoratedIcd10Codes.split(/[A-z]+/).join("/");

      }

      commonSeperatoratedIcd10CodesListResult.push(commonSeperatoratedIcd10Codes);

    });
    return commonSeperatoratedIcd10CodesListResult
  }

  public static Icd10CodesListForAllLines(invoiceLinesIcd10Codes: string[]) {
    let icd10CodesListResult: string[] = [];
    invoiceLinesIcd10Codes.forEach(lineIcd10Code => {
      //formats
      // S89.9, W22.92 - comma
      // L03.0;M65.04; - semicolon
      // T31.2 T20.1 T21.1 T29.1 W87.62 E61.7 E46 Z50.1 Z71 - space
      // S06.10#S42.10#S61.9#S01.9#S81.0#S82.90#Y34.99 - hash
      // S33.5+M54.16+S93.4 - plus
      // S30.9V49.01 - no seperator
      // S89.9/W22.92 - forward slash
      var commonSeperatoratedIcd10Codes = lineIcd10Code.split(/[\s,;#+/]+/);
      icd10CodesListResult = Array.from(new Set(commonSeperatoratedIcd10Codes));
    });
    return icd10CodesListResult
  }

  public static getPreauthTypeName(currentUrl: string) {
    //treatment auth urls takes priority because hospital auth urls are not specific
    if (currentUrl.includes("capture-preauth-treatment") || currentUrl.includes("edit-preauth-treatment") || currentUrl.includes("review-treatment-preauth") || currentUrl.includes("treatment-preauth-details'")) {
      return PreauthTypeEnum[PreauthTypeEnum.Treatment]
    }
    else if (currentUrl.includes("preauth-capture-form") || currentUrl.includes("edit-preauth") || currentUrl.includes("review-preauth") || currentUrl.includes("preauth-view")) {
      return PreauthTypeEnum[PreauthTypeEnum.Hospitalization];
    }
    else if (currentUrl.includes("capture-preauth-prosthetist") || currentUrl.includes("prosthetist-preauth-details'") || currentUrl.includes("edit-prosthetic-preauth")) {
      return PreauthTypeEnum[PreauthTypeEnum.Prosthetic]
    }
    else if (currentUrl.includes("hospital-visits")) {
      return PreauthTypeEnum[PreauthTypeEnum.Hospitalization]
    }
    else if (currentUrl.includes("capture-preauth-chronic") || currentUrl.includes("edit-chronic-preauth") || currentUrl.includes("review-chronic-preauth") || currentUrl.includes("chronic-preauth-details")) {
      return PreauthTypeEnum[PreauthTypeEnum.ChronicMedication]
    }
    else {
      return PreauthTypeEnum[PreauthTypeEnum.Unknown];
    }

  }

  public static getPreauthTypeEnumId(preAuthTypeEnumString: string): number {
    let preauthTypeEnumID = +PreauthTypeEnum[preAuthTypeEnumString];
    return preauthTypeEnumID;
  }

  public static getProstheticTypeEnumId(prostheticTypeEnumString: string): number {
    let prostheticTypeEnumID = +ProstheticTypeEnum[prostheticTypeEnumString];
    return prostheticTypeEnumID;
  }

  public static getProstheticQuotationTypeEnumId(prostheticQuotationTypeEnumString: string): number {
    let prostheticTypeEnumID = +ProstheticQuotationTypeEnum[prostheticQuotationTypeEnumString];
    return prostheticTypeEnumID;
  }

  public static getCrudActionTypeEnumId(CrudActionTypeEnumString: string): number {
    if (CrudActionTypeEnumString.includes("preauth-capture-form") || CrudActionTypeEnumString.includes("capture-preauth-treatment") || CrudActionTypeEnumString.includes("capture-preauth-prosthetist") || CrudActionTypeEnumString.includes("capture-preauth-chronic")) {
      return CrudActionType.create;
    }
    else if (CrudActionTypeEnumString.includes("edit-preauth") || CrudActionTypeEnumString.includes("edit-prosthetic-preauth") || CrudActionTypeEnumString.includes("edit-preauth-treatment") || CrudActionTypeEnumString.includes("edit-chronic-preauth")) {
      return CrudActionType.edit
    }
    else {
      return 0;
    }
  }

  public static preAuthWizardType(preauthTypeEnumID: number, action: CrudActionType): string {
    switch (preauthTypeEnumID) {
      case PreauthTypeEnum.Hospitalization:
        if (action == CrudActionType.edit) {
          return 'edit-preauth';
        }
        else if (action == CrudActionType.create) {
          return 'preauth-capture-form';
        }
        else if (action == CrudActionType.review) {
          return 'review-preauth';
        }
        else if (action == CrudActionType.read) {
          return 'preauth-view';
        }
        break;
      case PreauthTypeEnum.Treatment:
        if (action == CrudActionType.edit) {
          return 'edit-preauth-treatment';
        }
        else if (action == CrudActionType.create) {
          return 'capture-preauth-treatment';
        }
        else if (action == CrudActionType.review) {
          return 'review-treatment-preauth';
        }
        else if (action == CrudActionType.read) {
          return 'treatment-preauth-details';
        }
        break;
      case PreauthTypeEnum.ChronicMedication:
        if (action == CrudActionType.edit) {
          return 'edit-chronic-preauth';
        }
        else if (action == CrudActionType.create) {
          return 'capture-preauth-chronic';
        }
        else if (action == CrudActionType.review) {
          return 'review-chronic-preauth';
        }
        else if (action == CrudActionType.read) {
          return 'chronic-preauth-details';
        }
        break;
      case PreauthTypeEnum.Prosthetic:
        if (action == CrudActionType.create) {
          return 'capture-preauth-prosthetist-quote';
        }
        else if (action == CrudActionType.edit) {
          return 'edit-prosthetic-preauth';
        }
        else if (action == CrudActionType.link) {
          return 'capture-preauth-prosthetist';
        }
        else if (action == CrudActionType.read) {
          return 'prosthetist-preauth-details';
        }
        else if (action == CrudActionType.review) {
          return 'review-prosthetic-preauth';
        }
    }
  }

  public static formatLookup(lookup: string): string {
    //format enum values for HTML display purposes example: ChronicMedication to Chronic Medication
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  public static ToArray(anyEnum: { [x: string]: any; }) {
    //convert enum to array
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  public static getLookups(anyEnum): any[] {
    //get Enum as param and return array 
    let arrayResult = this.ToArray(anyEnum);
    return arrayResult;
  }

  public static getPreAuthStatus(requestType: string): number {
    switch (requestType) {
      case RequestType.Authorise:
        return PreAuthStatus.Authorised;
      case RequestType.Reject:
        return PreAuthStatus.Rejected;
      case RequestType.RequestInfo:
        return PreAuthStatus.InfoRequired;
      case RequestType.SendForReview:
        return PreAuthStatus.PendingReview;
    }
  }

  public static formatDateIgnoreTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  public static getIsInHospitalStatus(isInHospital: any): string {
    if (isInHospital == null)
      return 'Info not available';
    else
      return isInHospital ? 'Yes' : 'No';
  }


  public static getDiffDays(startDate, endDate): number {
    return Math.ceil(Math.abs(startDate - endDate) / (1000 * 60 * 60 * 24));
  }

  public static isChronic(dateTreatmentFrom: Date, dateTreatmentTo: Date): boolean {
    dateTreatmentTo = new Date(dateTreatmentTo)
    dateTreatmentFrom = new Date(dateTreatmentFrom)
    let isChronic = false;
    let daysFromEventDate = Math.floor((Date.UTC(dateTreatmentTo.getFullYear(), dateTreatmentTo.getMonth(), dateTreatmentTo.getDate()) - Date.UTC(dateTreatmentFrom.getFullYear(), dateTreatmentFrom.getMonth(), dateTreatmentFrom.getDate())) / (1000 * 60 * 60 * 24));
    if (daysFromEventDate > 730) {
      isChronic = true;
    }
    return isChronic;
  }

  public static convertTebaInvoiceToInvoiceDetails(teba: TebaInvoice): InvoiceDetails {
    //header
    let invoiceDetails: InvoiceDetails = {
      serviceDate: teba.dateCompleted,
      serviceTimeStart: "",
      serviceTimeEnd: "",
      eventDate: teba.dateTravelledFrom,
      dateOfDeath: "",
      claimReferenceNumber: teba.claimReferenceNumber,
      healthCareProviderName: teba.healthCareProviderName,
      payeeName: teba.payeeId.toString(),
      payeeType: teba.payeeTypeId.toString(),
      underAssessReason: "",
      practitionerTypeId: 0,
      practitionerTypeName: "",
      practiceNumber: teba.practiceNumber,
      isVat: false,
      vatRegNumber: "",
      greaterThan731Days: MedicareUtilities.isChronic(new Date(teba.dateTravelledFrom), new Date(teba.dateTravelledTo)),
      invoiceLineDetails: [],
      paymentConfirmationDate: new Date().toISOString(),
      batchNumber: "",
      invoiceStatusDesc: "",
      eventId: 0,
      person: "",
      status: "",
      invoiceId: teba.tebaInvoiceId,
      claimId: teba.claimId,
      personEventId: teba.personEventId,
      healthCareProviderId: teba.invoicerId,
      hcpInvoiceNumber: teba.hcpInvoiceNumber,
      hcpAccountNumber: teba.hcpAccountNumber,
      invoiceNumber: teba.invoiceNumber,
      invoiceDate: teba.dateSubmitted,
      dateSubmitted: teba.dateSubmitted,
      dateReceived: teba.dateReceived,
      dateAdmitted: teba.dateTravelledFrom,
      dateDischarged: teba.dateTravelledTo,
      invoiceStatus: teba.invoiceStatus,
      invoiceAmount: teba.invoiceAmount,
      invoiceVat: teba.invoiceVat,
      invoiceTotalInclusive: teba.invoiceTotalInclusive,
      authorisedAmount: teba.authorisedAmount,
      authorisedVat: teba.authorisedVat,
      authorisedTotalInclusive: teba.authorisedTotalInclusive,
      payeeId: teba.payeeId,
      payeeTypeId: teba.payeeTypeId,
      underAssessReasonId: 0,
      underAssessedComments: "",
      switchBatchInvoiceId: teba.switchBatchInvoiceId,
      switchBatchId: teba.switchBatchId,
      holdingKey: "",
      isPaymentDelay: false,
      isPreauthorised: false,
      preAuthXml: "",
      comments: "",
      invoiceLines: [],
      invoiceUnderAssessReasons: teba.invoiceUnderAssessReasons,
      isMedicalReportExist: false,
      medicalInvoiceReports: [],//teba.medicalInvoiceReports, awaiting feedback from business whether to be removed as it's not applicable to Teba
      medicalInvoicePreAuths: [],//teba.medicalInvoicePreAuths awiating backend to be rectified,
      id: teba.id,
      createdBy: teba.createdBy,
      modifiedBy: teba.modifiedBy,
      createdDate: teba.createdDate,
      modifiedDate: teba.modifiedDate,
      isActive: teba.isActive,
      isDeleted: teba.isDeleted,
      canEdit: teba.canEdit,
      canAdd: teba.canAdd,
      canRemove: teba.canRemove,
      permissionIds: []
    }

    teba.tebaInvoiceLines.forEach(element => {

      let invoiceLineDetails: InvoiceLineDetails = {
        //line
        tariffBaseUnitCostType: "",
        tariffDescription: "",
        defaultQuantity: element.requestedQuantity,
        validationMark: "done",
        invoiceLineId: element.tebaInvoiceLineId,
        invoiceId: element.tebaInvoiceId,
        serviceDate: element.serviceDate,
        serviceTimeStart: "",
        serviceTimeEnd: "",
        requestedQuantity: element.requestedQuantity,
        authorisedQuantity: element.authorisedQuantity,
        requestedAmount: element.requestedAmount,
        requestedVat: element.requestedVat,
        requestedAmountInclusive: element.requestedAmountInclusive,
        authorisedAmount: element.authorisedAmount,
        authorisedVat: element.authorisedVat,
        authorisedAmountInclusive: element.authorisedAmountInclusive,
        totalTariffAmount: element.totalTariffAmount,
        totalTariffVat: element.totalTariffVat,
        totalTariffAmountInclusive: element.totalTariffAmountInclusive,
        tariffAmount: element.tariffAmount,
        creditAmount: element.creditAmount,
        vatCode: element.vatCode,
        vatPercentage: element.vatPercentage,
        tariffId: element.tariffId,
        treatmentCodeId: 0,
        medicalItemId: 0,
        hcpTariffCode: element.hcpTariffCode,
        tariffBaseUnitCostTypeId: 0,
        description: element.description,
        summaryInvoiceLineId: 0,
        isPerDiemCharge: false,
        isDuplicate: false,
        duplicateInvoiceLineId: element.duplicateTebaInvoiceLineId,
        calculateOperands: "",
        icd10Code: "",
        invoiceLineUnderAssessReasons: element.invoiceLineUnderAssessReasons,
        quantity: 0,
        totalInvoiceLineCost: element.authorisedAmount,
        totalInvoiceLineVat: element.authorisedVat,
        totalInvoiceLineCostInclusive: element.authorisedAmountInclusive,
        isModifier: false,
        publicationId: 0,
        id: element.id,
        createdBy: element.createdBy,
        modifiedBy: element.modifiedBy,
        createdDate: element.createdDate,
        modifiedDate: element.modifiedDate,
        isActive: element.isActive,
        isDeleted: element.isDeleted,
        canEdit: element.canEdit,
        canAdd: element.canAdd,
        canRemove: element.canRemove,
        permissionIds: []
      }

      invoiceDetails.invoiceLineDetails.push(invoiceLineDetails)

    });
    return invoiceDetails
  }

  public static convertInvoiceDetailsToTebaInvoice(invoice: InvoiceDetails): TebaInvoice {
    //header
    let invoiceTotKilometers = invoice.invoiceLineDetails.map(t => t.requestedQuantity).reduce((acc, value) => acc + value, 0);
    let tariffCode =  invoice.invoiceLineDetails.find(t => t.hcpTariffCode.length > 0).hcpTariffCode;
    let selectedTravelRateTypeId = Number(tariffCode);
    let tebaInvoiceDetailsResult: TebaInvoice = {
      tebaInvoiceId: invoice.invoiceId,
      claimId: invoice.claimId,
      personEventId: invoice.personEventId,
      healthCareProviderId: invoice.healthCareProviderId,
      hcpInvoiceNumber: invoice.hcpInvoiceNumber,
      hcpAccountNumber: invoice.hcpAccountNumber,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dateSubmitted: invoice.dateSubmitted,
      dateReceived: invoice.dateReceived,
      preAuthId: null, //will implement arrar if medicalInvoicePreAuths
      invoiceStatus: invoice.invoiceStatus,
      kilometers: invoiceTotKilometers, //--awaiting feedback from business
      kilometerRate: selectedTravelRateTypeId, //--awaiting feedback from business
      dateTravelledFrom: invoice.dateAdmitted,
      dateTravelledTo: invoice.dateDischarged,
      TebaTariffCode: selectedTravelRateTypeId.toString(), //--awaiting feedback from business
      invoiceAmount: invoice.invoiceAmount,
      invoiceVat: invoice.invoiceVat,
      invoiceTotalInclusive: invoice.invoiceTotalInclusive,
      authorisedAmount: invoice.authorisedAmount,
      authorisedVat: invoice.authorisedVat,
      authorisedTotalInclusive: invoice.authorisedTotalInclusive,
      payeeId: invoice.healthCareProviderId, //need values for Teba awaiting feedback from business
      payeeTypeId: PayeeTypeEnum.Teba, //need values for Teba awaiting feedback from business//PayeeTypeEnum.HealthCareProvider, //healthcare provider should be 5 
      holdingKey: null,
      isPaymentDelay: false,
      isPreauthorised: invoice.isPreauthorised,
      vatPercentage: 0,
      vatCode: VatCodeEnum.StandardVATRate, //--awaiting feedback from business
      switchBatchId: invoice.switchBatchId,
      switchTransactionNo: undefined,
      tebaInvoiceLines: [], //initially empty and it is being set below on forEach
      invoiceUnderAssessReasons: invoice.invoiceUnderAssessReasons,
      isMedicalReportExist: false,
      medicalInvoiceReports: [],//invoice.medicalInvoiceReports, awaiting feedback from business whether to be removed as it's not applicable to Teba
      medicalInvoicePreAuths: [],//invoice.medicalInvoicePreAuths,awiating backend to be rectified,
      id: invoice.id,
      createdBy: invoice.createdBy,
      modifiedBy: invoice.modifiedBy,
      createdDate: invoice.createdDate,
      modifiedDate: invoice.modifiedDate,
      isActive: invoice.isActive,
      isDeleted: invoice.isDeleted,
      canEdit: invoice.canEdit,
      canAdd: invoice.canAdd,
      canRemove: invoice.canRemove,
      permissionIds: [],
      //
      invoicerId: invoice.healthCareProviderId, //Teba awaiting feedback from business,
      invoicerTypeId: PayeeTypeEnum.Teba, //Teba awaiting feedback from business//PayeeTypeEnum.HealthCareProvider, //healthcare provider should be 5 ,
      dateCompleted: '',
      description: '',
      calcOperands: '',
      switchBatchType: SwitchBatchType.Teba,
      switchBatchInvoiceId: invoice.switchBatchInvoiceId,
      claimReferenceNumber: invoice.claimReferenceNumber,
      healthCareProviderName: invoice.healthCareProviderName,
      practiceNumber: invoice.practiceNumber
    }
    invoice.invoiceLineDetails.forEach(element => {
      //line
      let elementTebaInvoiceLine: TebaInvoiceLine = {
        tebaInvoiceLineId: element.invoiceLineId,
        tebaInvoiceId: element.invoiceLineId,
        serviceDate: element.serviceDate,
        requestedQuantity: Number(element.quantity),
        requestedAmount: element.totalInvoiceLineCost,
        requestedVat: element.totalInvoiceLineVat,
        requestedAmountInclusive: element.requestedAmountInclusive,
        authorisedQuantity: element.authorisedQuantity,
        authorisedAmount: element.authorisedAmount,
        authorisedVat: element.authorisedVat,
        authorisedAmountInclusive: element.authorisedAmountInclusive,
        totalTariffAmount: element.totalTariffAmount,
        totalTariffVat: element.totalTariffVat,
        totalTariffAmountInclusive: element.totalTariffAmountInclusive,
        tariffAmount: element.tariffAmount,
        creditAmount: element.creditAmount,
        vatCode: (element.totalInvoiceLineVat > 0) ? VatCodeEnum.StandardVATRate : VatCodeEnum.VATExempt,
        vatPercentage: element.vatPercentage,
        tariffId: element.tariffId,
        treatmentCodeId: element.treatmentCodeId,
        medicalItemId: element.medicalItemId,
        hcpTariffCode: element.hcpTariffCode,
        tariffBaseUnitCostTypeId: 0,
        description: element.description,
        summaryInvoiceLineId: element.summaryInvoiceLineId,
        isPerDiemCharge: element.isPerDiemCharge,
        isDuplicate: element.isDuplicate,
        duplicateTebaInvoiceLineId: element.duplicateInvoiceLineId,
        calculateOperands: element.calculateOperands,
        invoiceLineUnderAssessReasons: element.invoiceLineUnderAssessReasons,
        validationMark: 'done',
        id: element.id,
        createdBy: element.createdBy,
        modifiedBy: element.modifiedBy,
        createdDate: element.createdDate,
        modifiedDate: element.modifiedDate,
        isActive: element.isActive,
        isDeleted: element.isDeleted,
        canEdit: element.canEdit,
        canAdd: element.canAdd,
        canRemove: element.canRemove,
        permissionIds: []
      }

      tebaInvoiceDetailsResult.tebaInvoiceLines.push(elementTebaInvoiceLine)

    });
    return tebaInvoiceDetailsResult
  }

  public static convertTravelAuthorisationToPreAuthorisation(travelAuth: TravelAuthorisation): PreAuthorisation {
    //main crucial details
    let preAuthorisationDetails: PreAuthorisation = {
      preAuthId: travelAuth.travelAuthorisationId,
      claimId: 0,
      personEventId: travelAuth.personEventId,
      healthCareProviderId: travelAuth.payeeId,
      requestingHealthCareProviderId: travelAuth.payeeId,
      preAuthNumber: travelAuth.travelAuthNumber,
      preAuthType: PreauthTypeEnum.TravelAuth,
      preAuthStatus: travelAuth.isPreAuthorised ? PreAuthStatus.Authorised : PreAuthStatus.PendingReview,
      dateAuthorisedFrom: travelAuth.dateAuthorisedFrom,
      dateAuthorisedTo: travelAuth.dateAuthorisedTo,
      dateAuthorised: travelAuth.isPreAuthorised ? travelAuth.modifiedDate : travelAuth.createdDate,
      requestedAmount: +travelAuth.authorisedAmount,
      authorisedAmount: +travelAuth.authorisedAmount,
      requestComments: travelAuth.description,
      reviewComments: travelAuth.description,
      hospitalAuthId: 0,
      isHighCost: false,
      isRequestFromHcp: false,
      temporaryReferenceNo: "",
      injuryDate: travelAuth.dateAuthorisedFrom,
      isClaimLinked: false,
      isPatientVerified: false,
      preAuthContactNumber: "",
      isRehabilitationRequest: false,
      isWoundCareTreatment: false,
      isMedicationRequired: false,
      isClaimReopeningRequest: false,
      isPreRequest: false,
      preAuthorisationBreakdowns: [],
      preAuthorisationUnderAssessReasons: [],
      preAuthRehabilitations: [],
      preAuthIcd10Codes: [],
      practitionerTypeId: 0,
      subPreAuthorisations: [],
      preAuthTreatmentBaskets: [],
      healthCareProviderName: "",
      practiceNumber: "",
      claimReferenceNumber: "",
      isVat: false,
      preAuthActivities: [],
      preAuthMotivationForClaimReopenings: [],
      isInHospital: false,
      prosthetistQuoteId: 0,
      preAuthChronicRequestTypeId: 0,
      scriptRepeats: "",
      comments: travelAuth.description,
      capturedDate: travelAuth.createdDate,
      preAuthChronicCMLs: [],
      chronicMedicationForms: [],
      chronicMedicationFormRenewals: [],
      createdBy: travelAuth.createdBy,
      chronicApplicationType: "",
      eventDate: travelAuth.dateAuthorisedFrom,
      prostheticQuotationType: ProstheticQuotationTypeEnum.Unspecified,
      id: 0,
      modifiedBy: travelAuth.modifiedBy,
      createdDate: travelAuth.createdDate,
      modifiedDate: travelAuth.modifiedDate,
      isActive: travelAuth.isActive,
      isDeleted: travelAuth.isDeleted,
      canEdit: travelAuth.canEdit,
      canAdd: travelAuth.canAdd,
      canRemove: travelAuth.canRemove,
      permissionIds: []
    }

    return preAuthorisationDetails
  }

}
