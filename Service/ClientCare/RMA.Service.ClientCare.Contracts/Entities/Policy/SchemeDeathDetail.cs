using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{


    public class SchemeDeathDetailExternal
    {
        public string ParentPolicyNumber { get; set; }
        public string PolicyNumber { get; set; }
        public string DeathType { get; set; }
        public string DhaReferenceNo { get; set; }
        public string DeathCertificateNo { get; set; }
        public bool InterviewWithFamilyMember { get; set; }
        public bool OpinionOfMedicalPractitioner { get; set; }
        public string HomeAffairsRegion { get; set; }
        public string PlaceOfDeath { get; set; }
        public string CauseOfDeath { get; set; }
        public string CauseOfDeathDescription { get; set; }
        public bool SendBrokerEmail { get; set; }

        public Person InsuredLife { get; set; }
        public Claimant Claimant { get; set; }
        public Informant Informant { get; set; }
        public HealthCareProviderModel HealthCareProvider { get; set; }
        public Undertaker Undertaker { get; set; }
        public ForensicPathologist ForensicPathologist { get; set; }
        public BodyCollector BodyCollector { get; set; }
        public FuneralParlor FuneralParlor { get; set; }

        public BeneficiaryBankingDetail beneficiaryBankingDetail { get; set; }

        public List<DeathClaimFileAttachment> deathClaimAttachments { get; set; }



    }
}
