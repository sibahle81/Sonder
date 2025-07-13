export class TravelAuthorisation{
      travelAuthorisationId : number; 
      personEventId : number; 
      travelAuthorisedPartyId : number; 
      dateAuthorisedFrom : Date;  
      dateAuthorisedTo : Date; 
      authorisedKm : number; 
      travelRateTypeId : number;
      authorisedRate : number;
      authorisedAmount: number;
      description: string;
      isPreAuthorised: boolean;
      createdBy : string;
      createdDate : Date;
      modifiedBy : string;
      modifiedDate : Date;
}