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
    public class CommonProcessorFacade : RemotingStatelessService, ICommonProcessorService
    {
        private readonly ISwitchBatchProcessorService _switchBatchProcessorService;

        public CommonProcessorFacade(StatelessServiceContext context,
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
            var products = new List<CommonDetailRow>();

            byte[] byteArray = Encoding.ASCII.GetBytes(content);
            var stream = new MemoryStream(byteArray);
            using (var streamReader = new StreamReader(stream))
            {
                products = cc.Read<CommonDetailRow>(streamReader, inputFileDescription).ToList();
            }

            var invoices = new List<SwitchBatchInvoice>();
            var invoiceBreakDowns = new List<SwitchBatchInvoiceLine>();
            var headerRow = products.FirstOrDefault(r => r.RowType == "1");
            var footerRow = products.FirstOrDefault(r => r.RowType == "Z");

            if (headerRow == null)
            {
                string message = string.Format("Batch {0} does not have a header", fileName);
                return 0;
            }

            if (footerRow == null)
            {
                string message = string.Format("Batch {0} does not have a footer", fileName);
                return 0;
            }

            var header = headerRow.ToHeaderRow();
            var footer = footerRow.ToFooterRow();

            if (header.BatchDate == null || header.BatchNumber == null)
            {
                string message = string.Format("Batch {0} does not have a valid header", fileName);
                return 0;
            }

            if (footer.TotalAmountOfTransactions == null || footer.TotalNumberOfTransactions == null)
            {
                string message = string.Format("Batch {0} does not have a correct totals in the footer", fileName);
                return 0;
            }

            string switchBatchNumber = header.BatchNumber;

            var batchDate = BatchProcessorUtils.ConvertToDate(header.BatchDate.ToString(), false);
            if (batchDate == DateTime.MinValue)
                batchDate = DateTime.Now;

            var batchResult = await _switchBatchProcessorService.CheckIfBatchExists(switchBatchNumber, switchDetail.SwitchId);
            if (batchResult.Equals(true))
            {
                string message = "Batch is a duplicate: " + switchBatchNumber;
                return 0;
            }

            var grouped = products.Where(r => r.RowType == "M").GroupBy(g => new { g.sPracticeNumber, g.sInvoiceNumber, g.sPatientNumber }).Select(rows => rows.Key);
            int invoiceId = 1;

            foreach (var item in grouped)
            {
                var invoiceItem = products.First(r => r.sPracticeNumber == item.sPracticeNumber && r.sPatientNumber == item.sPatientNumber && r.sInvoiceNumber == item.sInvoiceNumber);
                var lines = products.Where(r => r.sPracticeNumber == item.sPracticeNumber && r.sPatientNumber == item.sPatientNumber && r.sInvoiceNumber == item.sInvoiceNumber).ToList();

                DateTime? dischargedDate = BatchProcessorUtils.ConvertToDate(lines.Max(li => li.dtDischarge), false);
                DateTime? admittedDate = BatchProcessorUtils.ConvertToDate(lines.Min(li => li.dtAdmission), false);
                BatchProcessorUtils.DateAdmittedDischarged(BatchProcessorUtils.ConvertToDate(lines.Min(li => li.dtDateOfService), false), BatchProcessorUtils.ConvertToDate(lines.Max(li => li.dtDateOfService), false), ref admittedDate, ref dischargedDate);

                var invoice = new SwitchBatchInvoice();
                invoice.BatchSequenceNumber = invoiceId;
                invoice.SwitchBatchNumber = switchBatchNumber;
                invoice.SwitchTransactionNumber = string.IsNullOrEmpty(invoiceItem.sQEDITxn) ? invoiceItem.sSPTransactionNumber : invoiceItem.sQEDITxn;
                invoice.PracticeNumber = invoiceItem.sPracticeNumber;
                invoice.HealthCareProviderName = invoiceItem.sPracticeName;
                invoice.InvoiceDate = dischargedDate;
                invoice.DateSubmitted = batchDate;
                invoice.DateReceived = DateTime.Now;
                invoice.SpInvoiceNumber = invoiceItem.sInvoiceNumber;
                invoice.SpAccountNumber = invoiceItem.sPatientNumber;
                invoice.TotalInvoiceAmountInclusive = lines.Sum(i => BatchProcessorUtils.DefaultIfNullDecimal(i.crCost, 0));
                invoice.TotalInvoiceAmount = await _switchBatchProcessorService.DeriveAmountExcludingVATFromAmountInclusiveOfVAT(Convert.ToDecimal(invoice.TotalInvoiceAmountInclusive), admittedDate.Value);
                invoice.TotalInvoiceVat = invoice.TotalInvoiceAmountInclusive - invoice.TotalInvoiceAmount;
                invoice.DateAdmitted = admittedDate;
                invoice.DateDischarged = dischargedDate;
                invoice.ClaimReferenceNumber = invoiceItem.sClaimNumber;
                invoice.EventDate = BatchProcessorUtils.ConvertToDate(invoiceItem.dtDateOfInjury, true);
                invoice.Surname = invoiceItem.sPatientSurname;
                invoice.FirstName = invoiceItem.sPatientName;
                invoice.Initials = invoiceItem.sPatientInitials;
                invoice.IdNumber = invoiceItem.dtDateOfBirth;
                invoice.TreatingDocBhf = invoiceItem.sAttendingPracticeNo;
                invoice.EmployerName = invoiceItem.sEmployer;
                invoice.ReferringDocBhf = invoiceItem.sReferringPractice;
                invoice.ReferredTo = invoiceItem.sReferredTo;
                invoice.HospitalIndicator = invoiceItem.sHospitalIndicator;
                invoice.SurgeonBhfNumber = invoiceItem.sSurgeonBHF;
                invoice.AnaesthetistBhfNumber = invoiceItem.sAnaesthetistBHF;
                invoice.AssistantBhfNumber = invoiceItem.sAssistantBHF;
                invoice.LengthOfStay = invoiceItem.nLengthOfStay;
                invoice.FreeTextDiagnosis = invoiceItem.sDiagnosis;
                invoice.IodReference = invoiceItem.sIODReference;
                invoice.PatientGender = invoiceItem.sPatientGender;
                invoice.DiagnosticCodeType = invoiceItem.sICPC;
                invoice.DisciplineCode = invoiceItem.sBHFPracDesc;
                invoice.IsProcessed = false;
                invoice.IsActive = true;
                invoice.SwitchBatchType = SwitchBatchTypeEnum.MedEDI;

                if (!string.IsNullOrEmpty(invoiceItem.dtDateOfBirth) && invoiceItem.dtDateOfBirth.Length >= 6)
                {
                    var dob = BatchProcessorUtils.GetDobFromSaId(invoiceItem.dtDateOfBirth);
                    if (!string.IsNullOrEmpty(dob))
                    {
                        invoice.DateOfBirth = DateTime.Parse(dob);
                    }
                    else
                    {
                        invoice.DateOfBirth = BatchProcessorUtils.ParseDateTime(invoiceItem.dtDateOfBirth);
                        if (invoice.DateOfBirth == DateTime.MinValue && invoiceItem.dtDateOfBirth.Length >= 6)
                        {
                            DateTime tmpDate;
                            var success = DateTime.TryParseExact(invoiceItem.dtDateOfBirth.Substring(0, 6), "yyMMdd", null, DateTimeStyles.AssumeLocal, out tmpDate);
                            if (success)
                                invoice.DateOfBirth = tmpDate;
                        }
                    }
                }

                if (invoice.DateOfBirth.HasValue && invoice.DateOfBirth.Value == DateTime.MinValue)
                {
                    invoice.DateOfBirth = null;
                }
                else if (invoice.DateOfBirth.HasValue && (invoice.DateOfBirth.Value.Year < 1753))
                {
                    invoice.DateOfBirth = null;
                }

                invoice.CompanyNumber = invoiceItem.sEmployeeNo;
                invoice.PreAuthNumber = invoiceItem.sPreAuthNumber;

                var lineItems = await GetLineItems(invoiceId, lines, invoice.ClaimReferenceNumber);
                invoiceBreakDowns.AddRange(lineItems);
                invoice.SwitchBatchInvoiceLines = invoiceBreakDowns.Where(i => i.BatchSequenceNumber == invoiceId).ToList();

                invoices.Add(invoice);
                invoiceId++;
            }

            var switchBatch = new SwitchBatch
            {
                Description = switchDetail.Name + ": " + switchBatchNumber + " Date " + batchDate,
                SwitchBatchNumber = switchBatchNumber,
                DateSubmitted = batchDate,
                DateSwitched = batchDate,
                DateReceived = DateTime.Now,
                InvoicesStated = invoices.Count,
                InvoicesCounted = invoices.Count,
                LinesStated = Convert.ToInt32(footer.TotalNumberOfTransactions.Replace(" ", "")),
                LinesCounted = invoiceBreakDowns.Count,
                AmountStatedInclusive = BatchProcessorUtils.DefaultIfNullDecimal(footer.TotalAmountOfTransactions, 0),
                AmountCountedInclusive = invoices.Sum(i => Convert.ToDecimal(i.TotalInvoiceAmountInclusive)),
                SwitchFileName = System.IO.Path.GetFileName(fileName),
                DateCaptured = DateTime.Now,
                ModifiedBy = "Scheduler",
                SwitchId = switchDetail.SwitchId,
                AssignedToRoleId = switchDetail.AssignToRole,
                SwitchBatchType = SwitchBatchTypeEnum.MedEDI,
                IsActive = true
            };

            switchBatch.SwitchBatchInvoices = invoices;

            var switchBatchId = await _switchBatchProcessorService.WriteInvoicesToDatabase(switchBatch);
            return switchBatchId;
        }

        private async Task<List<SwitchBatchInvoiceLine>> GetLineItems(int invoiceId, IEnumerable<CommonDetailRow> lineItems, string fileRefNumber)
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
                li.SwitchTransactionNumber = sr.sQEDITxn;
                li.SwitchInternalNumber = sr.sQEDIInternal;
                li.FileSequenceNumber = sr.nSequence;
                li.Modifier1 = sr.sMod1;
                li.Modifier2 = sr.sMod2;
                li.Modifier3 = sr.sMod3;
                li.Modifier4 = sr.sMod4;
                li.DosageDuration = sr.sDosageDuration;
                li.ServiceProviderTransactionNumber = sr.sSPTransactionNumber;
                li.CptCode = sr.sCPTCode;
                li.IsActive = true;

                if (sr.dtTimeAdmitted != null && sr.dtTimeDischarged != null
                    && DateTime.TryParseExact(sr.dtTimeAdmitted, "MM/dd/yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var serviceStartDate)
                    && DateTime.TryParseExact(sr.dtTimeDischarged, "MM/dd/yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var serviceEndDate)
                    )
                {
                    li.ServiceTimeStart = serviceStartDate.TimeOfDay;
                    li.ServiceTimeEnd = serviceEndDate.TimeOfDay;
                }

                await _switchBatchProcessorService.ValidateICD10Codes(fileRefNumber, li);

                items.Add(li);
            }
            return items;
        }

        private class CommonDetailRow
        {
            [CsvColumn(FieldIndex = 1)]
            public string RowType { get; set; }
            [CsvColumn(FieldIndex = 2)]
            public string nSequence { get; set; }
            [CsvColumn(FieldIndex = 3)]
            public string sQEDITxn { get; set; }
            [CsvColumn(FieldIndex = 4)]
            public string sQEDIInternal { get; set; }
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
            public string sSysIDNumber { get; set; }
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
            public string sReferredTo { get; set; }
            [CsvColumn(FieldIndex = 29)]
            public string dtDateOfBirth { get; set; }
            [CsvColumn(FieldIndex = 30)]
            public string sSPTransactionNumber { get; set; }
            [CsvColumn(FieldIndex = 31)]
            public string sHospitalIndicator { get; set; }
            [CsvColumn(FieldIndex = 32)]
            public string sPreAuthNumber { get; set; }
            [CsvColumn(FieldIndex = 33)]
            public string sResubmissionFlag { get; set; }
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
            public string sQEDIFundNo { get; set; }
            [CsvColumn(FieldIndex = 47)]
            public string sReferringHSPCA { get; set; }
            [CsvColumn(FieldIndex = 48)]
            public string sTrackingNo { get; set; }
            [CsvColumn(FieldIndex = 49)]
            public string sOptomReadingAdds { get; set; }
            [CsvColumn(FieldIndex = 50)]
            public string sOptomLens { get; set; }
            [CsvColumn(FieldIndex = 51)]
            public string sOptomDensity { get; set; }
            [CsvColumn(FieldIndex = 52)]
            public string sBHFPracDesc { get; set; }
            [CsvColumn(FieldIndex = 53)]
            public string sEmployer { get; set; }
            [CsvColumn(FieldIndex = 54)]
            public string sEmployeeNo { get; set; }
            [CsvColumn(FieldIndex = 55)]
            public string dtDateOfInjury { get; set; }
            [CsvColumn(FieldIndex = 56)]
            public string sIODReference { get; set; }
            [CsvColumn(FieldIndex = 57)]
            public string crSEP { get; set; }
            [CsvColumn(FieldIndex = 58)]
            public string crDispenseFee { get; set; }
            [CsvColumn(FieldIndex = 59)]
            public string sServiceTime { get; set; }
            [CsvColumn(FieldIndex = 60)]
            public string s60 { get; set; }
            [CsvColumn(FieldIndex = 61)]
            public string s61 { get; set; }
            [CsvColumn(FieldIndex = 62)]
            public string s62 { get; set; }
            [CsvColumn(FieldIndex = 63)]
            public string s63 { get; set; }
            [CsvColumn(FieldIndex = 64)]
            public string dtAdmission { get; set; }
            [CsvColumn(FieldIndex = 65)]
            public string dtTimeAdmitted { get; set; }
            [CsvColumn(FieldIndex = 66)]
            public string dtDischarge { get; set; }
            [CsvColumn(FieldIndex = 67)]
            public string dtTimeDischarged { get; set; }
            [CsvColumn(FieldIndex = 68)]
            public string sSurgeonBHF { get; set; }
            [CsvColumn(FieldIndex = 69)]
            public string sAnaesthetistBHF { get; set; }
            [CsvColumn(FieldIndex = 70)]
            public string sAssistantBHF { get; set; }
            [CsvColumn(FieldIndex = 71)]
            public string sHospTariffType { get; set; }
            [CsvColumn(FieldIndex = 72)]
            public string bPerDiem { get; set; }
            [CsvColumn(FieldIndex = 73)]
            public string nLengthOfStay { get; set; }
            [CsvColumn(FieldIndex = 74)]
            public string sDiagnosis { get; set; }

            public CommonHeaderRow ToHeaderRow()
            {
                var row = new CommonHeaderRow();
                row.RowType = RowType;
                row.SwitchInternalReference = nSequence;
                row.TransactionType = sQEDITxn;
                row.SwitchAdministratorNumber = sQEDIInternal;
                row.BatchNumber = sClaimNumber;
                row.BatchDate = sPatientSurname;
                row.SchemaName = sPatientInitials;
                row.SwitchInternal = sPatientName;
                return row;
            }

            public CommonFotterRow ToFooterRow()
            {
                var row = new CommonFotterRow();
                row.RowType = RowType;
                row.TotalNumberOfTransactions = nSequence;
                row.TotalAmountOfTransactions = sQEDITxn;
                return row;
            }
        }

        private class CommonHeaderRow
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

        private class CommonFotterRow
        {
            public string RowType { get; set; }
            public string TotalNumberOfTransactions { get; set; }
            public string TotalAmountOfTransactions { get; set; }
        }
    }
}
