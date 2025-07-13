export class PersonEventAccidentDetail {
    personEventId: number;
    isOccurAtNormalWorkplace: boolean;
    isOccurPerformingScopeofDuty: boolean | null;
    isRoadAccident: boolean;
    isOnBusinessTravel: boolean;
    isTrainingTravel: boolean;
    isTravelToFromWork: boolean;
    isOnCallout: boolean;
    isOnStandby: boolean;
    isPublicRoad: boolean;
    isPrivateRoad: boolean;
    vehicleMake: string;
    vehicleRegNo: string;
    thirdPartyVehicleMake: string;
    thirdPartyVahicleRegNo: string;
    policeReferenceNo: string;
    policeStationName: string;
}
