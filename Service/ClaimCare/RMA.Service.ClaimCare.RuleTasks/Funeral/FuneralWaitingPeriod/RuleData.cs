using System;

namespace RMA.Service.ClaimCare.RuleTasks.Funeral.FuneralWaitingPeriod
{
    public class RuleData
    {
        public DateTime InceptionDate { get; set; }
        public DateTime ReinstateDate { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string IdNumber { get; set; }
        public int TypeOfDeathId { get; set; }
        public int BeneficiaryTypeId { get; set; }
        public bool FirstPremiumPaid { get; set; }

    }
}