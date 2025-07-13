import { ChronicScriptMedicineRenewal } from "./chronic-script-medicine-renewal";

export class ChronicMedicationFormRenewal
{
    chronicMedicationFormRenewalId: number;
    claimId: number;
    medicalServiceProviderId: number;
    description:string;
    isNeurogenicPain: boolean;
    isMechanicalPain: boolean;
    isDegenerativePain: boolean;
    isPsychogenicPain: boolean;
    isMuslcespasmPain: boolean;
    isFibromialgiaPain: boolean;    
    painEvaluation: number;
    continuousDuration: number;
    isLifeStyleChanges: boolean;
    isPhysiotherapy: boolean;
    isNerveBlock: boolean;
    isArthroplasty: boolean;
    isPsychotherapy: boolean;
    isAccupuncture: boolean;
    dateSubmitted:Date;
    dateConsulted: Date;
    hobbies: string;
    deliveryMethod: number;
    preAuthId: number;
    deliveryAddress:string;
    isSignedByHcp: boolean;
    dateSignedByHcp: Date;
    authorisedChronicAuthorisationId: number; 
    chronicScriptMedicineRenewals: ChronicScriptMedicineRenewal[]; 
}
