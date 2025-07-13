using RMA.Service.ClientCare.Database.Entities;

using TinyCsvParser.Mapping;

namespace RMA.Service.ClientCare.Mappers
{
    public class DiscountListingMapping : CsvMapping<Load_DiscountFileListing>
    {
        #region Constructors and Destructors

        public DiscountListingMapping()
        {
            this.MapProperty(0, data => data.HealthCarePractitioner);
            this.MapProperty(1, data => data.TakPrc);
            this.MapProperty(2, data => data.AccPer);
            this.MapProperty(3, data => data.AccountNumber);
            this.MapProperty(4, data => data.PatientInitials);
            this.MapProperty(5, data => data.PatientName);
            this.MapProperty(6, data => data.MedicalAidCode);
            this.MapProperty(7, data => data.MedicalAidName);
            this.MapProperty(8, data => data.MedicalAidNumber);
            this.MapProperty(9, data => data.LosAuthCode);
            this.MapProperty(10, data => data.MedicalAidPlan);
            this.MapProperty(11, data => data.TrackingNumber);
            this.MapProperty(12, data => data.SwitchRef);
            this.MapProperty(13, data => data.BatchNumber);
            this.MapProperty(14, data => data.AdmDate);
            this.MapProperty(15, data => data.DisDate);
            this.MapProperty(16, data => data.RenDate);
            this.MapProperty(17, data => data.LastRenDate);
            this.MapProperty(18, data => data.DateDelivered);
            this.MapProperty(19, data => data.DateReceived);
            this.MapProperty(20, data => data.DateSent);
            this.MapProperty(21, data => data.AccountTotal);
            this.MapProperty(22, data => data.OutstandingBalance);
            this.MapProperty(23, data => data.PharmacyTotal);
            this.MapProperty(24, data => data.ReceiptTotal);
            this.MapProperty(25, data => data.ReceiptDate);
            this.MapProperty(26, data => data.ReceiptNumber);
            this.MapProperty(27, data => data.BatchNo);
            this.MapProperty(28, data => data.BatchType);
            this.MapProperty(29, data => data.PrivateAmount);
            this.MapProperty(30, data => data.BenefitAmount);
            this.MapProperty(31, data => data.FinalBenefitAmount);
            this.MapProperty(32, data => data.PatType);
            this.MapProperty(33, data => data.ArrServProvider);
            this.MapProperty(34, data => data.DeliveredReceipt);
            this.MapProperty(35, data => data.RenderedToReceipt);
            this.MapProperty(36, data => data.LastRenderedToReceipt);
            this.MapProperty(37, data => data.DateSend);
            this.MapProperty(38, data => data.DaysCalculated);
            this.MapProperty(39, data => data.DiscountPercentage);
            this.MapProperty(40, data => data.Discount);
            this.MapProperty(41, data => data.HcpInvoiceNumber);
            this.MapProperty(42, data => data.HcpAccountNumber);
            this.MapProperty(43, data => data.RmaInvoiceNumber);
        }

        #endregion
    }
}
