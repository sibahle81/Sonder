import { ChronicMedicationHistory } from "./chronic-medical-history";
import { ChronicScriptMedicine } from "./chronic-script-medicine";

export class ChronicMedicationForm
{
    chronicMedicationFormId: number;
    claimId: number;
    preAuthId: number;
    isSignedByApplicant: boolean;
    height: number;
    weight: number;
    bloodPressure: string;
    urine: string;
    allergies: string;
    hivStatus: string;
    description:string;
    dateFormFilled:Date;
    dateSubmitted:Date;
    dateConsulted: Date;
    medicalServiceProviderId: number;
    deliveryMethod: number;
    hobbies: string;
    deliveryAddress:string;
    isSignedByHcp: boolean;
    dateSignedByHcp: Date; 
    chronicScriptMedicines: ChronicScriptMedicine[];
    chronicMedicalHistories: ChronicMedicationHistory[];
}
