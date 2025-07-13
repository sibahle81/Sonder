using System.ComponentModel;

namespace RMA.Service.ClaimCare.RuleTasks.STP.MultipleDaysBookedOffFromWork
{
    public enum DaysBookedOffFromWorkEnum
    {
        [Description("To Be Advised")]
        ToBeAdvised = 1,
        [Description("0-3 Days")]
        ZeroTo3Days = 2,
        [Description("4-42 Days")]
        FourTo42Days = 3,
        [Description("> 42 Days")]
        GreaterThan42Days = 4
    }
}
