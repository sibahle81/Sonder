namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventAccidentDetail
    {
        public int PersonEventId { get; set; } // PersonEventId (Primary key)
        public bool IsOccurAtNormalWorkplace { get; set; } // IsOccurAtNormalWorkplace
        public bool? IsOccurPerformingScopeofDuty { get; set; } // IsOccurPerformingScopeofDuty
        public bool IsRoadAccident { get; set; } // IsRoadAccident
        public bool IsOnBusinessTravel { get; set; } // IsOnBusinessTravel
        public bool IsTrainingTravel { get; set; } // IsTrainingTravel
        public bool IsTravelToFromWork { get; set; } // IsTravelToFromWork
        public bool IsOnCallout { get; set; } // IsOnCallout
        public bool IsOnStandby { get; set; } // IsOnStandby
        public bool IsPublicRoad { get; set; } // IsPublicRoad
        public bool IsPrivateRoad { get; set; } // IsPrivateRoad
        public string VehicleMake { get; set; } // VehicleMake (length: 50)
        public string VehicleRegNo { get; set; } // VehicleRegNo (length: 50)
        public string ThirdPartyVehicleMake { get; set; } // ThirdPartyVehicleMake (length: 50)
        public string ThirdPartyVahicleRegNo { get; set; } // ThirdPartyVahicleRegNo (length: 50)
        public string PoliceReferenceNo { get; set; } // PoliceReferenceNo (length: 50)
        public string PoliceStationName { get; set; } // PoliceStationName (length: 50)
    }
}
