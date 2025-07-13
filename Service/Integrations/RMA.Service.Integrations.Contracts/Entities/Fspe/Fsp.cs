using System.Collections.Generic;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    public class Fsp
    {
        public string FspNumber { get; set; } // FSPNumber (length: 50)
        public string Name { get; set; } // Name (length: 255)
        public string TradeName { get; set; } // TradeName (length: 255)
        public string LegalCapacity { get; set; } // LegalCapacity (length: 255)
        public string RegNo { get; set; } // RegNo (length: 255)
        public string Status { get; set; } // Status (length: 255)
        public string CompanyType { get; set; } // CompanyType (length: 5)
        public string FaxNo { get; set; } // FaxNo (length: 20)
        public string TelNo { get; set; } // TelNo (length: 20)
        public string FspWebsite { get; set; } // FspWebsite (length: 255)
        public string FinYearEnd { get; set; } // FinYearEnd (length: 50)
        public string MedicalAccreditationNo { get; set; } // MedicalAccreditationNo (length: 255)
        public bool IsActive { get; set; }

        //Should Have this.
        public ComplianceOfficer ComplianceOfficer { get; set; }
        public ContactPerson ContactPerson { get; set; }
        public List<Address> Addresses { get; set; }
        public List<FspLicenseCategory> Categories { get; set; }
        public List<RepEntity> SoleProprietors { get; set; }
        public List<RepEntity> KeyIndividuals { get; set; }
        public List<RepEntity> Representatives { get; set; }
    }
}
