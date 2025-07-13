import { VopdStatusEnum } from "../enums/vopd-status.enum";

export class ClientVopdResponse {
    vopdResponseId: number;
    rolePlayerId: number;
    vopdStatus: VopdStatusEnum;
    reason: string;
    identity: boolean;
    maritalStatus: boolean;
    death: boolean;
    dateVerified: Date;
    idNumber: string;
    firstName: string;
    surname: string;
    deceasedStatus: string;
}
