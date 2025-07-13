import { Visit } from "projects/medicare/src/app/pmp-manager/models/visit";

export class PensionerDetail {
    pensionCaseNumber: string;
    pensionerId: number;
    personEventId: number;
    claimId: number;
    eventId: number;
    serviceName: string;
    scheduleDate: Date;
    isScheduleON: boolean;
    attendedClinic: boolean;
    excludePMPSchedule: boolean;
    clinicVenueId: number;
    visits: Visit[];
}
