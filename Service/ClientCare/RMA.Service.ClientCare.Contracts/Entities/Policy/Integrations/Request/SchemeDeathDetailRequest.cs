using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request
{
    public class SchemeDeathDetailRequest
    {
        public Claimant claimant { get; set; }

        public BeneficiaryDetails beneficiaryDetail { get; set; }

        public DeceasedDetails deceasedDetail { get; set; }

        public PolicyDetailsRequest PolicyDetail { get; set; }

        public ClaimantAddress claimantAddress { get; set; }

        public BeneficiaryBankingDetails beneficiaryBankAccount { get; set; }

        public DeceasedAddress deceasedAddress { get; set; }

        public DoctorDetails doctorDetails { get; set; }

        public AuthorityDetails authorityDetails { get; set; }

        public FuneralParlourDetails funeralParlourDetails { get; set; }

        public List<FileAttachment> attachments { get; set; }


    }
}
