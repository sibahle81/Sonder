using LINQtoCSV;

using RMA.Common.Service.ServiceFabric;
using RMA.Service.MediCare.Contracts.Entities.Medical;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;
using RMA.Service.MediCare.Database.Entities;
using RMA.Service.MediCare.Utils;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;
using System.Collections.Generic;
using System.Data;
using System.Fabric;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics.Contracts;

namespace RMA.Service.MediCare.Services.Medical
{
    public class TebaProcessorFacade : RemotingStatelessService, ITebaProcessorService
    {
        private readonly ISwitchBatchProcessorService _switchBatchProcessorService;

        public TebaProcessorFacade(StatelessServiceContext context,
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
            var products = new List<TebaDetailRow>();
            byte[] byteArray = Encoding.ASCII.GetBytes(content);
            var stream = new MemoryStream(byteArray);
            using (var streamReader = new StreamReader(stream))
            {
                products = cc.Read<TebaDetailRow>(streamReader, inputFileDescription).ToList();
            }

            var invoices = new List<SwitchBatchInvoice>();
            var invoiceBreakDowns = new List<SwitchBatchInvoiceLine>();
            var header = products.First(r => r.RowType == "1").ToHeaderRow();
            var footer = products.First(r => r.RowType == "Z").ToFooterRow();
            string batchNumber = header.BatchNumber;

            var batchDate = BatchProcessorUtils.ConvertToDate(header.BatchDate.ToString(), false);

            var batchResult = await _switchBatchProcessorService.CheckIfBatchExists(batchNumber, switchDetail.SwitchId);

            if (batchResult)
                return 0;

            //group/sort all the non header and footer rows (RowType "C" = Claims and  RowType "F" = Finance) by practice, invoicenumber, patient details and data of service
            var grouped = products.Where(r => r.RowType == "C" || r.RowType == "F").GroupBy(g => new { g.sInvoiceNumber }).Select(rows => rows.Key);
            int invoiceId = 1;
            bool bIsBulk = false;
            foreach (var item in grouped)
            {
                //loop through each group first instance of it use that info to create the invoice item
                var invoiceItem = products.First(r => r.sInvoiceNumber == item.sInvoiceNumber);
                //find all items matching the line above to create the line items
                var lines = products.Where(r => r.sInvoiceNumber == item.sInvoiceNumber).ToList();
                var dischargedDate = BatchProcessorUtils.ConvertToDate(lines.Max(li => li.dtDateOfService), false); //dtDischarge
                var admittedDate = BatchProcessorUtils.ConvertToDate(lines.Min(li => li.dtDateOfService), false); //dtAdmission

                bIsBulk = invoiceItem.RowType == "C" ? false : true;

                var invoice = new SwitchBatchInvoice();
                invoice.BatchSequenceNumber = invoiceId;
                invoice.SwitchBatchNumber = batchNumber;
                invoice.SwitchTransactionNumber = string.IsNullOrEmpty(invoiceItem.sQEDITxn) ? string.Empty : invoiceItem.sQEDITxn;
                invoice.PracticeNumber = invoiceItem.sPracticeNumber;
                invoice.HealthCareProviderName = invoiceItem.sPracticeName;
                invoice.InvoiceDate = dischargedDate;
                invoice.DateSubmitted = batchDate;
                invoice.DateReceived = DateTime.Now;
                invoice.SpInvoiceNumber = invoiceItem.sInvoiceNumber;
                invoice.SpAccountNumber = invoiceItem.sIndustryNum;
                invoice.TotalInvoiceAmountInclusive = lines.Sum(i => BatchProcessorUtils.DefaultIfNullDecimal(i.crGrossAmount, 0));
                invoice.TotalInvoiceAmount = await _switchBatchProcessorService.DeriveAmountExcludingVATFromAmountInclusiveOfVAT(Convert.ToDecimal(invoice.TotalInvoiceAmountInclusive), admittedDate.Value);
                invoice.TotalInvoiceVat = invoice.TotalInvoiceAmountInclusive - invoice.TotalInvoiceAmount;
                invoice.DateAdmitted = admittedDate; //Use line item service dates
                invoice.DateDischarged = dischargedDate; //Use line item service dates
                invoice.ClaimReferenceNumber = invoiceItem.sClaimNumber;
                invoice.EventDate = BatchProcessorUtils.ConvertToDate(invoiceItem.dtDateOfService, true);
                invoice.Surname = invoiceItem.sPatientSurname;
                invoice.FirstName = invoiceItem.sPatientName;
                invoice.Initials = invoiceItem.sPatientInitials;
                invoice.DateOfBirth = BatchProcessorUtils.ConvertToDate(invoiceItem.dtDateOfBirth, false);
                invoice.PreAuthNumber = invoiceItem.sPreAuthNumber;
                invoice.SwitchBatchType = SwitchBatchTypeEnum.Teba;
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
                LinesStated = Convert.ToInt32(footer.TotalNumberOfTransactions),
                LinesCounted = invoiceBreakDowns.Count,
                AmountStatedInclusive = BatchProcessorUtils.DefaultIfNullDecimal(footer.TotalAmountOfTransactions, 0),
                AmountCountedInclusive = invoices.Sum(i => Convert.ToDecimal(i.TotalInvoiceAmountInclusive)),
                SwitchFileName = fileName,
                DateCaptured = DateTime.Now,
                ModifiedBy = "Scheduler",
                SwitchId = switchDetail.SwitchId,
                AssignedToRoleId = switchDetail.AssignToRole,
                SwitchBatchType = SwitchBatchTypeEnum.Teba,
                IsActive = true
            };

            switchBatch.SwitchBatchInvoices = invoices;

            return await _switchBatchProcessorService.WriteInvoicesToDatabase(switchBatch);
        }

