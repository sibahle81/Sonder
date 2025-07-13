using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PensionCaseRecipientsData : Person
    {

        public RolePlayerContact Contact { get; set; }
        public int FamilyUnit { get; set; }
        public bool IsRecipient { get; set; }
        public string WorkPermitNumber { get; set; }
        public DateTime ProofOfLife { get; set; }
        public string TaxReferenceNumber { get; set; }
        public BeneficiaryTypeEnum BeneficiaryType { get; set; }
        public new LanguageEnum Language { get; set; }
        public string IndividualIndicator { get; set; }
        public new int ProvinceId { get; set; }
        public new string PopulationGroup { get; set; }
        public new DateTime MarriageDate { get; set; }
        public string OtherIdNumber { get; set; }
        public string Col { get; set; }
        public string Occupation { get; set; }
        public int Index { get; set; }
        public new int Age { get; set; }
    }
}
