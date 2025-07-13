namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class PreviousInsurerRolePlayer
    {
        public int Id { get; set; } // ID (Primary key)
        public int PreviousInsurerId { get; set; } // PreviousInsurerID
        public int RolePlayerId { get; set; } // RolePlayerID
        public string PolicyNumber { get; set; } // PolicyNumber
        public System.DateTime PolicyStartDate { get; set; } // PolicyStartDate
        public System.DateTime PolicyEndDate { get; set; } // PolicyEndDate
        public decimal? SumAssured { get; set; } // SumAssured
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}



