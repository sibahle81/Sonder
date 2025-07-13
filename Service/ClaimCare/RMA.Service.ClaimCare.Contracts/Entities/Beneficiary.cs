using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Enums.RolePlayer;

using System;
using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Beneficiary : AuditDetails
    {
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public string CompanyName { get; set; }
        public string Registration { get; set; }
        public string ContactNumber { get; set; }
        public string IdNumber { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string PassportNumber { get; set; }
        public string PostalCode { get; set; }
        public string City { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Email { get; set; }
        public int RelationId { get; set; }
        public string ContactPerson { get; set; }
        public string RelationOfDeceased { get; set; }
        public int BeneficiaryId { get; set; }
        public List<BeneficiaryBankAccount> BankAccounts { get; set; }
        public BeneficiaryBankAccount BankAccount { get; set; }
        public RolePlayerBankingDetail RolePlayerBankAccount { get; set; }
        public string MessageText { get; set; }
        public BeneficiaryTypeEnum BeneficiaryType { get; set; }
        public RolePlayerTypeEnum RolePlayerType { get; set; }
        public int InsuredLifeId { get; set; }
        public string TelephoneNumber { get; set; }
        public string MobileNumber { get; set; }
        public decimal AllocationPercentage { get; set; }
        public bool? IsChildDisabled { get; set; }
        public bool? IsInsuredLife { get; set; }
        public bool? IsBeneficiary { get; set; }
        public int? InsuredLifeProductOptionCover { get; set; }

        //ENUM => ID Conversions
        public int BeneficiaryTypeId
        {
            get => (int)BeneficiaryType;
            set => BeneficiaryType = (BeneficiaryTypeEnum)value;
        }
        public int RolePlayerTypeId
        {
            get => (int)RolePlayerType;
            set => RolePlayerType = (RolePlayerTypeEnum)value;
        }
    }

    public class BeneficiaryBankAccount
    {
        public int Id { get; set; }
        public string NameOfAccountHolder { get; set; }
        public string BankName { get; set; }
        public int BankBranchId { get; set; }
        public string BankBranchName { get; set; }
        public string AccountNumber { get; set; }
        public string BankBranchNumber { get; set; }
        public BankAccountTypeEnum BankAccountType { get; set; }
        public bool IsPendingEdit { get; set; }
        public int BankId { get; set; }
        public string UniversalBranchCode { get; set; }
        public bool IsPendingAdd { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public bool? IsApproved { get; set; }
        public string Reason { get; set; }
        public bool HaveAllDocumentsAccepted { get; set; }
        public bool IsWizardCompleted { get; set; }
        public string MessageText { get; set; }

        //ENUM => ID Conversions
        public int BankAccountTypeId
        {
            get => (int)BankAccountType;
            set => BankAccountType = (BankAccountTypeEnum)value;
        }
        public string AccountType { get; set; }
    }
}