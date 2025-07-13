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
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace RMA.Service.MediCare.Services.Medical
{
    public class MediSwitchProcessorFacade : RemotingStatelessService, IMediSwitchProcessorService
    {
        private readonly ISwitchBatchProcessorService _switchBatchProcessorService;

        public MediSwitchProcessorFacade(StatelessServiceContext context,
            ISwitchBatchProcessorService switchBatchProcessorService)
            : base(context)
        {
            _switchBatchProcessorService = switchBatchProcessorService;
        }

        public async Task<int> ProcessFile(Switch switchDetail, string fileName, string content)
        {
            Contract.Requires(switchDetail != null);
            Message message;
            XmlSerializer serializer = new XmlSerializer(typeof(Message));
            using (var reader = new StringReader(content))
            {
                message = (Message)serializer?.Deserialize(reader);
            }

            var invoices = new List<SwitchBatchInvoice>();
            var invoiceBreakDowns = new List<SwitchBatchInvoiceLine>();

            var key = message.MessageHeader.Key;
            string batchNumber = key.SwitchReferenceNum;
            var batchDate = BatchProcessorUtils.ConvertToDate(key.TimeStamp, false);
            var batchDateNoTime = BatchProcessorUtils.ConvertToDate(key.TimeStamp, true);

            var batchResult = await _switchBatchProcessorService.CheckIfBatchExists(batchNumber, switchDetail.SwitchId);

            if (batchResult)
                return 0;

            int invoiceId = 1;
            var messageContents = message.MessageContents;
            foreach (var item in messageContents.Document)
            {
                var invoice = new SwitchBatchInvoice();
                invoice.BatchSequenceNumber = invoiceId;
                invoice.SwitchBatchNumber = batchNumber;
                invoice.SwitchTransactionNumber = invoiceId.ToString();
                invoice.PracticeNumber = item.ServiceProvider.BhfId;
                invoice.HealthCareProviderName = item.ServiceProvider.PracticeName;
                invoice.DateSubmitted = batchDateNoTime;
                invoice.DateReceived = DateTime.Now;
                invoice.SpInvoiceNumber = item.Patient.ServiceProviderReference;
                invoice.SpAccountNumber = item.ServiceEvent.EventReferenceNum;
                invoice.TotalInvoiceAmountInclusive = BatchProcessorUtils.DefaultIfNullDecimal(item.FinancialTransaction.Nett, 0) / 100;
                invoice.TotalInvoiceVat = BatchProcessorUtils.DefaultIfNullDecimal(item.FinancialTransaction.Vat, 0) / 100;
                invoice.TotalInvoiceAmount = invoice.TotalInvoiceAmountInclusive - invoice.TotalInvoiceVat;
                invoice.InvoiceDate = invoice.DateDischarged;
                invoice.ClaimReferenceNumber = item.Member.MedicalAid.MemberNum;
                invoice.EventDate = BatchProcessorUtils.ConvertToDate(item.ServiceEvent.Iod.IodDateTime, true);
                invoice.Surname = item.Member.Surname;
                invoice.FirstName = item.Patient.Name;
                invoice.Initials = item.Patient.Initials;

                if (!string.IsNullOrEmpty(item.ServiceEvent.AdmissionDateTime))
                    invoice.DateAdmitted = BatchProcessorUtils.ParseDateTime(item.ServiceEvent.AdmissionDateTime);
                else
                    invoice.DateAdmitted = BatchProcessorUtils.ParseDateTime(item.ServiceEvent.ServiceItem.First().ChargeStartDateTime);
                if (!string.IsNullOrEmpty(item.ServiceEvent.DischargeDateTime))
                    invoice.DateDischarged = BatchProcessorUtils.ParseDateTime(item.ServiceEvent.DischargeDateTime);
                else
                    invoice.DateDischarged = BatchProcessorUtils.ParseDateTime(item.ServiceEvent.ServiceItem.Last().ChargeStartDateTime);

                if (item.Patient.Identification != null && item.Patient.Identification.Type == "ID")
                    invoice.IdNumber = item.Patient.Identification.ReferenceCode;

                if (String.IsNullOrWhiteSpace(invoice.IdNumber))
                {
                    string strPatientDateOfBirth = item.Patient.DateTimeOfBirth;
                    string[] format = { "yyyyMMdd" };
                    DateTime dtPatientDateOfBirth = DateTime.MinValue;

                    DateTime.TryParseExact(strPatientDateOfBirth, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out dtPatientDateOfBirth);
                    if (dtPatientDateOfBirth == DateTime.MinValue)
                        invoice.IdNumber = null;
                    else
                        invoice.IdNumber = dtPatientDateOfBirth.ToString();
                }

                invoice.EmployerName = item.ServiceEvent.Iod.Employee;
                invoice.PreAuthNumber = item.ServiceEvent.ServiceItem[0].Authorisation.AuthorisationIdentifier;
                invoice.IsProcessed = false;
                invoice.SwitchBatchType = SwitchBatchTypeEnum.MedEDI;
                invoice.IsActive = true;

                var lineItems = await GetLineItems(invoiceId, item.ServiceEvent);
                invoiceBreakDowns.AddRange(lineItems);
                invoice.SwitchBatchInvoiceLines = invoiceBreakDowns.Where(i => i.BatchSequenceNumber == invoiceId).ToList();

                invoices.Add(invoice);
                invoiceId++;
            }

            var switchBatch = new SwitchBatch
            {
                Description = switchDetail.Name + ": " + batchNumber + " Date " + batchDate,
                SwitchBatchNumber = batchNumber,
                DateSubmitted = batchDate.Value,
                DateSwitched = batchDate.Value,
                DateReceived = DateTime.Now,
                InvoicesStated = Convert.ToInt32(message.MessageContents.TotalDocs),
                InvoicesCounted = invoices.Count,
                LinesStated = invoiceBreakDowns.Count,
                LinesCounted = invoiceBreakDowns.Count,
                AmountStatedInclusive = (decimal)invoices.Sum(i => i.TotalInvoiceAmountInclusive),
                AmountCountedInclusive = (decimal)invoices.Sum(i => i.TotalInvoiceAmountInclusive),
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

        private async Task<List<SwitchBatchInvoiceLine>> GetLineItems(int invoiceId, MessageMessageContentsDocumentServiceEvent serviceEvent)
        {
            var items = new List<SwitchBatchInvoiceLine>();
            foreach (var sr in serviceEvent.ServiceItem)
            {
                var li = new SwitchBatchInvoiceLine();
                li.BatchSequenceNumber = invoiceId;
                li.Quantity = BatchProcessorUtils.DefaultIfNullDouble(sr.ChargeQuantity, 1).ToString();
                li.TotalInvoiceLineCostInclusive = BatchProcessorUtils.DefaultIfNullDecimal(sr.FinancialTransaction.Nett, 0) / 100;
                li.TotalInvoiceLineVat = BatchProcessorUtils.DefaultIfNullDecimal(sr.FinancialTransaction.Vat, 0) / 100;
                li.TotalInvoiceLineCost = li.TotalInvoiceLineCostInclusive - li.TotalInvoiceLineVat;
                li.ServiceDate = BatchProcessorUtils.ConvertToDate(sr.ChargeStartDateTime, false);
                li.CreditAmount = BatchProcessorUtils.DefaultIfNullDecimal(sr.FinancialTransaction.Discount, 0) / 100;
                li.VatCode = BatchProcessorUtils.GetVatCode((decimal)li.TotalInvoiceLineVat);
                li.TariffCode = sr.ProductCode != null && !string.IsNullOrEmpty(sr.ProductCode.Identifier) ? sr.ProductCode.Identifier : sr.ChargeCode.Identifier;
                li.OtherCode = "";
                li.Description = sr.ChargeDescription;
                li.Icd10Code = GetDiagnosisCode(sr.Diagnosis);
                li.SwitchTransactionNumber = sr.Variable.Value;
                li.IsActive = true;

                if (sr.ChargeStartDateTime != null && sr.ChargeEndDateTime != null
                    && DateTime.TryParseExact(sr.ChargeStartDateTime, "MM/dd/yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var serviceStartDate)
                    && DateTime.TryParseExact(sr.ChargeEndDateTime, "MM/dd/yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var serviceEndDate)
                    )
                {
                    li.ServiceTimeStart = serviceStartDate.TimeOfDay;
                    li.ServiceTimeEnd = serviceEndDate.TimeOfDay;
                }

                items.Add(li);

                if (sr.ChargeCode != null && sr.ChargeCode.Modifier != null)
                {
                    foreach (var modifier in sr.ChargeCode.Modifier)
                    {
                        var mi = new SwitchBatchInvoiceLine();
                        mi.BatchSequenceNumber = invoiceId;
                        mi.Quantity = "1";
                        mi.TotalInvoiceLineCostInclusive = 0;
                        mi.TotalInvoiceLineVat = 0;
                        mi.TotalInvoiceLineCost = 0;
                        mi.ServiceDate = li.ServiceDate;
                        mi.CreditAmount = 0;
                        mi.VatCode = "1";
                        mi.TariffCode = modifier.Value;
                        mi.OtherCode = "";
                        mi.Description = "Modifier on " + (sr.ProductCode != null && !string.IsNullOrEmpty(sr.ProductCode.Identifier) ? sr.ProductCode.Identifier : sr.ChargeCode.Identifier);
                        mi.Icd10Code = GetDiagnosisCode(sr.Diagnosis);
                        mi.SwitchTransactionNumber = sr.Variable.Value;
                        mi.IsActive = true;
                        items.Add(mi);
                    }
                }
            }

            return items;
        }

        private string GetDiagnosisCode(IEnumerable<MessageMessageContentsDocumentServiceEventServiceItemDiagnosis> diagnosis)
        {
            if (diagnosis == null) return "";
            return string.Join("/", diagnosis.Select(item => item.DiagnosisCode?.Identifier).ToArray());
        }

        protected void ValidateICD10Codes(SwitchBatchInvoiceLine invoiceLine)
        {
            Contract.Requires(invoiceLine != null);
            var results = ValidationUtils.ValidateICD10CodeFormat(invoiceLine.Icd10Code);

            if (results.Count > 0)
            {
                foreach (var item in results)
                {
                    invoiceLine.SwitchBatchInvoiceLineUnderAssessReasons.Add(new SwitchBatchInvoiceLineUnderAssessReason
                    {
                        SwitchUnderAssessReason = (SwitchUnderAssessReasonEnum)(Convert.ToInt32(item.Key)),
                        UnderAssessReason = item.Value,
                        IsActive = true
                    });
                }
            }
        }

    }
}
