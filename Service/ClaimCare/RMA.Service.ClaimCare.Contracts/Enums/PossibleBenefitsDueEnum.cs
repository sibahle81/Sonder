using System.ComponentModel;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum PossibleBenefitsDueEnum
    {
        [Description("Treat & Return")]
        TreatandReturn = 0,

        [Description("Minor Injury")]
        MinorInjury = 1,

        [Description("Notification Only")]
        NotificationOnly = 2
    }

    public enum PossibleBenefitsDueEnumNew
    {
        [Description("Treat & Return")]
        TreatandReturn = 0,

        [Description("Minor Injury")]
        MinorInjury = 1,

        [Description("Notification Only")]
        NotificationOnly = 2,

        [Description("Days <= 14")]
        DaysLessThanOrEqualTo14 = 3,

        [Description("Medical")]
        Medical = 4
    }
}
