using LINQtoCSV;

using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Utils;

using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Services.Medical
{
    public class HealthBridgeProcessorFacade : RemotingStatelessService, IHealthBridgeProcessorService
    {
        private readonly ISwitchBatchProcessorService _switchBatchProcessorService;

        public HealthBridgeProcessorFacade(StatelessServiceContext context,
            ISwitchBatchProcessorService switchBatchProcessorService)
            : base(context)
        {
            _switchBatchProcessorService = switchBatchProcessorService;
        }

        public async Task<int> ProcessFile(Switch switchDetail, string fileName, string content)
        {
            Contract.Requires(switchDetail != null);
            var inputFileDescription = new CsvFileDescription
            {
                SeparatorChar = ',',
                FirstLineHasColumnNames = false,
                EnforceCsvColumnAttribute = true,
                IgnoreUnknownColumns = true
            };

            var cc = new CsvContext();
            var products = new List<HealthBridgeDetailRow>();

            byte[] byteArray = Encoding.ASCII.GetBytes(content);
            var stream = new MemoryStream(byteArray);
            using (var streamReader = new StreamReader(stream))
            {
                products = cc.Read<HealthBridgeDetailRow>(streamReader, inputFileDescription).ToList();
            }

            var invoices = new List<SwitchBatchInvoice>();
            var invoiceBreakDowns = new List<SwitchBatchInvoiceLine>();
            var header = products.First(r => r.RowType == "1").ToHeaderRow();
            var footer = products.First(r => r.RowType == "Z").ToFooterRow();

            string batchNumber = header.BatchNumber;
            DateTime batchDate = header.BatchDate == null ? DateTime.MinValue : DateTime.ParseExact(header.BatchDate, "yyyyMMdd", null, DateTimeStyles.AssumeLocal);
            if (batchDate == DateTime.MinValue)
                batchDate = DateTime.Now;

            var batchResult = await _switchBatchProcessorService.CheckIfBatchExists(batchNumber, switchDetail.SwitchId);

            if (batchResult)
                return 0;

            var grouped = products.Where(r => r.RowType == "M").GroupBy(g => new { g.sPracticeNumber, g.sPatientNumber, g.sInvoiceNumber }).Select(rows => rows.Key);
            int invoiceId = 1;
            foreach (var item in grouped)
            {
                var invoiceItem = products.First(r => r.sPracticeNumber == item.sPracticeNumber && r.sPatientNumber == item.sPatientNumber && r.sInvoiceNumber == item.sInvoiceNumber);
                var lines = products.Where(r => r.sPracticeNumber == item.sPracticeNumber && r.sPatientNumber == item.sPatientNumber && r.sInvoiceNumber == item.sInvoiceNumber).ToList();
                var dischargedDate = BatchProcessorUtils.ConvertToDate(lines.Max(li => li.dtDateOfService), false); //dtDischarge
                var admittedDate = BatchProcessorUtils.ConvertToDate(lines.Min(li => li.dtDateOfService), false); //dtAdmission

                var invoice = new SwitchBatchInvoice();
                invoice.BatchSequenceNumber = invoiceId;
                invoice.SwitchBatchNumber = batchNumber;
                invoice.SwitchTransactionNumber = invoiceItem.sSPTransactionNumber;
                invoice.PracticeNumber = invoiceItem.sPracticeNumber;
                invoice.HealthCareProviderName = invoiceItem.sPracticeName;
                invoice.InvoiceDate = dischargedDate;
                invoice.DateSubmitted = batchDate;
                invoice.DateReceived = DateTime.Now;
                invoice.SpInvoiceNumber = invoiceItem.sInvoiceNumber;
                invoice.SpAccountNumber = invoiceItem.sPatientNumber;
                invoice.TotalInvoiceAmountInclusive = lines.Sum(i => BatchProcessorUtils.DefaultIfNullDecimal(i.crCost, 0));
                invoice.DateAdmitted = admittedDate; //Use line item service dates
                invoice.DateDischarged = dischargedDate; //Use line item service dates
                invoice.TotalInvoiceAmount = await _switchBatchProcessorService.DeriveAmountExcludingVATFromAmountInclusiveOfVAT(Convert.ToDecimal(invoice.TotalInvoiceAmountInclusive), admittedDate.Value);
                invoice.TotalInvoiceVat = invoice.TotalInvoiceAmountInclusive - invoice.TotalInvoiceAmount;
                invoice.ClaimReferenceNumber = invoiceItem.sClaimNumber;
                if (invoiceItem.dtDateOfInjury != null)
                    invoice.EventDate = BatchProcessorUtils.ConvertToDate(invoiceItem.dtDateOfInjury, true);
                invoice.Surname = invoiceItem.sPatientSurname;
                invoice.FirstName = invoiceItem.sPatientName;
                invoice.Initials = invoiceItem.sPatientInitials;
                invoice.IdNumber = invoiceItem.dtDateOfBirth;
                invoice.EmployerName = invoiceItem.sEmployeeNo;
                invoice.PreAuthNumber = invoiceItem.sPreAuthNumber;
                invoice.TreatingDocBhf = invoiceItem.sAttendingPracticeNo;
                invoice.EmployerName = invoiceItem.sEmployer;
                invoice.ReferringDocBhf = invoiceItem.sReferringPractice;
                invoice.ReferredTo = invoiceItem.sReferringPractice;
                invoice.HospitalIndicator = invoiceItem.sHospitalIndicator;
                invoice.AssistantBhfNumber = invoiceItem.sAttendingDoctorHSPA;
                invoice.FreeTextDiagnosis = invoiceItem.sText;
                invoice.IodReference = invoiceItem.sIODReference;
                invoice.PatientGender = invoiceItem.sPatientGender;
                invoice.DiagnosticCodeType = invoiceItem.sICPC;
                invoice.DisciplineCode = invoiceItem.sBHFPracDesc;
                invoice.IsProcessed = false;
                invoice.SwitchBatchType = SwitchBatchTypeEnum.MedEDI;
                invoice.IsActive = true;

                var lineItems = await GetLineItems(invoiceId, lines);
                invoiceBreakDowns.AddRange(lineItems);
                invoice.SwitchBatchInvoiceLines = invoiceBreakDowns.Where(i => i.BatchSequenceNumber == invoiceId).ToList();


                invoices.Add(invoice);
                invoiceId++;
            }

            var switchBatch = new SwitchBatch
            {
                Description = switchDetail.Name + ": " + batchNumber + " Date " + batchDate,
                SwitchBatchNumber = batchNumber,
                DateSubmitted = batchDate,
                DateSwitched = batchDate,
                DateReceived = DateTime.Now,
                InvoicesStated = invoices.Count,
                InvoicesCounted = invoices.Count,
                LinesStated = Convert.ToInt32(footer.TotalNumberOfTransactions.Replace(" ", "")),
                LinesCounted = invoiceBreakDowns.Count,
                AmountStatedInclusive = BatchProcessorUtils.DefaultIfNullDecimal(footer.TotalAmountOfTransactions, 0),
                AmountCountedInclusive = invoices.Sum(i => Convert.ToDecimal(i.TotalInvoiceAmountInclusive)),
                SwitchFileName = fileName,
                DateCaptured = DateTime.Now,
                ModifiedBy = "Scheduler",
                SwitchId = switchDetail.SwitchId,
                AssignedToRoleId = switchDetail.AssignToRole,
                SwitchBatchType = SwitchBatchTypeEnum.MedEDI,
                IsActive = true
            };

            switchBatch.SwitchBatchInvoices = invoices;

            return await _switchBatchProcessorService.WriteInvoicesToDatabase(switchBatch);
        }

        private async Task<List<SwitchBatchInvoiceLine>> GetLineItems(int invoiceId, IEnumerable<HealthBridgeDetailRow> lineItems)
        {
            var items = new List<SwitchBatchInvoiceLine>();
            foreach (var sr in lineItems)
            {
                var li = new SwitchBatchInvoiceLine();
                li.BatchSequenceNumber = invoiceId;
                li.Quantity = BatchProcessorUtils.DefaultIfNullDouble(sr.dQuantity, 1).ToString();
                li.TotalInvoiceLineCostInclusive = BatchProcessorUtils.DefaultIfNullDecimal(sr.crCost, 0);
                li.ServiceDate = BatchProcessorUtils.ConvertToDate(sr.dtDateOfService, false);
                li.TotalInvoiceLineCost = await _switchBatchProcessorService.DeriveAmountExcludingVATFromAmountInclusiveOfVAT(Convert.ToDecimal(li.TotalInvoiceLineCostInclusive), li.ServiceDate.Value);
                li.TotalInvoiceLineVat = li.TotalInvoiceLineCostInclusive - li.TotalInvoiceLineCost;
                li.CreditAmount = BatchProcessorUtils.DefaultIfNullDecimal(sr.crDiscount, 0);
                li.VatCode = BatchProcessorUtils.GetVatCode(Convert.ToDecimal(li.TotalInvoiceLineVat));
                li.IsActive = true;

                if (!string.IsNullOrEmpty(sr.sNAPPICode))
                {
                    li.TariffCode = sr.sNAPPICode;
                    li.OtherCode = sr.sTariffCode;
                }
                else
                {
                    li.TariffCode = sr.sTariffCode;
                    li.OtherCode = string.Empty;
                }

                li.Description = sr.sItemDescription;
                li.Icd10Code = sr.sICD10Code;

                li.SwitchTransactionNumber = sr.sSPTransactionNumber;
                li.FileSequenceNumber = sr.nSequence;
                li.Modifier1 = sr.sMod1;
                li.Modifier2 = sr.sMod2;
                li.Modifier3 = sr.sMod3;
                li.Modifier4 = sr.sMod4;
                li.DosageDuration = sr.sDosageDuration;
                li.ServiceProviderTransactionNumber = sr.sSPTransactionNumber;

                if (sr.dtDateOfService != null
                    && DateTime.TryParseExact(sr.dtDateOfService, "MM/dd/yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var serviceStartDate)
                    && DateTime.TryParseExact(sr.dtDateOfService, "MM/dd/yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var serviceEndDate)
                    )
                {
                    li.ServiceTimeStart = serviceStartDate.TimeOfDay;
                    li.ServiceTimeEnd = serviceEndDate.TimeOfDay;
                }

                items.Add(li);
            }
            return items;
        }

        private class HealthBridgeDetailRow
        {
            [CsvColumn(FieldIndex = 1)]
            public string RowType { get; set; }
            [CsvColumn(FieldIndex = 2)]
            public string nSequence { get; set; }
            [CsvColumn(FieldIndex = 3)]
            public string sDate { get; set; }
            [CsvColumn(FieldIndex = 4)]
            public string sX1 { get; set; }
            [CsvColumn(FieldIndex = 5)]
            public string sClaimNumber { get; set; }
            [CsvColumn(FieldIndex = 6)]
            public string sPatientSurname { get; set; }
            [CsvColumn(FieldIndex = 7)]
            public string sPatientInitials { get; set; }
            [CsvColumn(FieldIndex = 8)]
            public string sPatientName { get; set; }
            [CsvColumn(FieldIndex = 9)]
            public string sPracticeNumber { get; set; }
            [CsvColumn(FieldIndex = 10)]
            public string sX2 { get; set; }
            [CsvColumn(FieldIndex = 11)]
            public string sPatientNumber { get; set; }
            [CsvColumn(FieldIndex = 12)]
            public string sMedicalItemType { get; set; }
            [CsvColumn(FieldIndex = 13)]
            public string dtDateOfService { get; set; }
            [CsvColumn(FieldIndex = 14)]
            public string dQuantity { get; set; }
            [CsvColumn(FieldIndex = 15)]
            public string crCost { get; set; }
            [CsvColumn(FieldIndex = 16)]
            public string crDiscount { get; set; }
            [CsvColumn(FieldIndex = 17)]
            public string sItemDescription { get; set; }
            [CsvColumn(FieldIndex = 18)]
            public string sTariffCode { get; set; }
            [CsvColumn(FieldIndex = 19)]
            public string sDuty { get; set; }
            [CsvColumn(FieldIndex = 20)]
            public string sMod1 { get; set; }
            [CsvColumn(FieldIndex = 21)]
            public string sMod2 { get; set; }
            [CsvColumn(FieldIndex = 22)]
            public string sMod3 { get; set; }
            [CsvColumn(FieldIndex = 23)]
            public string sMod4 { get; set; }
            [CsvColumn(FieldIndex = 24)]
            public string sInvoiceNumber { get; set; }
            [CsvColumn(FieldIndex = 25)]
            public string sPracticeName { get; set; }
            [CsvColumn(FieldIndex = 26)]
            public string sReferringPractice { get; set; }
            [CsvColumn(FieldIndex = 27)]
            public string sNAPPICode { get; set; }
            [CsvColumn(FieldIndex = 28)]
            public string sX3 { get; set; }
            [CsvColumn(FieldIndex = 29)]
            public string dtDateOfBirth { get; set; }
            [CsvColumn(FieldIndex = 30)]
            public string sSPTransactionNumber { get; set; }
            [CsvColumn(FieldIndex = 31)]
            public string sHospitalIndicator { get; set; }
            [CsvColumn(FieldIndex = 32)]
            public string sPreAuthNumber { get; set; }
            [CsvColumn(FieldIndex = 33)]
            public string sX4 { get; set; }
            [CsvColumn(FieldIndex = 34)]
            public string sICD10Code { get; set; }
            [CsvColumn(FieldIndex = 35)]
            public string sAttendingPracticeNo { get; set; }
            [CsvColumn(FieldIndex = 36)]
            public string sDosageDuration { get; set; }
            [CsvColumn(FieldIndex = 37)]
            public string sToothNo { get; set; }
            [CsvColumn(FieldIndex = 38)]
            public string sPatientGender { get; set; }
            [CsvColumn(FieldIndex = 39)]
            public string sAttendingDoctorHSPA { get; set; }
            [CsvColumn(FieldIndex = 40)]
            public string sICPC { get; set; }
            [CsvColumn(FieldIndex = 41)]
            public string sTariffType { get; set; }
            [CsvColumn(FieldIndex = 42)]
            public string sCPTCode { get; set; }
            [CsvColumn(FieldIndex = 43)]
            public string sText { get; set; }
            [CsvColumn(FieldIndex = 44)]
            public string sPlaceOfService { get; set; }
            [CsvColumn(FieldIndex = 45)]
            public string sSPBatchNo { get; set; }
            [CsvColumn(FieldIndex = 46)]
            public string sHBFundNo { get; set; }
            [CsvColumn(FieldIndex = 47)]
            public string sReferringHSPCA { get; set; }
            [CsvColumn(FieldIndex = 48)]
            public string sTrackingNo { get; set; }
            [CsvColumn(FieldIndex = 49)]
            public string sOptomReadingAdds { get; set; }
            [CsvColumn(FieldIndex = 50)]
            public string sOptomLens { get; set; }
            [CsvColumn(FieldIndex = 51)]
            public string sBHFPracDesc { get; set; }
            [CsvColumn(FieldIndex = 52)]
            public string sEmployer { get; set; }
            [CsvColumn(FieldIndex = 53)]
            public string sEmployeeNo { get; set; }
            [CsvColumn(FieldIndex = 54)]
            public string dtDateOfInjury { get; set; }
            [CsvColumn(FieldIndex = 55)]
            public string sIODReference { get; set; }

            public HealthBridgeHeaderRow ToHeaderRow()
            {
                var row = new HealthBridgeHeaderRow();
                row.RowType = RowType;
                row.SwitchInternalReference = nSequence;
                row.TransactionType = sDate;
                row.SwitchAdministratorNumber = sX1;
                row.BatchNumber = sClaimNumber;
                row.BatchDate = sPatientSurname;
                row.SchemaName = sPatientInitials;
                row.SwitchInternal = sPatientName;
                return row;
            }

            public HealthBridgeFotterRow ToFooterRow()
            {
                var row = new HealthBridgeFotterRow();
                row.RowType = RowType;
                row.TotalNumberOfTransactions = nSequence;
                row.TotalAmountOfTransactions = sDate;
                return row;
            }
        }

        private class HealthBridgeHeaderRow
        {
            public string RowType { get; set; }
            public string SwitchInternalReference { get; set; }
            public string TransactionType { get; set; }
            public string SwitchAdministratorNumber { get; set; }
            public string BatchNumber { get; set; }
            public string BatchDate { get; set; }
            public string SchemaName { get; set; }
            public string SwitchInternal { get; set; }
        }

        private class HealthBridgeFotterRow
        {
            public string RowType { get; set; }
            public string TotalNumberOfTransactions { get; set; }
            public string TotalAmountOfTransactions { get; set; }
        }
    }
}
