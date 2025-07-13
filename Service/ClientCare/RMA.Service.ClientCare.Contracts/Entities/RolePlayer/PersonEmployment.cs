namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class PersonEmployment
    {
        public int PersonEmpoymentId { get; set; } // PersonEmpoymentId (Primary key)
        public int EmployeeRolePlayerId { get; set; } // EmployeeRolePlayerId
        public int EmployerRolePlayerId { get; set; } // EmployerRolePlayerId
        public string EmployeeNumber { get; set; } // EmployeeNumber (length: 50)
        public System.DateTime StartDate { get; set; } // StartDate
        public System.DateTime? EndDate { get; set; } // EndDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime? CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime? ModifiedDate { get; set; } // ModifiedDate
        public bool? IsTraineeLearnerApprentice { get; set; } // IsTraineeLearnerApprentice
        public bool? IsSkilled { get; set; } // isSkilled
        public int? YearsInIndustry { get; set; } // YearsInIndustry
        public int? YearsInPresentOccupation { get; set; } // YearsInPresentOccupation
        public int? PatersonGradingId { get; set; } // PetarsonGradingId
        public string RmaEmployeeRefNum { get; set; } // RMAEmployeeRefNum (length: 50)
        public string EmployeeIndustryNumber { get; set; } // EmployeeIndustryNumber (length: 150)
        public int DesignationTypeId { get; set; } // DesignationTypeId
    }
}