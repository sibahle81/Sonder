using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class UploadInsuredLife
    {
        public int Id { get; set; } // Id (Primary key)
        public System.Guid FileIdentifier { get; set; } // FileIdentifier
        public string MemberNumber { get; set; } // MemberNumber (length: 256)
        public string Passport { get; set; } // Passport (length: 32)
        public string IdNumber { get; set; } // IDNumber (length: 32)
        public string FirstName { get; set; } // FirstName (length: 256)
        public string Surname { get; set; } // Surname (length: 256)
        public string Gender { get; set; } // Gender (length: 32)
        public string Nationality { get; set; } // Nationality (length: 32)
        public string CellNumber { get; set; } // CellNumber (length: 32)
        public string HomeAddress { get; set; } // HomeAddress (length: 256)
        public string PostalCode { get; set; } // PostalCode (length: 32)
        public string PostalAddress { get; set; } // PostalAddress (length: 256)
        public string Code { get; set; } // Code (length: 32)
        public string Province { get; set; } // Province (length: 32)
        public string EmployeeNumber { get; set; } // EmployeeNumber (length: 32)
        public string EmploymentDate { get; set; } // EmploymentDate (length: 32)
        public string Occupation { get; set; } // Occupation (length: 32)
        public string AnnualEarnings { get; set; } // AnnualEarnings (length: 32)
        public FinPayee FinPayee { get; set; }
        public List<RolePlayerPolicy> RolePlayerPolicies { get; set; }
        public string DateOfBirth { get; set; } // DateOfBirth
    }
}