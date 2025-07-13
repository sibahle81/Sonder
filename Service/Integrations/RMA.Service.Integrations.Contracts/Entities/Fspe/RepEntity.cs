using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe
{
    public class RepEntity
    {
        public string Title { get; set; }
        public string Initials { get; set; }
        public string FirstName { get; set; }
        public string SurnameOrCompanyName { get; set; }
        public string IdNumber { get; set; }
        public IdTypeEnum IdType { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string CountryOfRegistration { get; set; }
        public Address PhysicalAddress { get; set; }
        public DateTime DateOfAppointment { get; set; }
        public string MedicalAccreditationNo { get; set; }

        public List<RepLicenseCategory> Categories { get; set; }
        public List<RepQualification> RepQualifications { get; set; }
        public RepTypeEnum RepType { get; set; }
    }
}
