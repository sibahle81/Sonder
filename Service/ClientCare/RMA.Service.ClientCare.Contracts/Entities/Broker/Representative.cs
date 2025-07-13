using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Integrations.Contracts.Entities.Fspe;

using System;
using System.Collections.Generic;
using System.Linq;

namespace RMA.Service.ClientCare.Contracts.Entities.Broker
{
    public class Representative //: RepEntity
    {
        //Base type
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
        public List<RepresentativeLicenseCategory> Categories { get; set; }
        public List<RepresentativeQualification> Qualifications { get; set; }
        public RepTypeEnum? RepType { get; set; }

        //Other
        public int Id { get; set; } // Id (Primary key)
        public string Code { get; set; } // Code (length: 50)
        public string ContactNumber { get; set; } // ContactNumber (length: 50)
        public string Email { get; set; } // Email (length: 150)
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate

        public PaymentMethodEnum? PaymentMethod { get; set; } // PaymentMethodId
        public PaymentFrequencyEnum? PaymentFrequency { get; set; } // PaymentFrequencyId

        public List<RepresentativeBankAccount> RepresentativeBankAccounts { get; set; }

        public List<BrokerageRepresentative> BrokerageRepresentatives { get; set; } // BrokerageRepresentative.FK_BrokerageRepresentative_Representative
        public List<Note> RepresentativeNotes { get; set; } // RepresentativeNote.FK_RepresentativeNote_Representative

        public string Name
        {
            get => string.Concat(FirstName, " ", SurnameOrCompanyName).Trim();
        }

        public List<ValidityCheck> RepresentativeChecks { get; set; }

        public BrokerageRepresentative ActiveBrokerage
        {
            get => GetActiveBrokerage();
        }

        private BrokerageRepresentative GetActiveBrokerage()
        {
            if (BrokerageRepresentatives == null) return null;
            if (BrokerageRepresentatives.Count == 1) return BrokerageRepresentatives[0];
            var list = BrokerageRepresentatives.Where(br => br.StartDate.HasValue).OrderByDescending(br => br.StartDate).ToList();
            if (list.Count == 0) return BrokerageRepresentatives.OrderByDescending(br => br.Id).FirstOrDefault();
            var entity = list.FirstOrDefault(
                br => br.StartDate.HasValue
                        && br.StartDate <= DateTimeHelper.SaNow.Date
                        && (br.EndDate.HasValue ?
                            br.EndDate : DateTimeHelper.SaNow.Date) >= DateTimeHelper.SaNow.Date
                );
            return entity == null ? list[0] : entity;
        }
    }
}
