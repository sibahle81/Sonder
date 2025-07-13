using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.ComponentModel;

namespace RMA.Service.Integrations.Contracts.Entities.Qlink
{
    public class QlinkTransactionRequest
    {
        [Description("Type of Request")]
        public string ItemType { get; set; }
        [Description("Identity column of the table")]
        public int ItemId { get; set; }
        [Description("One of the 13 available transaction types. use enum string values  i.e  QADD .")]
        public QLinkTransactionTypeEnum TransactionType { get; set; }
        [Description("The employee number on the PERSAL system.")]
        public string EmployeeNumber { get; set; }
        [Description("The employee’s last name.")]
        public string Surname { get; set; }
        [Description("The employee’s initials.")]
        public string Initials { get; set; }
        [Description("The employee’s South African ID number")]
        public string IDNumber { get; set; }
        [Description("The employee’s RMA policy reference number (assigned by RMA).")]
        public string ReferenceNumber { get; set; }
        [Description("The deduction amount in Rands and Cents (decimal, converted to integer internally) i.e 250.45")]
        public decimal Amount { get; set; }
        [Description("The year and month the salary deduction must start or end, or changes must apply (format yyyyMM).")]
        public string SalaryMonth { get; set; }
        [Description("The start date of the deduction, if applicable (always in the future and 1st of the month, format yyyyMMdd).")]
        public string StartDate { get; set; }
        [Description("The end date of the deduction, if applicable (always in the future and last day of the month, format yyyyMMdd).")]
        public string EndDate { get; set; }
        [Description("The type of cover the deduction is for. i.e refer  to QlinkDeductionCode for  string values i.e 0010 ")]
        public string DeductionType { get; set; }
        [Description("The reservation number (if applicable).")]
        public string ReservationNumber { get; set; }
        [Description("The employee’s new reference number (if applicable – QFIX only).")]
        public string CorrectedReferenceNumber { get; set; }
        [Description("The new deduction type for the deduction (if applicable – QFIX only).")]
        public string NewDeductionType { get; set; }
        [Description("The old employee number (if applicable – QFIX only).")]
        public string OldEmployeeNumber { get; set; }
        [Description("The Broker FSP Number")]
        public string FspNumber { get; set; }
        [Description("QlinkTransactionId")]
        public int QlinkTransactionId { get; set; }
        [Description("Payroll Number")]
        public int PayrollId { get; set; }
        [Description("Rep Id number or Passport number")]
        public string IntermediaryID { get; set; }
    }
}
