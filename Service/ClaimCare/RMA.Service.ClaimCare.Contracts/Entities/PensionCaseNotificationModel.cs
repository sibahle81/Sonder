using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PensionCaseNotificationModel
    {
        public PensionCaseData PensionCase { get; set; }
        public PensionCasePensionerData Pensioner { get; set; }
        public List<PensionCaseBeneficiariesData> Beneficiaries { get; set; }
        public List<PensionCaseRecipientsData> Recipients { get; set; }
        public List<PensionCaseBankingDetailsData> BankingDetails { get; set; }

    }
}
