using RMA.Common.Entities;
using RMA.Service.Admin.RulesManager.Contracts.Entities;
using System;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class RegisterFuneral : AuditDetails
    {
        public int InsuredLifeId { get; set; }
        public string IdNumber { get; set; } // IdNumber (length: 50)
        public string PassportNumber { get; set; } // PassportNumber (length: 50)
        public int CauseOfDeathId { get; set; } 
        public string FirstName { get; set; } // FirstName (length: 50)
        public string LastName { get; set; } // LastName (length: 50)
        public int PolicyId { get; set; } // PolicyId
        public DeathTypeEnum? DeathType { get; set; } // DeathTypeId
        public DateTime? DateOfDeath { get; set; } // DateOfDeath
        public bool IsStillborn { get; set; }
        public int ClaimId { get; set; }
        public int WizardId { get; set; }
        public int FuneralRegistryDetailId { get; set; }
        public string UniqueClaimReferenceNumber { get; set; }
        public string Email { get; set; }
        public FuneralRuleResult RuleResult { get; set; }
        public Claimant Claimant { get; set; }

        public RegisterFuneral()
        {
            Claimant = new Claimant();
            RuleResult = new FuneralRuleResult();
        }
    }
}