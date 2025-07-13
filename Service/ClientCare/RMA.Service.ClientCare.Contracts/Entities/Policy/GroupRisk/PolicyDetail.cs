using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class PolicyDetail
    {
        public int PolicyDetailId { get; set; } // PolicyDetailId (Primary key)
        public int PolicyId { get; set; } // PolicyId
        public System.DateTime EffectiveDate { get; set; } // EffectiveDate
        public byte PolicyAnniversaryMonth { get; set; } // PolicyAnniversaryMonth
        public string PolicyName { get; set; } // PolicyName (length: 100)
        public PaymentFrequencyEnum? PaymentFrequency { get; set; } // PaymentFrequencyId
        public int PolicyAdministratorId { get; set; } // PolicyAdministratorId
        public int PolicyConsultantId { get; set; } // PolicyConsultantId
        public int? PolicyHolderId { get; set; } // PolicyHolderId
        public int? QuoteId { get; set; } // QuoteId
        public System.DateTime? LastReviewDate { get; set; } // LastReviewDate
        public System.DateTime? NextReviewDate { get; set; } // NextReviewDate
        public bool IsDeleted { get; set; } // IsDeleted
        public string CreatedBy { get; set; } // CreatedBy (length: 50)
        public System.DateTime CreatedDate { get; set; } // CreatedDate
        public string ModifiedBy { get; set; } // ModifiedBy (length: 50)
        public System.DateTime ModifiedDate { get; set; } // ModifiedDate
    }
}
