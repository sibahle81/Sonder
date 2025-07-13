using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Billing.Utils
{
    public static class BankFacsUtils
    {
        public static int ConvertToHyphenBankAccount(BankAccountTypeEnum? bankAccountType)
        {

            switch (bankAccountType)
            {
                case BankAccountTypeEnum.CurrentAccount:
                case BankAccountTypeEnum.ChequeAccount:
                    return (int)Admin.MasterDataManager.Contracts.Enums.HyphenBankAccountTypeEnum.Cheque;
                case BankAccountTypeEnum.SavingsAccount:
                    return (int)Admin.MasterDataManager.Contracts.Enums.HyphenBankAccountTypeEnum.Savings;
                case BankAccountTypeEnum.TransmissionAccount:
                    return (int)Admin.MasterDataManager.Contracts.Enums.HyphenBankAccountTypeEnum.Transmission;
                case BankAccountTypeEnum.BondAccount:
                    return (int)Admin.MasterDataManager.Contracts.Enums.HyphenBankAccountTypeEnum.Bond;
                default:
                    return 0;
            }
        }

        public static readonly IEnumerable<string> BankingDetailsRejectionCodes = new List<string>(new[]
        {
            "1055", "1056", "1057", "1058", "1059", "1078", "1054", "1042", "1047", "1014",
            "1009", "2061", "2062", "2080", "2201", "2202", "2203", "8888", "0080", "WS27",
            "WS26", "WS25", "WS24", "WS23", "WS22", "WS21", "WS20", "WS19", "WS18", "WS17"
        });

        public static readonly IEnumerable<string> PayeeDetailsRejectionCodes = new List<string>(new[]
        {
            "WS13", "WS14"
        });

        public static readonly IEnumerable<string> PayoutAmountRejectionCodes = new List<string>(new[]
        {
            "WS10", "WS11", "WS12", "0080"
        });

        public static readonly IEnumerable<string> SenderAccountConfigRejectionCodes = new List<string>(new[]
        {
            "0016", "0020", "0024", "WS03", "WS04"
        });

        public static readonly IEnumerable<string> HyphenServiceRejectionCodes = new List<string>(new[]
        {
            "7777"
        });
    }
}