        private async Task<List<SwitchBatchInvoiceLine>> GetLineItems(int invoiceId, IEnumerable<TebaDetailRow> lineItems)
        {
            var items = new List<SwitchBatchInvoiceLine>();
            foreach (var sr in lineItems)
            {
                var li = new SwitchBatchInvoiceLine();
                li.BatchSequenceNumber = invoiceId;
                li.Quantity = BatchProcessorUtils.DefaultIfNullDouble(sr.dQuantity, 1).ToString();
                li.TotalInvoiceLineCostInclusive = BatchProcessorUtils.DefaultIfNullDecimal(sr.crGrossAmount, 0);
                li.ServiceDate = BatchProcessorUtils.ConvertToDate(sr.dtDateOfService, false);
                li.TotalInvoiceLineCost = await _switchBatchProcessorService.DeriveAmountExcludingVATFromAmountInclusiveOfVAT(Convert.ToDecimal(li.TotalInvoiceLineCostInclusive), li.ServiceDate.Value);
                li.TotalInvoiceLineVat = await _switchBatchProcessorService.DeriveVATFromAmountInclusiveOfVAT(Convert.ToDecimal(li.TotalInvoiceLineCostInclusive), li.ServiceDate.Value);
                li.VatCode = BatchProcessorUtils.GetVatCode(Convert.ToDecimal(li.TotalInvoiceLineVat));
                li.TariffCode = string.IsNullOrEmpty(sr.sTariffCode) ? "" : sr.sTariffCode;
                li.Description = sr.sItemDescription;
                li.FileSequenceNumber = sr.nSequence;
                li.IsActive = true;

                items.Add(li);
            }
            return items;
        }

        private class TebaDetailRow
        {
            [CsvColumn(FieldIndex = 1)]
            public string RowType { get; set; }
            [CsvColumn(FieldIndex = 2)]
            public string nSequence { get; set; }
            [CsvColumn(FieldIndex = 3)]
            public string sQEDITxn { get; set; }
            [CsvColumn(FieldIndex = 4)]
            public string sIndustryNum { get; set; }
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
            public string sMedicalItemType { get; set; }
            [CsvColumn(FieldIndex = 11)]
            public string dtDateOfService { get; set; }
            [CsvColumn(FieldIndex = 12)]
            public string dQuantity { get; set; }
            [CsvColumn(FieldIndex = 13)]
            public string crUnitPrice { get; set; }
            [CsvColumn(FieldIndex = 14)]
            public string crNetAmount { get; set; }
            [CsvColumn(FieldIndex = 15)]
            public string Vat { get; set; }
            [CsvColumn(FieldIndex = 16)]
            public string crGrossAmount { get; set; }
            [CsvColumn(FieldIndex = 17)]
            public string sItemDescription { get; set; }
            [CsvColumn(FieldIndex = 18)]
            public string sTariffCode { get; set; }
            [CsvColumn(FieldIndex = 19)]
            public string sInvoiceNumber { get; set; }
            [CsvColumn(FieldIndex = 20)]
            public string sPracticeName { get; set; }
            [CsvColumn(FieldIndex = 21)]
            public string sPreAuthNumber { get; set; }
            [CsvColumn(FieldIndex = 22)]
            public string dtAdmission { get; set; }
            [CsvColumn(FieldIndex = 23)]
            public string dtDischarge { get; set; }
            [CsvColumn(FieldIndex = 24)]
            public string dtDateOfBirth { get; set; }
            [CsvColumn(FieldIndex = 25)]
            public string sDescription { get; set; }

            public CommonHeaderRow ToHeaderRow()
            {
                var row = new CommonHeaderRow();
                row.RowType = RowType;
                row.SwitchInternalReference = nSequence;
                row.TransactionType = sQEDITxn;
                row.BatchNumber = sIndustryNum;
                row.BatchDate = sClaimNumber;
                row.SchemaName = sPatientSurname;
                return row;
            }

            public CommonFooterRow ToFooterRow()
            {
                var row = new CommonFooterRow();
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
            public string BatchNumber { get; set; }
            public string BatchDate { get; set; }
            public string SchemaName { get; set; }
        }

        private class CommonFooterRow
        {
            public string RowType { get; set; }
            public string TotalNumberOfTransactions { get; set; }
            public string TotalAmountOfTransactions { get; set; }
        }
    }
}
