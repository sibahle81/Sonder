using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class BankAccountVerification : AuditDetails
    {
        public bool? IsValid { get; set; } // IsValid
        public BankAccountVerificationPurposeTypeEnum BankAccountVerificationPurposeType { get; set; } // BankAccountVerificationPurposeTypeId
        public string AccountNumber { get; set; } // AccountNumber (length: 20)
    }
}
