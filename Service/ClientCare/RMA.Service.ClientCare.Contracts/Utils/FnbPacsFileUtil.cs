using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;

namespace RMA.Service.ClientCare.Contracts.Utils
{
    public static class FnbPacsFileUtil
    {
        public static void WriteFileContent(IEnumerable<PaymentInstruction> data, StringBuilder transactionStringBuilder)
        {
            if (data != null)
            {
                foreach (var paymentInstruction in data)
                {
                    ValidatePaymentInstruction(paymentInstruction);
                    transactionStringBuilder?.Append("10");
                    transactionStringBuilder.Append(paymentInstruction.FromBankBranchCode.PadLeft(6, '0'));
                    transactionStringBuilder.Append(paymentInstruction.FromBankAccountNumber.PadLeft(11, '0'));
                    transactionStringBuilder.Append("0000");
                    transactionStringBuilder.Append(paymentInstruction.SequenceNumber.PadLeft(6, '0'));
                    transactionStringBuilder.Append(paymentInstruction.ToBankBranchCode.PadLeft(6, '0'));
                    transactionStringBuilder.Append(paymentInstruction.ToBankAccountNumber.PadLeft(11, '0'));
                    transactionStringBuilder.Append(paymentInstruction.AccountType);
                    transactionStringBuilder.Append(ConvertAmountToCents(paymentInstruction.Amount));
                    transactionStringBuilder.Append("00000000");
                    transactionStringBuilder.Append('0');
                    transactionStringBuilder.Append("00");
                    transactionStringBuilder.Append('0');
                    transactionStringBuilder.Append(paymentInstruction.TransactionReference.PadRight(20, ' '));
                    transactionStringBuilder.Append("0000000000");
                    transactionStringBuilder.Append(paymentInstruction.BrokerAccountName.PadRight(15, ' '));
                    transactionStringBuilder.Append("000000000000000");
                    transactionStringBuilder.Append("00000000000000000000");
                    transactionStringBuilder.Append("000000000000000000000000000000");
                    transactionStringBuilder.Append(Environment.NewLine);
                }
            }
        }

        private static void ValidatePaymentInstruction(PaymentInstruction paymentInstruction)
        {
            if (string.IsNullOrWhiteSpace(paymentInstruction.FromBankBranchCode) || paymentInstruction.FromBankBranchCode.Length != 6)
                throw new InvalidEnumArgumentException("The from bank branch code is required and must be 6 characters in length..");
            if (string.IsNullOrWhiteSpace(paymentInstruction.FromBankAccountNumber) || paymentInstruction.FromBankAccountNumber.Length != 11)
                throw new InvalidEnumArgumentException("The from bank account number is required and must be 11 characters in length.");
            if (string.IsNullOrWhiteSpace(paymentInstruction.SequenceNumber) || paymentInstruction.SequenceNumber.Length != 6)
                throw new InvalidEnumArgumentException("The sequence number is required and must be 6 characters in length.");
            if (string.IsNullOrWhiteSpace(paymentInstruction.ToBankBranchCode))
                throw new InvalidEnumArgumentException("The to bank branch code is required and must be 6 characters in length.");
            if (string.IsNullOrWhiteSpace(paymentInstruction.ToBankAccountNumber))
                throw new InvalidEnumArgumentException("The to bank account number is required.");
            if (paymentInstruction.Amount == 0)
                throw new InvalidEnumArgumentException("The amount is required.");
            if (!string.IsNullOrWhiteSpace(paymentInstruction.TransactionReference) && paymentInstruction.TransactionReference.Length > 20)
                paymentInstruction.TransactionReference = paymentInstruction.TransactionReference.Substring(0, 20);
            if (paymentInstruction.BrokerAccountName.Length > 15)
                paymentInstruction.BrokerAccountName = paymentInstruction.BrokerAccountName.Substring(0, 15);
            if (paymentInstruction.NonStandardAccountNumber.Length > 20)
                throw new InvalidEnumArgumentException("The non standard account number may not be longer than 20 characters.");
            if (string.IsNullOrWhiteSpace(paymentInstruction.NonStandardAccountNumber))
                paymentInstruction.NonStandardAccountNumber = paymentInstruction.NonStandardAccountNumber.PadRight(20, '0');
        }

        private static string ConvertAmountToCents(decimal amount)
        {
            var cents = (int)(amount * 100);
            return cents.ToString().PadLeft(11, '0');
        }

        public static void WriteFooters(StringBuilder footerStringbuilder, string fromBankBranchCode, string fromBankAccountNumber, string actionDate)
        {
            ValidateFooterParamters(ref fromBankBranchCode, ref fromBankAccountNumber, ref actionDate);
            if (footerStringbuilder?.Length > 0)
            {
                footerStringbuilder.AppendLine($"{($"12{fromBankBranchCode}{fromBankAccountNumber}").PadRight(58, '0')}{actionDate}".PadRight(180, '0'));
                footerStringbuilder.AppendLine("92".PadRight(180, '0'));
                footerStringbuilder.AppendLine("94".PadRight(180, '0'));
            }
        }

        private static void ValidateFooterParamters(ref string fromBankBranchCode, ref string fromBankAccountNumber, ref string actionDate)
        {
            if (!string.IsNullOrWhiteSpace(fromBankBranchCode) && fromBankBranchCode.Length != 6)
                throw new InvalidEnumArgumentException("The from bank branch code must be 6 characters long");
            if (string.IsNullOrWhiteSpace(fromBankBranchCode))
                fromBankBranchCode = "000000";
            if (!string.IsNullOrWhiteSpace(fromBankAccountNumber) && fromBankAccountNumber.Length != 11)
                throw new InvalidEnumArgumentException("The from bank account number must be 11 characters long");
            if (string.IsNullOrWhiteSpace(fromBankAccountNumber))
                fromBankAccountNumber = "00000000000";
            if (!string.IsNullOrWhiteSpace(actionDate) && actionDate.Length != 6)
                throw new InvalidEnumArgumentException("The action datemust be 6 characters long and in the format - YYMMD");
            if (string.IsNullOrWhiteSpace(actionDate))
                actionDate = "000000";
        }

        public static void WriteHeaderRecords(StringBuilder headerStringBuilder)
        {
            if (headerStringBuilder != null)
            {
                headerStringBuilder.AppendLine("02".PadRight(180, '0'));
                headerStringBuilder.AppendLine("04".PadRight(180, '0'));
            }
        }
    }
}
