using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.Integrations.Request
{
   public class SchemeDeathDetailsRequest
    {

        public ClaimantRequest Claimant { get; set; }

        public BeneficiaryDetails BeneficiaryDetail { get; set; }

        public DeceasedDetails DeceasedDetail { get; set; }

        public PolicyDetails PolicyDetail { get; set; }

        public ClaimantAddress claimantAddress { get; set; }

        public BeneficiaryBankAccount beneficiaryBankAccount { get; set; }

        public DeceasedAddress deceasedAddress { get; set; }

        public DoctorDetails doctorDetails { get; set; }

        public AuthorityDetails authorityDetails { get; set; }

        public FuneralParlourDetails funeralParlourDetails { get; set; }

    }
}
