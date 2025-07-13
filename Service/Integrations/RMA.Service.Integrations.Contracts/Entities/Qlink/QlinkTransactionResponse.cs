using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Integrations.Contracts.Entities.Qlink
{
    public class QlinkTransactionResponse : ServiceBusMessageBase
    {
        public string StatusCode { get; set; }
        public string Message { get; set; }
        public string RequestGUID { get; set; }
        public QLinkTransactionTypeEnum TransactionType { get; set; }
        public string EmployeeNumber { get; set; }
        public string Surname { get; set; }
        public string Initials { get; set; }
        public string IDNumber { get; set; }
        public string ReferenceNumber { get; set; }
        public decimal Amount { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string DeductionType { get; set; }
        public string CorrectedReferenceNumber { get; set; }
        public string NewDeductionType { get; set; }
        public string OldEmployeeNumber { get; set; }
        public string ErrorCode { get; set; }
        public string AppointmentCode { get; set; }
        public string FspNumber { get; set; }
        public string ReservationNumber { get; set; }
        public string DateUpdateReceived { get; set; }
        public string Payroll { get; set; }
        public string IntermediaryID { get; set; }

    }
}
