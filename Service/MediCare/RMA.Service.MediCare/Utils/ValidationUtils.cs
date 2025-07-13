using RMA.Service.MediCare.Constants;
using RMA.Service.MediCare.RuleTasks.Enums;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Text.RegularExpressions;

namespace RMA.Service.MediCare.Utils
{
    public static class ValidationUtils
    {
        public static bool IsValidEmailAddress(string emailAddress)
        {
            if (string.IsNullOrEmpty(emailAddress?.Trim())) return false;

            var regEx = new Regex(MediCareConstants.RegexCheckValidEmailAddress);

            return regEx.IsMatch(emailAddress);
        }

        public static Dictionary<string, string> ValidateICD10CodeFormat(string ICD10Code)
        {
            Dictionary<string, string> resourceKeys = new Dictionary<string, string>();

            if (string.IsNullOrEmpty(ICD10Code?.Trim()))
            {
                BatchProcessorUtils.AddResourceKeyToDictionary(resourceKeys, ((int)UnderAssessReasonEnum.icd10CodeNotSuppliedOnInvoiceICD10CodeIsMandatory).ToString(), BatchProcessorUtils.GetEnumDisplayName(UnderAssessReasonEnum.icd10CodeNotSuppliedOnInvoiceICD10CodeIsMandatory));
            }
            else
            {
                if (ICD10Code.Trim().Length > 50)
                {
                    BatchProcessorUtils.AddResourceKeyToDictionary(resourceKeys, ((int)UnderAssessReasonEnum.icd10CodesExceedsTheAllowableLength).ToString(), BatchProcessorUtils.GetEnumDisplayName(UnderAssessReasonEnum.icd10CodesExceedsTheAllowableLength));
                }
                else
                {
                    string[] lstICD10Code = BatchProcessorUtils.SplitICD10Codes(ICD10Code);
                    foreach (string icd10 in lstICD10Code)
                    {
                        bool isValidICD10Format = false;
                        isValidICD10Format = CheckICD10CodeFormat(icd10.Trim());

                        if (!isValidICD10Format)
                        {
                            BatchProcessorUtils.AddResourceKeyToDictionary(resourceKeys, ((int)UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat).ToString(), BatchProcessorUtils.GetEnumDisplayName(UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat));
                        }
                    }
                }
            }

            return resourceKeys;
        }

        public static bool CheckICD10CodeFormat(string ICD10Code)
        {
            //ICD10 format(eg: S24.01, format: [a-zA-Z][0-9]{2}([.][0-9]{1,2})?
            Regex regex = new Regex(MediCareConstants.RegexCheckICD10CodeFormat);
            Match match = regex.Match(ICD10Code);
            if (match.Success && match.Value == ICD10Code)
                return true;
            else
                return false;
        }

        public static bool IsCellNumberValid(string cellNumber)
        {
            var isValid = false;
            var mobileCodes = new[] { "07", "06", "08" };
            var telCodes = new[] { "01", "02", "03", "04", "05", "09" };

            if (string.IsNullOrEmpty(cellNumber)) return false;

            foreach (var telCode in telCodes)
            {
                if (cellNumber.StartsWith(telCode))
                {
                    return false;
                }
            }

            if (cellNumber.StartsWith("27"))
            {
                var code = cellNumber?.Substring(0, 2);
                var number = cellNumber?.Substring(code.Length, 9);
                cellNumber = $"0{number}";
            }

            if (cellNumber.Length != 10) return false;

            foreach (var mc in mobileCodes)
            {
                isValid = !string.IsNullOrEmpty(cellNumber) && cellNumber.StartsWith(mc);
                if (isValid) break;
            }
            return isValid;
        }

        public static bool IsPhoneNumberValid(string telNumber)
        {
            if (string.IsNullOrEmpty(telNumber)) return false;

            if (telNumber.Length > 10)
                return telNumber.StartsWith("00") && IsInternationalPhoneNumber(telNumber);

            if (telNumber.Length != 10) return false;

            return !string.IsNullOrEmpty(telNumber) && Regex.Match(telNumber, MediCareConstants.RegexCheckValidPhoneNumber).Success;
        }

        public static bool IsInternationalPhoneNumber(string phoneNumber)
        {
            return !string.IsNullOrEmpty(phoneNumber) && phoneNumber.StartsWith("00");
        }

        public static List<UnderAssessReasonEnum> CheckICD10CodeFormatUnderAssessReasonsResult(Dictionary<string, string> underAssessReasonsResult)
        {
            Contract.Requires(underAssessReasonsResult != null);
            var underAssessReasonEnumList = new List<UnderAssessReasonEnum>();
            foreach (var item in underAssessReasonsResult)
            {

                switch ((UnderAssessReasonEnum)Convert.ToInt32(item.Key))
                {
                    case UnderAssessReasonEnum.icd10CodeNotSuppliedOnInvoiceICD10CodeIsMandatory:
                        underAssessReasonEnumList.Add(UnderAssessReasonEnum.icd10CodeNotSuppliedOnInvoiceICD10CodeIsMandatory);
                        break;
                    case UnderAssessReasonEnum.icd10CodesExceedsTheAllowableLength:
                        underAssessReasonEnumList.Add(UnderAssessReasonEnum.icd10CodesExceedsTheAllowableLength);
                        break;
                    case UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat:
                        underAssessReasonEnumList.Add(UnderAssessReasonEnum.icd10CodeSuppliedHasInvalidFormat);
                        break;
                }
            }

            return underAssessReasonEnumList;
        }
    }
}
