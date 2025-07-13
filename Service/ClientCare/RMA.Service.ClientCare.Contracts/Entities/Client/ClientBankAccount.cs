using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class ClientBankAccount : AuditDetails
    {
        public ClientBankAccount()
        {
            BankAccountServiceTypeIds = new List<int>();
        }

        public int BankId { get; set; }
        public int BankBranchId { get; set; }
        public string AccountNumber { get; set; }
        public string AccountHolderName { get; set; }
        public PaymentMethodEnum PaymentMethod { get; set; }
        public BankAccountTypeEnum BankAccountType { get; set; }
        public BeneficiaryTypeEnum? BeneficiaryType { get; set; }
        public string UniversalBranchCode { get; set; }
        public int ItemId { get; set; }
        public string ItemType { get; set; }
        public List<int> BankAccountServiceTypeIds { get; set; }
        public bool VerifyBankAccount { get; set; }
        public bool? IsApproved { get; set; }
        public string Reason { get; set; }
        public string ApprovalRequestedFor { get; set; }
        public int? ApprovalRequestId { get; set; }
        public int PaymentMethodId
        {
            get => (int)PaymentMethod;
            set => PaymentMethod = (PaymentMethodEnum)value;
        }
        //ENUM => ID Conversions
        public int BankAccountTypeId
        {
            get => (int)BankAccountType;
            set => BankAccountType = (BankAccountTypeEnum)value;
        }
        //ENUM => ID Conversions
        public int BeneficiaryTypeId
        {
            get => (int)BeneficiaryType.GetValueOrDefault();
            set => BeneficiaryType = (BeneficiaryTypeEnum)value;
        }
    }
}