using RMA.Common.Exceptions;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class CommissionPeriod
    {
        public string Period { get; set; }

        public string DisplayPeriod => ConvertPeriodToMonthYear(Period);

        public string ConvertPeriodToMonthYear(string period)
        {
            if (string.IsNullOrEmpty(period))
                throw new BusinessException("The period is required to get the month - year value!");

            if (!string.IsNullOrEmpty(period) && period.Length != 6)
                throw new BusinessException("The period must be in the following format MMyyyy!");

            _ = int.TryParse(period.Substring(0, 2), out var monthNumber);

            if (monthNumber < 0 && monthNumber > 12)
                throw new BusinessException("The month part of the period is not a valid month!");

            return $"{GetMonth(monthNumber)} {period.Substring(2)}";
        }

        private string GetMonth(int monthNumber)
        {
            switch (monthNumber)
            {
                case 1:
                    return "January";
                case 2:
                    return "February";
                case 3:
                    return "March";
                case 4:
                    return "April";
                case 5:
                    return "May";
                case 6:
                    return "June";
                case 7:
                    return "July";
                case 8:
                    return "August";
                case 9:
                    return "September";
                case 10:
                    return "October";
                case 11:
                    return "November";
                case 12:
                    return "December";
                default:
                    return "January";
            }
        }
    }
}
