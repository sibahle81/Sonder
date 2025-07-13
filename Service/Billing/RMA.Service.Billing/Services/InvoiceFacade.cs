using AutoMapper;

using Castle.Core.Internal;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.BusinessProcessManager.Contracts.Interfaces;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Billing.Contracts;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Enums;
using RMA.Service.Billing.Contracts.Interfaces;
using RMA.Service.Billing.Database.Constants;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Product;
using RMA.Service.ClientCare.Contracts.Interfaces.RolePlayer;

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics.Contracts;
using System.Fabric;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

using FinPayee = RMA.Service.ClientCare.Contracts.Entities.RolePlayer.FinPayee;
using Invoice = RMA.Service.Billing.Contracts.Entities.Invoice;
using InvoiceAllocation = RMA.Service.Billing.Contracts.Entities.InvoiceAllocation;


namespace RMA.Service.Billing.Services
{
    public class InvoiceFacade : RemotingStatelessService, IInvoiceService
    {
        private const string BulkCreditNoteForInvoice = "BulkCreditNoteForInvoice";
        private const string BillingModulePermissions = "BillingModulePermissions";
        private const string autoDebitOrdersGoLiveDate = "autoDebitOrdersGoLiveDate";
        private string pdfDocumentPass;
        private string invoiceMessageBody;
        private string creditNoteMessageBody;
        private const string riotCode = "RIO";
        private const string empCode = "EMP";
        private const string wmpCode = "WMP";
        private const string cicjpCode = "CICJP";
        private const string cjpCode = "CJP";
        private const string augCode = "AUG";
        private const string gpaCode = "GPA";
        private const string coidInternationalCode = "CINTER";

        private readonly IRepository<billing_Invoice> _invoiceRepository;
        private readonly IRepository<billing_Transaction> _transactionRepository;
        private readonly IRepository<billing_InvoiceAllocation> _invoiceAllocationRepository;
        private readonly IRolePlayerService _rolePlayerService;
        private readonly IDbContextScopeFactory _dbContextScopeFactory;
        private readonly ISendEmailService _sendEmailService;
        private readonly IConfigurationService _configurationService;
        private readonly IRolePlayerPolicyService _rolePlayerPolicyService;
        private string _fromAddress;
        private string _reportServerUrl;
        private string _parameters;
        private readonly IDocumentGeneratorService _documentGeneratorService;
        private readonly IRepository<billing_Collection> _collectionRepository;
        private readonly ITransactionCreatorService _transactionCreatorService;
        private WebHeaderCollection _headerCollection;
        private readonly ISerializerService _serializer;
        private readonly IWizardService _wizardService;
        private readonly IPeriodService _periodService;
        private readonly IRepository<client_FinPayee> _finPayeeRepository;
        private readonly IProductService _productService;
        private string finCareReportServerUrl;
        private readonly IDocumentNumberService _documentNumberService;
        private readonly IBillingService _billingService;
        private readonly IProductOptionService _productOptionService;
        private readonly IRepository<billing_InvoiceLineItem> _invoiceLineItemRepository;
        private readonly IIndustryService _industryService;

        public InvoiceFacade(
            StatelessServiceContext context,
            IDbContextScopeFactory dbContextScopeFactory,
            ISendEmailService sendEmailService,
            IConfigurationService configurationService,
            IRepository<billing_InvoiceAllocation> invoiceAllocationRepository,
            IRepository<billing_Invoice> invoiceRepository,
            IRepository<billing_Transaction> transactionRepository,
            IDocumentGeneratorService documentGeneratorService,
            IRolePlayerPolicyService rolePlayerPolicyService,
            IRolePlayerService rolePlayerService,
            IRepository<billing_Collection> collectionRepository,
            ITransactionCreatorService transactionCreatorService,
            ISerializerService serializer,
            IWizardService wizardService,
            IPeriodService periodService,
            IRepository<client_FinPayee> finPayeeRepository,
            IProductService productService,
            IDocumentNumberService documentNumberService,
            IBillingService billingService,
            IProductOptionService productOptionService,
            IRepository<billing_InvoiceLineItem> invoiceLineItemRepository,
            IIndustryService industryService
        ) : base(context)
        {
            _dbContextScopeFactory = dbContextScopeFactory;
            _invoiceRepository = invoiceRepository;
            _transactionRepository = transactionRepository;
            _sendEmailService = sendEmailService;
            _configurationService = configurationService;
            _rolePlayerPolicyService = rolePlayerPolicyService;
            _rolePlayerService = rolePlayerService;
            _invoiceAllocationRepository = invoiceAllocationRepository;
            _collectionRepository = collectionRepository;
            _transactionCreatorService = transactionCreatorService;
            _serializer = serializer;
            _wizardService = wizardService;
            _periodService = periodService;
            _documentGeneratorService = documentGeneratorService;
            _finPayeeRepository = finPayeeRepository;
            _productService = productService;
            _documentNumberService = documentNumberService;
            _billingService = billingService;
            _productOptionService = productOptionService;
            _invoiceLineItemRepository = invoiceLineItemRepository;
            _industryService = industryService;
            Task.Run(() => this.SetupInvoiceSendVariables()).Wait();
        }

        public async Task<List<Invoice>> GetInvoices()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoices = await _invoiceRepository
                    .Where(inv => inv.InvoiceId > 0)
                    .ToListAsync();
                await _invoiceRepository.LoadAsync(invoices, x => x.InvoiceLineItems);
                await _invoiceRepository.LoadAsync(invoices, x => x.Collections);
                await _invoiceRepository.LoadAsync(invoices, x => x.Transactions);
                return Mapper.Map<List<Invoice>>(invoices);
            }
        }

        public async Task<Invoice> GetInvoice(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.Create())
            {
                var invoice = await _invoiceRepository
                    .SingleAsync(inv => inv.InvoiceId == id,
                        $"Could not find invoice with id {id}");
                await _invoiceRepository.LoadAsync(invoice, x => x.InvoiceLineItems);
                await _invoiceRepository.LoadAsync(invoice, x => x.Collections);
                await _invoiceRepository.LoadAsync(invoice, x => x.Transactions);

                return Mapper.Map<Invoice>(invoice);
            }
        }

        public async Task<List<Invoice>> GetInvoicesByIds(List<int> ids)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.Create())
            {
                var invoice = await _invoiceRepository
                    .Where(inv => ids.Contains(inv.InvoiceId)).ToListAsync();

                return Mapper.Map<List<Invoice>>(invoice);
            }
        }

        public async Task<Invoice> GetInvoiceByInvoiceNumber(string invoiceNumber)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoice = await _invoiceRepository.FirstOrDefaultAsync(s => s.InvoiceNumber == invoiceNumber);
                return Mapper.Map<Invoice>(invoice);
            }
        }

        public async Task<Invoice> GetInvoiceById(int id)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.Create())
            {
                var invoice = await _invoiceRepository
                    .SingleAsync(inv => inv.InvoiceId == id,
                        $"Could not find invoice with id {id}");

                return Mapper.Map<Invoice>(invoice);
            }
        }

        public async Task<List<InvoiceAllocation>> GetRecoveryAllocationsByRecoveryId(int recoveryId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceAllocations = await _invoiceAllocationRepository.Where(i => i.ClaimRecoveryId == recoveryId).ToListAsync();

                return Mapper.Map<List<InvoiceAllocation>>(invoiceAllocations);
            }
        }

        public async Task<Invoice> GetInvoiceByPolicyId(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.Create())
            {
                var invoice = await _invoiceRepository.SingleAsync(inv => inv.PolicyId == policyId,
                        $"Could not find invoice with policyId {policyId}");
                await _invoiceRepository.LoadAsync(invoice, x => x.InvoiceLineItems);
                await _invoiceRepository.LoadAsync(invoice, x => x.Collections);
                await _invoiceRepository.LoadAsync(invoice, x => x.Transactions);

                return Mapper.Map<Invoice>(invoice);
            }
        }

        public async Task<int> AddInvoice(Invoice invoice)
        {
            if (invoice != null)
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                    RmaIdentity.DemandPermission(Permissions.AddInvoice);

                using (var scope = _dbContextScopeFactory.Create())
                {
                    invoice.InvoiceDate = invoice.InvoiceDate == null ? DateTimeHelper.SaNow : invoice.InvoiceDate;
                    var entity = Mapper.Map<billing_Invoice>(invoice);
                    _invoiceRepository.Create(entity);
                    await scope.SaveChangesAsync()
                        .ConfigureAwait(false);
                    return entity.InvoiceId;
                }
            }
            return 0;
        }

        public async Task AddInvoices(List<Invoice> invoices)
        {
            Contract.Requires(invoices != null);
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entities = Mapper.Map<List<billing_Invoice>>(invoices);
                _invoiceRepository.Create(entities);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

        }

        public async Task ModifyInvoiceStatus(int invoiceId, InvoiceStatusEnum newStatus)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _invoiceRepository.Where(x => x.InvoiceId == invoiceId).SingleAsync();
                entity.InvoiceStatus = newStatus;
                _invoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<bool> RegenerateInvoiceNonFinancials(InvoiceNonFinancialReGenBusMessage invoiceNonFinancialReGenBusMessage)
        {
            if (invoiceNonFinancialReGenBusMessage != null)
            {
                try
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        foreach (var lineItem in invoiceNonFinancialReGenBusMessage.InvoiceLineItemNonFinancialReGens)
                        {
                            var existingLineItem = await _invoiceLineItemRepository.FirstOrDefaultAsync(x => x.InvoiceLineItemsId == lineItem.InvoiceLineItemsId && x.IsActive);

                            if (existingLineItem != null)
                            {
                                //Save New Line Item
                                var newInvoiceLineItem = Mapper.Map<InvoiceLineItem>(existingLineItem);
                                newInvoiceLineItem.InvoiceLineItemsId = 0;
                                newInvoiceLineItem.CreatedBy = null;
                                newInvoiceLineItem.ModifiedBy = null;
                                newInvoiceLineItem.NoOfEmployees = lineItem.NoOfEmployees;
                                newInvoiceLineItem.IsActive = true;
                                newInvoiceLineItem.CreatedDate = DateTime.Now;
                                newInvoiceLineItem.ModifiedDate = DateTime.Now;
                                var entity = Mapper.Map<billing_InvoiceLineItem>(newInvoiceLineItem);
                                _invoiceLineItemRepository.Create(entity);

                                //Updated Existing Line Item
                                existingLineItem.IsActive = false;
                                _invoiceLineItemRepository.Update(existingLineItem);
                            }
                        }
                        await scope.SaveChangesAsync().ConfigureAwait(false);
                    }
                    return true;
                }
                catch (Exception ex)
                {
                    ex.LogException($"Error when trying to renegerate invoice non financials");
                    throw;
                }
            }
            return false;
        }

        public async Task GenerateInvoices(ClientTypeEnum clientType, PaymentFrequencyEnum paymentFrequency)
        {
            try
            {
                var allowBilling =
                    (await _configurationService.GetModuleSetting(SystemSettings.AllowBilling)).ToBoolean(false);

                if (allowBilling)
                {
                    using (_dbContextScopeFactory.CreateReadOnly())
                    {
                        SqlParameter[] parameters =
                        {
                            new SqlParameter("ClientTypeId", clientType),
                            new SqlParameter("PaymentFrequencyId", paymentFrequency),
                            new SqlParameter("PolicyId", Convert.ToInt64(0)),
                            new SqlParameter("ReportOnly", false),
                            new SqlParameter("Commit", true),
                            new SqlParameter("ForceRaisePremium", false),
                            new SqlParameter("Date", DateTimeHelper.SaNow)
                        };

                        await _invoiceRepository.ExecuteSqlCommandAsync(DatabaseConstants.RaisePendingInstallmentPremiums,
                            parameters);
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Generating Invoices - Error Message {ex.Message}");
            }
        }

        public async Task AssignInvoiceNumbers()
        {
            try
            {
                var allowBilling =
                    (await _configurationService.GetModuleSetting(SystemSettings.AllowBilling)).ToBoolean(false);
                if (allowBilling)
                {
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var invoices = await _invoiceRepository.Where(x => (string.IsNullOrEmpty(x.InvoiceNumber) || x.InvoiceNumber == null)).ToListAsync();
                        foreach (var invoice in invoices)
                        {
                            //prevent multiple assignments during concurrent execution
                            var unAssignedInvoice = await _invoiceRepository.Where(x => x.InvoiceId == invoice.InvoiceId && string.IsNullOrEmpty(x.InvoiceNumber)).FirstOrDefaultAsync();
                            if (unAssignedInvoice != null)
                            {
                                var invoiceNumber =
                                    await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Invoice, "");
                                invoice.InvoiceNumber = invoiceNumber;
                                _invoiceRepository.Update(invoice);
                            }

                        }
                        await scope.SaveChangesAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Assigning invoice numbers - Error Message {ex.Message}");
            }
        }

        public async Task<List<InvoicePaymentAllocation>> GetUnPaidInvoices(int rolePlayerId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoicePaymentAllocations = new List<InvoicePaymentAllocation>();

                var invoices = await _invoiceRepository.SqlQueryAsync<Invoice>(DatabaseConstants.GetUnsettledInvoices, new SqlParameter("rolePlayerId", rolePlayerId));

                var finPayeeNumber = (await _rolePlayerService.GetFinPayee(rolePlayerId)).FinPayeNumber;

                foreach (var invoice in invoices)
                {
                    if (invoice == null) continue;

                    var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId);
                    if (policy == null)
                        continue;

                    var allocation = new InvoicePaymentAllocation()
                    {
                        PolicyNumber = policy.PolicyNumber,
                        InvoiceId = invoice.InvoiceId,
                        InvoiceStatus = invoice.InvoiceStatus,
                        CollectionDate = invoice.CollectionDate,
                        InvoiceDate = invoice.InvoiceDate,
                        TotalInvoiceAmount = invoice.TotalInvoiceAmount,
                        InvoiceNumber = invoice.InvoiceNumber,
                        AmountOutstanding = invoice.Balance,
                        DisplayName = finPayeeNumber
                    };

                    invoicePaymentAllocations.Add(allocation);
                }

                return invoicePaymentAllocations;
            }
        }

        private decimal GetOutstandingAmount(List<Contracts.Entities.Transaction> transactions)
        {
            var credits = -transactions.Where(t => t.TransactionTypeLinkId == 1).Sum(t => t.Amount);
            var debits = transactions.Where(t => t.TransactionTypeLinkId == 2).Sum(t => t.Amount);
            return credits + debits;
        }

        private DateTime GetNextPaymentDate(int? regularInstallmentDayOfMonth, int? decemberInstallmentDayOfMonth)
        {
            var regularDay = regularInstallmentDayOfMonth.HasValue ? regularInstallmentDayOfMonth.Value : 1;
            var decemberDay = decemberInstallmentDayOfMonth.HasValue ? decemberInstallmentDayOfMonth.Value : regularDay;

            var today = DateTimeHelper.SaNow.Date;

            if (regularDay >= 29)
            {
                if (DateTime.IsLeapYear(today.Year))
                {
                    regularDay = 29;
                }
                else
                {
                    regularDay = regularDay == 29 ? regularDay : DateTime.DaysInMonth(today.Year, today.Month);
                }
            }

            var regularDate = new DateTime(today.Year, today.Month, regularDay);
            var decemberDate = new DateTime(today.Year, today.Month, decemberDay);

            var payDate = new DateTime();
            if (today.Month == 12)
            {
                if (decemberDate > today)
                {
                    payDate = decemberDate;
                }
                else
                {
                    payDate = regularDate.AddMonths(1);
                }
            }
            else
            {
                if (regularDate > today)
                {
                    payDate = regularDate;
                }
                else
                {
                    regularDate = regularDate.AddMonths(1);
                    if (regularDate.Month == 12)
                    {
                        regularDate = new DateTime(regularDate.Year, regularDate.Month, decemberDay);
                        payDate = regularDate.AddMonths(regularDate > today ? 0 : 1);
                    }
                    else
                    {
                        payDate = regularDate;
                    }
                }
            }

            return payDate;
        }

        public async Task<PagedRequestResult<InvoicePaymentAllocation>> SearchUnPaidInvoices(PagedRequest request)
        {
            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var param = new SqlParameter() { Value = request.SearchCriteria };
                var invoices =
                    await _invoiceRepository.SqlQueryAsync<InvoicePaymentAllocation>("SearchUnpaidInvoices", param);

                var invoicePaymentAllocations = new PagedRequestResult<InvoicePaymentAllocation>()
                {
                    Page = request.Page,
                    PageCount = invoices.Count,
                    RowCount = invoices.Count,
                    PageSize = request.PageSize,
                    Data = invoices
                };
                return invoicePaymentAllocations;
            }
        }

        public async Task<List<InvoiceSearchResult>> SearchInvoices(PagedRequest request, bool showActive)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int recordCount = 0;
                var parameters = new[] {
                new SqlParameter("FilterType", 1),
                    new SqlParameter("Filter", request.SearchCriteria),
                    new SqlParameter("ShowActive", showActive),
                    new SqlParameter("pageNumber", request.Page),
                    new SqlParameter("pageSize", request.PageSize),
                    new SqlParameter("recordCount", SqlDbType.BigInt) { Direction = ParameterDirection.Output}
                };

                var searchResult = await _invoiceRepository.SqlQueryAsync<InvoiceSearchResult>(
                    DatabaseConstants.SearchInvoicesStoredProcedure, parameters);

                var propertyInfo =
                typeof(InvoiceSearchResult).GetProperty(
                    request.OrderBy.Substring(0, 1).ToUpper() + request.OrderBy.Substring(1));
                System.Func<InvoiceSearchResult, object> keySelector = i => propertyInfo.GetValue(i, null);

                var result = request.IsAscending
                    ? searchResult.OrderBy(keySelector)
                    : searchResult.OrderByDescending(keySelector);

                recordCount = Convert.ToInt32(parameters[5]?.Value);
                return result.ToList();
            }
        }

        public async Task<List<SearchAccountResults>> SearchAccounts(PagedRequest request, bool showActive)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            Contract.Requires(request != null);
            if (request.SearchCriteria.IsNullOrEmpty()) return new List<SearchAccountResults>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var strQuery = request.SearchCriteria;
                if (strQuery.Contains("%2F"))
                {
                    strQuery = strQuery.Replace("%2F", "/");
                }

                var searchResult = await _invoiceRepository.SqlQueryAsync<SearchAccountResults>(
                    DatabaseConstants.SearchAccountsStoredProcedure,
                    new SqlParameter("FilterType", 1),
                    new SqlParameter("Filter", strQuery),
                    new SqlParameter("ShowActive", showActive));

                var propertyInfo =
                    typeof(SearchAccountResults).GetProperty(
                        request.OrderBy.Substring(0, 1).ToUpper() + request.OrderBy.Substring(1));
                System.Func<SearchAccountResults, object> keySelector = i => propertyInfo.GetValue(i, null);

                var result = request.IsAscending
                    ? searchResult.OrderBy(keySelector)
                    : searchResult.OrderByDescending(keySelector);

                return result.ToList();
            }
        }

        public async Task SendInvoiceDocument(InvoiceSearchResult invoiceSearchResult)
        {
            if (invoiceSearchResult != null)
            {
                _parameters = $"&invoiceId={invoiceSearchResult?.InvoiceId}&rs:Command=ClearSession";

                var environment = await _configurationService.GetModuleSetting("Environment");

                _headerCollection = new WebHeaderCollection
                {
                    {"Authorization", "Bearer " + RmaIdentity.AccessToken},
                    {SystemSettings.Environment, environment}
                };

                if (invoiceSearchResult.InvoiceType == InvoiceTypeEnum.Coid)
                {
                    await SendCoidInvoiceByEmail(invoiceSearchResult);
                }
                else
                {
                    await SendInvoiceByEmail(invoiceSearchResult);
                }
            }
        }

        private async Task SendInvoiceByEmail(InvoiceSearchResult invoiceSearchResult)
        {
            _fromAddress =
                await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            _reportServerUrl =
                $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.FinCare";

            var invoiceDocument = await GetUriDocumentByteData(
                new Uri($"{_reportServerUrl}/RMAFuneralInvoice{_parameters}&rs:Format=PDF"), _headerCollection);

            var attachments = new List<MailAttachment>
            {
                new MailAttachment
                {
                    AttachmentByteData = invoiceDocument,
                    FileName = "Invoice.pdf",
                    FileType = "application/pdf"
                },
            };

            var emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralInvoice));

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = invoiceSearchResult.InvoiceId,
                ItemType = "Invoice",
                FromAddress = _fromAddress,
                Recipients = invoiceSearchResult.EmailAddress,
                RecipientsCC = null,
                Subject = $"RMA Funeral Policy Invoice: {invoiceSearchResult.PolicyNumber}",
                Body = emailBody.Replace("{0}", invoiceSearchResult.FirstName + " " + invoiceSearchResult.Surname)
                    .Replace("{1}", invoiceSearchResult.PolicyNumber),
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }

        private async Task SendCoidInvoiceByEmail(InvoiceSearchResult invoiceSearchResult)
        {
            _fromAddress =
                await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            _reportServerUrl =
                $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.FinCare";
            var invoiceDocument = await GetUriDocumentByteData(
                new Uri($"{_reportServerUrl}/RMACoidInvoice{_parameters}&rs:Format=PDF"), _headerCollection);

            var attachments = new List<MailAttachment>
            {
                new MailAttachment
                {
                    AttachmentByteData = invoiceDocument,
                    FileName = "Invoice.pdf",
                    FileType = "application/pdf"
                },
            };

            var emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMACoidInvoice));

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = invoiceSearchResult.InvoiceId,
                ItemType = "Invoice",
                FromAddress = _fromAddress,
                Recipients = invoiceSearchResult.EmailAddress,
                RecipientsCC = null,
                Subject = $"RMA Coid Policy Invoice: {invoiceSearchResult.PolicyNumber}",
                Body = emailBody.Replace("{0}", invoiceSearchResult.FirstName + " " + invoiceSearchResult.Surname)
                    .Replace("{1}", invoiceSearchResult.PolicyNumber),
                IsHtml = true,
                Attachments = attachments.ToArray()
            });
        }

        private async Task SetupInvoiceSendVariables()
        {
            _fromAddress =
                await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            _reportServerUrl =
                $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.FinCare";
            finCareReportServerUrl = $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.FinCare";
            pdfDocumentPass = await _configurationService.GetModuleSetting(SystemSettings.PdfDocPass);
            pdfDocumentPass = await _configurationService.GetModuleSetting(SystemSettings.PdfDocPass);
            invoiceMessageBody = await _configurationService.GetModuleSetting(SystemSettings.RMACoidInvoice);
            creditNoteMessageBody = await _configurationService.GetModuleSetting(SystemSettings.RMACreditNoteMessage);
        }

        private async Task<byte[]> GetUriDocumentByteData(Uri url, WebHeaderCollection webHeaderCollection = null)
        {
            return await url.GetUriDataAsync(webHeaderCollection);
        }

        public async Task GenerateInvoice(int policyId, ClientTypeEnum clientType)
        {
            var allowBilling =
                (await _configurationService.GetModuleSetting(SystemSettings.AllowBilling)).ToBoolean(false);

            if (allowBilling)
            {
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    SqlParameter[] parameters =
                    {
                        new SqlParameter("ClientTypeId", Convert.ToInt64(clientType)),
                        new SqlParameter("PaymentFrequencyId", Convert.ToInt64(0)),
                        new SqlParameter("PolicyId", Convert.ToInt64(policyId)),
                        new SqlParameter("ReportOnly", false),
                        new SqlParameter("Commit", true),
                        new SqlParameter("ForceRaisePremium", false),
                        new SqlParameter("Date", DateTimeHelper.SaNow)
                    };

                    await _invoiceRepository.ExecuteSqlCommandAsync(DatabaseConstants.RaisePendingInstallmentPremiums,
                        parameters);
                }
            }
        }

        public async Task SendStatement(InvoiceSearchResult invoiceSearchResult)
        {
            _parameters = $"&policyIds={invoiceSearchResult?.PolicyId}&rs:Command=ClearSession";

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                {"Authorization", "Bearer " + RmaIdentity.AccessToken},
                {SystemSettings.Environment, environment}
            };

            await SendStatementByEmail(invoiceSearchResult);
        }

        private async Task SendStatementByEmail(InvoiceSearchResult invoiceSearchResult)
        {
            _fromAddress =
            await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            _reportServerUrl =
                $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.FinCare";
            byte[] statementDocument;
            var emailBody = string.Empty;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoiceSearchResult.PolicyId);
                var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);

                var productCategory = GetProductCategoryByProduct(product);
                if (productCategory == ProductCategoryTypeEnum.Funeral)
                {
                    statementDocument = await GetUriDocumentByteData(
                   new Uri($"{_reportServerUrl}/RMAStatement{_parameters}&rs:Format=PDF"), _headerCollection);
                    emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralStatement));
                }
                else
                {
                    statementDocument = await GetUriDocumentByteData(
                                 new Uri($"{_reportServerUrl}/RMAStatement{_parameters}&rs:Format=PDF"), _headerCollection);
                    emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMACoidStatement));
                }
            }

            var attachments = new List<MailAttachment>
            {
                new MailAttachment
                {
                    AttachmentByteData = statementDocument,
                    FileName = "Statement.pdf",
                    FileType = "application/pdf"
                },
            };

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = invoiceSearchResult.InvoiceId,
                ItemType = "Invoice",
                FromAddress = _fromAddress,
                Recipients = invoiceSearchResult.EmailAddress,
                RecipientsCC = null,
                Subject = $"RMA Policy Statement: {invoiceSearchResult.PolicyNumber}",
                Body = emailBody.Replace("{0}", invoiceSearchResult.FirstName + " " + invoiceSearchResult.Surname)
                    .Replace("{1}", invoiceSearchResult.PolicyNumber),
                IsHtml = true,
                Attachments = attachments.ToArray()
            });

            var text = $"Statement emailed to {invoiceSearchResult.EmailAddress}";
            var note = new BillingNote
            {
                ItemId = invoiceSearchResult.RolePlayerId,
                ItemType = BillingNoteTypeEnum.Email.GetDescription(),
                Text = text
            };
            await _billingService.AddBillingNote(note);
        }

        public async Task SendTransactionalStatement(InvoiceSearchResult invoiceSearchResult)
        {
            _parameters = $"&invoiceId={invoiceSearchResult?.InvoiceId}&rs:Command=ClearSession";

            var environment = await _configurationService.GetModuleSetting("Environment");

            _headerCollection = new WebHeaderCollection
            {
                {"Authorization", "Bearer " + RmaIdentity.AccessToken},
                {SystemSettings.Environment, environment}
            };

            await SendTransactionalStatementByEmail(invoiceSearchResult);
        }

        private async Task SendTransactionalStatementByEmail(InvoiceSearchResult invoiceSearchResult)
        {
            _fromAddress =
                await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
            _reportServerUrl =
                $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.FinCare";
            var statementDocument = await GetUriDocumentByteData(
                new Uri($"{_reportServerUrl}/RMAFuneralTransactionalStatement{_parameters}&rs:Format=PDF"),
                _headerCollection);

            var attachments = new List<MailAttachment>
            {
                new MailAttachment
                {
                    AttachmentByteData = statementDocument,
                    FileName = "Statement.pdf",
                    FileType = "application/pdf"
                },
            };


            var emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralStatement));

            await _sendEmailService.SendEmail(new SendMailRequest
            {
                ItemId = invoiceSearchResult.InvoiceId,
                ItemType = "Invoice",
                FromAddress = _fromAddress,
                Recipients = invoiceSearchResult.EmailAddress,
                RecipientsCC = null,
                Subject = $"RMA Policy Statement: {invoiceSearchResult.PolicyNumber}",
                Body = emailBody.Replace("{0}", invoiceSearchResult.FirstName + " " + invoiceSearchResult.Surname)
                    .Replace("{1}", invoiceSearchResult.PolicyNumber),
                IsHtml = true,
                Attachments = attachments.ToArray()
            });

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                if (invoiceSearchResult != null && invoiceSearchResult.RolePlayerId == 0 && invoiceSearchResult.PolicyId > 0)
                {
                    var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoiceSearchResult.PolicyId);
                    if (policy != null)
                        invoiceSearchResult.RolePlayerId = policy.PolicyPayeeId;
                }
                if (invoiceSearchResult.RolePlayerId > 0)
                {
                    var text = $"Statement emailed to {invoiceSearchResult.EmailAddress}";
                    var note = new BillingNote
                    {
                        ItemId = invoiceSearchResult.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.Email.GetDescription(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);
                }
            }
        }

        public async Task<List<Invoice>> GetInvoicesReadyToCollect()
        {
            var invoices = new List<Invoice>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {

                var today = DateTimeHelper.SaNow.Date;
                var currentMonth = DateTimeHelper.SaNow.Month;
                var collectionGenerationStartDate = new DateTime(2021, 3, 1);
                var entities = await (from inv in _invoiceRepository
                                      join collections in _collectionRepository on inv.InvoiceId equals collections.InvoiceId
                                      into results
                                      from collections in results.DefaultIfEmpty()
                                      where collections.InvoiceId == null && inv.InvoiceDate >= collectionGenerationStartDate && today >= inv.CollectionDate
                                            && currentMonth == inv.CollectionDate.Month && inv.InvoiceStatus == InvoiceStatusEnum.Pending && inv.TotalInvoiceAmount > 0
                                      select inv).Take(100).ToListAsync();

                foreach (var entity in entities)
                {
                    var invoice = Mapper.Map<Invoice>(entity);
                    if (invoice.Balance > 0)
                    {
                        invoices.Add(invoice);
                    }
                }
            }

            return invoices;
        }

        public async Task<PagedRequestResult<Invoice>> GetUnpaidInvoicesByPolicyId(PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policyId = int.Parse(request.SearchCriteria);
                var result = await _invoiceRepository
                    .Where(c => c.PolicyId == policyId && c.InvoiceStatus == InvoiceStatusEnum.Unpaid)
                    .ToPagedResult<billing_Invoice, Invoice>(request);
                return result;
            }
        }

        public async Task<List<Invoice>> GetDebtorPendingInvoices(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _invoiceRepository
                    .Where(c => c.PolicyId == policyId && !c.IsDeleted).ToListAsync();
                var invoices = Mapper.Map<List<Invoice>>(entities);
                foreach (var invoice in invoices)
                {
                    invoice.TotalInvoiceAmount = invoice.Balance;
                    invoice.CreatedDate = invoice.InvoiceDate;
                }
                return invoices.Where(i => i.TotalInvoiceAmount > 0 && i.Balance > 0).ToList();
            }
        }

        public async Task<List<DebitOrder>> GetDebitOrderReport(int periodYear, int periodMonth, string startDate, string endDate, int industryId, int productId, int debitOrderTypeId, string accountNumber)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingReports);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var paramEndDate = (endDate != "-1") ? DateTime.Parse(endDate).ToString("yyyy/MM/dd") : endDate;
                var paramStartDate = (startDate != "-1") ? DateTime.Parse(startDate).ToString("yyyy/MM/dd") : startDate;

                var parameters = new List<SqlParameter>();
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@periodYear",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = periodYear
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@periodMonth",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = periodMonth
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@startDate",
                    SqlDbType = System.Data.SqlDbType.NVarChar,
                    Value = paramStartDate
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@endDate",
                    SqlDbType = System.Data.SqlDbType.NVarChar,
                    Value = paramEndDate
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@industryId",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = industryId
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@productId",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = productId
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@debitOrderTypeId",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = debitOrderTypeId
                });

                if (string.IsNullOrEmpty(accountNumber))
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@RMABankAccount",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = DBNull.Value
                    });
                }
                else
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@RMABankAccount",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = accountNumber
                    });
                }

                var debitOrders = await _invoiceRepository.SqlQueryAsync<DebitOrder>(
                    DatabaseConstants.DebitOrderReportStoredProcedure, parameters.ToArray());

                return debitOrders;
            }
        }

        public async Task<PagedRequestResult<UnallocatedPayments>> GetUnallocatedPaymentsPaged(PaymentDateType dateType, DateTime dateFrom, DateTime dateTo, string bankAccNumber, PagedRequest request)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            if (request == null) return new PagedRequestResult<UnallocatedPayments>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var parameters = new List<SqlParameter>();
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@DateType",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = (int)dateType
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@DateFrom",
                    SqlDbType = System.Data.SqlDbType.Date,
                    Value = dateFrom
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@DateTo",
                    SqlDbType = System.Data.SqlDbType.Date,
                    Value = dateTo
                });

                if (string.IsNullOrEmpty(request?.SearchCriteria) || request?.SearchCriteria == "null")
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@Search",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = DBNull.Value
                    });
                }
                else
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@Search",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = request.SearchCriteria
                    });
                }

                parameters.Add(new SqlParameter
                {
                    ParameterName = "@Page",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = request.Page
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@PageSize",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = request.PageSize
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@OrderBy",
                    SqlDbType = System.Data.SqlDbType.NVarChar,
                    Value = request.OrderBy
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@isAscending",
                    SqlDbType = System.Data.SqlDbType.Bit,
                    Value = request.IsAscending
                });

                if (string.IsNullOrEmpty(bankAccNumber))
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@BankAccNum",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = DBNull.Value
                    });
                }
                else
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@BankAccNum",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = bankAccNumber
                    });
                }

                parameters.Add(new SqlParameter
                {
                    ParameterName = "@recordCount",
                    SqlDbType = System.Data.SqlDbType.BigInt,
                    Direction = ParameterDirection.Output
                });

                var unallocatedPayments = await _invoiceRepository.SqlQueryAsync<UnallocatedPayments>(
                    DatabaseConstants.GetUnallocatedPaymentsMultiFilters, parameters.ToArray());

                int recordCount = 0;
                recordCount = Convert.ToInt32(parameters.FirstOrDefault(c => c.ParameterName == "@recordCount")?.Value);

                return new PagedRequestResult<UnallocatedPayments>()
                {
                    Page = request.Page,
                    PageCount = unallocatedPayments.Count,
                    RowCount = recordCount,
                    PageSize = request.PageSize,
                    Data = unallocatedPayments
                };
            }
        }

        public async Task<List<UnallocatedPayments>> GetUnallocatedPayments(PaymentDateType dateType, DateTime dateFrom, DateTime dateTo, string bankAccNumber, string search)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var parameters = new List<SqlParameter>();
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@DateType",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = (int)dateType
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@DateFrom",
                    SqlDbType = System.Data.SqlDbType.Date,
                    Value = dateFrom
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@DateTo",
                    SqlDbType = System.Data.SqlDbType.Date,
                    Value = dateTo
                });

                if (string.IsNullOrEmpty(search))
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@Search",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = DBNull.Value
                    });
                }
                else
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@Search",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = search
                    });
                }

                if (string.IsNullOrEmpty(bankAccNumber))
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@BankAccNum",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = DBNull.Value
                    });
                }
                else
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@BankAccNum",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = bankAccNumber
                    });
                }

                var unallocatedPayments = await _invoiceRepository.SqlQueryAsync<UnallocatedPayments>(
                    DatabaseConstants.GetUnallocatedPaymentsStoredProcedure, parameters.ToArray());

                return unallocatedPayments;
            }
        }

        public async Task<List<AllocatedPayment>> GetAllocatedPayments(string startDate, string endDate, int dateType, string bankAccNumber, int productId, int periodYear, int periodMonth)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var paramEndDate = (endDate != "-1") ? DateTime.Parse(endDate).ToString("yyyy/MM/dd") : endDate;
                var paramStartDate = (startDate != "-1") ? DateTime.Parse(startDate).ToString("yyyy/MM/dd") : startDate;

                var parameters = new List<SqlParameter>();
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@startDate",
                    SqlDbType = System.Data.SqlDbType.NVarChar,
                    Value = paramStartDate
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@endDate",
                    SqlDbType = System.Data.SqlDbType.NVarChar,
                    Value = paramEndDate
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@dateType",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = dateType
                });
                if (string.IsNullOrEmpty(bankAccNumber))
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@bankAccNum",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = DBNull.Value
                    });
                }
                else
                {
                    parameters.Add(new SqlParameter
                    {
                        ParameterName = "@bankAccNum",
                        SqlDbType = System.Data.SqlDbType.NVarChar,
                        IsNullable = true,
                        Value = bankAccNumber
                    });
                }
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@productId",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = productId
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@periodYear",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = periodYear
                });
                parameters.Add(new SqlParameter
                {
                    ParameterName = "@periodMonth",
                    SqlDbType = System.Data.SqlDbType.Int,
                    Value = periodMonth
                });

                var allocatedPayments = await _invoiceRepository.SqlQueryAsync<AllocatedPayment>(
                    DatabaseConstants.GetAllocatedPaymentsStoredProcedure, parameters.ToArray());

                return allocatedPayments;
            }
        }

        public async Task<List<AllocatedPayment>> GetEuropeAssistPremiums()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewPayments);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var europAssistPremiums = await _invoiceRepository.SqlQueryAsync<AllocatedPayment>(
                    DatabaseConstants.GetEuropAssistPremiumsStoredProcedure);

                return europAssistPremiums;
            }
        }

        public async Task SendGroupInvoices()
        {
            try
            {
                var allowBilling =
                    (await _configurationService.GetModuleSetting(SystemSettings.AllowBilling)).ToBoolean(false);
                if (allowBilling)
                {
                    _fromAddress =
                        await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
                    _reportServerUrl =
                        $"{await _configurationService.GetModuleSetting(SystemSettings.SSRSBaseUrl)}RMA.Reports.FinCare";
                    var invoiceDocument = await GetUriDocumentByteData(
                        new Uri($"{_reportServerUrl}/RMAFuneralInvoice{_parameters}&rs:Format=PDF"), _headerCollection);

                    var attachments = new List<MailAttachment>
                    {
                        new MailAttachment
                        {
                            AttachmentByteData = invoiceDocument,
                            FileName = "Invoice.pdf",
                            FileType = "application/pdf"
                        },
                    };

                    var emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMAFuneralInvoice));
                    using (var scope = _dbContextScopeFactory.Create())
                    {
                        var invoices = await _invoiceRepository.Where(x =>
                            x.InvoiceStatus == InvoiceStatusEnum.Pending && x.NotificationDate == null).ToListAsync();
                        foreach (var invoice in invoices)
                        {
                            await _invoiceRepository.LoadAsync(invoice, i => i.Policy);
                            var email = await _rolePlayerService.GetEmail(invoice.Policy.PolicyOwnerId);
                            var displayName = await _rolePlayerService.GetDisplayName(invoice.Policy.PolicyOwnerId);
                            if (!string.IsNullOrEmpty(email) && invoice.Policy != null)
                            {
                                await _sendEmailService.SendEmail(new SendMailRequest
                                {
                                    ItemId = invoice.InvoiceId,
                                    ItemType = "Invoice",
                                    FromAddress = _fromAddress,
                                    Recipients = email,
                                    RecipientsCC = null,
                                    Subject = $"RMA Funeral Policy Invoice: {invoice.Policy.PolicyNumber}",
                                    Body = emailBody.Replace("{0}", displayName)
                                        .Replace("{1}", invoice.Policy.PolicyNumber),
                                    IsHtml = true,
                                    Attachments = attachments.ToArray()
                                });

                                invoice.NotificationDate = DateTime.Now.ToSaDateTime();
                                _invoiceRepository.Update(invoice);
                            }
                        }

                        await scope.SaveChangesAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when getting Sending Group Invoices - Error Message {ex.Message}");
            }
        }

        public async Task SendCoidCreditNotes()
        {
            try
            {
                var allowBilling =
                    (await _configurationService.GetModuleSetting(SystemSettings.AllowBilling)).ToBoolean(false);
                if (allowBilling)
                {
                    List<TransactionDocumentSendRequest> transactionDocumentSendRequests = new List<TransactionDocumentSendRequest>();
                    _fromAddress =
                        await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);

                    var emailBody = creditNoteMessageBody;

                    var sqlParameters = new List<SqlParameter>();
                    sqlParameters.Add(new SqlParameter
                    {
                        ParameterName = "@batchSize",
                        SqlDbType = SqlDbType.Int,
                        Value = 100
                    });
                    sqlParameters.Add(new SqlParameter
                    {
                        ParameterName = "@industryId",
                        SqlDbType = SqlDbType.VarChar,
                        Value = "0"
                    });
                    sqlParameters.Add(new SqlParameter
                    {
                        ParameterName = "@transactionTypesCommaSeparatedString",
                        SqlDbType = SqlDbType.VarChar,
                        Value = ((int)TransactionTypeEnum.CreditNote).ToString()
                    });

                    using (var scope = _dbContextScopeFactory.CreateReadOnly())
                    {
                        transactionDocumentSendRequests = await _finPayeeRepository.SqlQueryAsync<TransactionDocumentSendRequest>(DatabaseConstants.GetInvoicesAndCreditNotesReadyForEmailSending, sqlParameters.ToArray());
                    }

                    foreach (var transactionDocumentSendRequest in transactionDocumentSendRequests)
                    {
                        var attachments = new List<MailAttachment>();

                        using (var scope = _dbContextScopeFactory.Create())
                        {
                            if (!transactionDocumentSendRequest.InvoiceId.HasValue)
                            {
                                continue;
                            }

                            var parameters = $"&transactionId={transactionDocumentSendRequest.TransactionId}&rs:Command=ClearSession";
                            var docBytes = await GetUriDocumentByteData(new Uri($"{finCareReportServerUrl}/{"RMACreditNote"}{parameters}&rs:Format=PDF"), _headerCollection);

                            var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = docBytes };
                            var response = await _documentGeneratorService.PasswordProtectPdf(transactionDocumentSendRequest.FinPayeNumber, pdfDocumentPass, fileEncryptRequest);

                            var attachment = new MailAttachment { AttachmentByteData = response.encryptedDocumentBytes, FileName = "CreditNote.pdf", FileType = "application/pdf" };
                            attachments.Add(attachment);

                            var invoice = await _invoiceRepository.Where(x => x.InvoiceId == transactionDocumentSendRequest.InvoiceId.Value).FirstOrDefaultAsync();

                            InvoiceTypeEnum invoiceType = await GetInvoiceTypeByInvoiceId(transactionDocumentSendRequest.InvoiceId.Value);
                            if (invoiceType != InvoiceTypeEnum.Coid) continue;

                            if (!string.IsNullOrEmpty(transactionDocumentSendRequest.ToAddress) && !string.IsNullOrEmpty(transactionDocumentSendRequest.PolicyNumber))
                            {
                                await _sendEmailService.SendEmail(new SendMailRequest
                                {
                                    ItemId = transactionDocumentSendRequest.InvoiceId,
                                    ItemType = "Invoice",
                                    FromAddress = _fromAddress,
                                    Recipients = transactionDocumentSendRequest.ToAddress,
                                    RecipientsCC = null,
                                    Subject = $"RMA Credit Note: {transactionDocumentSendRequest.DocumentNumber}",
                                    Body = emailBody.Replace("{0}", transactionDocumentSendRequest.DisplayName).Replace("{1}", transactionDocumentSendRequest.PolicyNumber),
                                    IsHtml = true,
                                    Attachments = attachments.ToArray()
                                });

                                invoice.NotificationDate = DateTime.Now.ToSaDateTime();
                                _invoiceRepository.Update(invoice);
                                await scope.SaveChangesAsync();

                                var text = (!string.IsNullOrEmpty(transactionDocumentSendRequest?.DocumentNumber)) ? $"Credit note number {transactionDocumentSendRequest?.DocumentNumber} emailed to {transactionDocumentSendRequest?.ToAddress}" : $"Credit note emailed to client";
                                var note = new BillingNote
                                {
                                    ItemId = transactionDocumentSendRequest.InvoiceId.Value,
                                    ItemType = BillingNoteTypeEnum.Email.GetDescription(),
                                    Text = text
                                };
                                await _billingService.AddBillingNote(note);
                            }
                        }

                    }

                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Sending Coid Credit Notes - Error Message {ex.Message}");
            }
        }

        public async Task SendCoidInvoices()
        {
            try
            {
                var allowBilling =
                    (await _configurationService.GetModuleSetting(SystemSettings.AllowBilling)).ToBoolean(false);
                if (allowBilling)
                {
                    _fromAddress =
                        await _configurationService.GetModuleSetting(SystemSettings.PolicyManagerEmailNotificationSender);
                    List<TransactionDocumentSendRequest> transactionDocumentSendRequests = new List<TransactionDocumentSendRequest>();

                    var emailBody = (await _configurationService.GetModuleSetting(SystemSettings.RMACoidInvoice));

                    var sqlParameters = new List<SqlParameter>();
                    sqlParameters.Add(new SqlParameter
                    {
                        ParameterName = "@batchSize",
                        SqlDbType = SqlDbType.Int,
                        Value = 100
                    });
                    sqlParameters.Add(new SqlParameter
                    {
                        ParameterName = "@industryId",
                        SqlDbType = SqlDbType.VarChar,
                        Value = "0"
                    });
                    sqlParameters.Add(new SqlParameter
                    {
                        ParameterName = "@transactionTypesCommaSeparatedString",
                        SqlDbType = SqlDbType.VarChar,
                        Value = ((int)TransactionTypeEnum.Invoice).ToString()
                    });

                    using (var scope = _dbContextScopeFactory.CreateReadOnly())
                    {
                        transactionDocumentSendRequests = await _finPayeeRepository.SqlQueryAsync<TransactionDocumentSendRequest>(DatabaseConstants.GetInvoicesAndCreditNotesReadyForEmailSending, sqlParameters.ToArray());
                    }

                    foreach (var transactionDocumentSendRequest in transactionDocumentSendRequests)
                    {
                        var attachments = new List<MailAttachment>();

                        using (var scope = _dbContextScopeFactory.Create())
                        {
                            if (!transactionDocumentSendRequest.InvoiceId.HasValue)
                            {
                                continue;
                            }

                            var parameters = $"&invoiceId={transactionDocumentSendRequest.InvoiceId.Value}&rs:Command=ClearSession";
                            var docBytes = await GetUriDocumentByteData(new Uri($"{finCareReportServerUrl}/{"RMACoidInvoice"}{parameters}&rs:Format=PDF"), _headerCollection);

                            var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = docBytes };
                            var response = await _documentGeneratorService.PasswordProtectPdf(transactionDocumentSendRequest.FinPayeNumber, pdfDocumentPass, fileEncryptRequest);

                            var attachment = new MailAttachment { AttachmentByteData = response.encryptedDocumentBytes, FileName = "Invoice.pdf", FileType = "application/pdf" };
                            attachments.Add(attachment);

                            var invoice = await _invoiceRepository.Where(x => x.InvoiceId == transactionDocumentSendRequest.InvoiceId.Value).FirstOrDefaultAsync();

                            InvoiceTypeEnum invoiceType = await GetInvoiceTypeByInvoiceId(transactionDocumentSendRequest.InvoiceId.Value);
                            if (invoiceType != InvoiceTypeEnum.Coid) continue;

                            if (!string.IsNullOrEmpty(transactionDocumentSendRequest.ToAddress) && !string.IsNullOrEmpty(transactionDocumentSendRequest.PolicyNumber))
                            {
                                await _sendEmailService.SendEmail(new SendMailRequest
                                {
                                    ItemId = transactionDocumentSendRequest.InvoiceId,
                                    ItemType = "Invoice",
                                    FromAddress = _fromAddress,
                                    Recipients = transactionDocumentSendRequest.ToAddress,
                                    RecipientsCC = null,
                                    Subject = $"RMA Coid Policy Invoice: {transactionDocumentSendRequest.DocumentNumber}",
                                    Body = emailBody.Replace("{0}", transactionDocumentSendRequest.DisplayName).Replace("{1}", transactionDocumentSendRequest.PolicyNumber),
                                    IsHtml = true,
                                    Attachments = attachments.ToArray()
                                });

                                invoice.NotificationDate = DateTime.Now.ToSaDateTime();
                                _invoiceRepository.Update(invoice);
                                await scope.SaveChangesAsync();

                                var text = (!string.IsNullOrEmpty(transactionDocumentSendRequest?.DocumentNumber)) ? $"Invoice number {transactionDocumentSendRequest?.DocumentNumber} emailed to {transactionDocumentSendRequest?.ToAddress}" : $"Invoice emailed to client"; ;
                                var note = new BillingNote
                                {
                                    ItemId = transactionDocumentSendRequest.InvoiceId.Value,
                                    ItemType = BillingNoteTypeEnum.Email.GetDescription(),
                                    Text = text
                                };
                                await _billingService.AddBillingNote(note);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Sending Coid Invoices - Error Message {ex.Message}");
            }
        }

        public async Task<List<SearchAccountResults>> SearchDebtors(string query)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var accountSearchResults = await _invoiceRepository.SqlQueryAsync<SearchAccountResults>(
                    DatabaseConstants.SearchAccountsStoredProcedure,
                    new SqlParameter("FilterType", 1),
                    new SqlParameter("Filter", query),
                    new SqlParameter("ShowActive", true));
                var results = new List<SearchAccountResults>();
                if (accountSearchResults.Count > 0)
                {
                    foreach (var accountSearchResult in accountSearchResults)
                    {
                        if (results.Any(x => x.FinPayeNumber == accountSearchResult.FinPayeNumber))
                        {
                            continue;
                        }

                        results.Add(accountSearchResult);
                    }
                }

                return results;
            }
        }

        public async Task<List<Invoice>> GetPendingInvoicesByPolicy(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var results = new List<Invoice>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoices = await _invoiceRepository
                    .Where(a => a.InvoiceStatus == InvoiceStatusEnum.Pending && a.PolicyId == policyId)
                    .ToListAsync();

                foreach (var invoice in invoices)
                {
                    if (invoice.TotalInvoiceAmount > 0)
                    {
                        results.Add(Mapper.Map<Invoice>(invoice));
                    }
                }
            }

            return results;
        }

        public async Task<List<InvoicePaymentAllocation>> GetUnPaidInvoicesByPolicy(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoicePaymentAllocations = new List<InvoicePaymentAllocation>();

                var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policyId);
                if (policy == null)
                    return invoicePaymentAllocations;

                var invoices = await _invoiceRepository.SqlQueryAsync<Invoice>(DatabaseConstants.GetUnsettledInvoices, new SqlParameter("rolePlayerId", policy.PolicyPayeeId));

                var finPayeeNumber = (await _rolePlayerService.GetFinPayee(policy.PolicyPayeeId)).FinPayeNumber;

                foreach (var invoice in invoices)
                {
                    if (invoice == null) continue;

                    var allocation = new InvoicePaymentAllocation()
                    {
                        PolicyNumber = policy.PolicyNumber,
                        InvoiceId = invoice.InvoiceId,
                        InvoiceStatus = invoice.InvoiceStatus,
                        CollectionDate = invoice.CollectionDate,
                        InvoiceDate = invoice.InvoiceDate,
                        TotalInvoiceAmount = invoice.TotalInvoiceAmount,
                        InvoiceNumber = invoice.InvoiceNumber,
                        AmountOutstanding = invoice.Balance,
                        DisplayName = finPayeeNumber
                    };

                    invoicePaymentAllocations.Add(allocation);
                }

                return invoicePaymentAllocations;
            }
        }

        public async Task<List<Invoice>> GenerateContinuationInvoices(int policyId, DateTime effectiveDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);
            var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policyId);
            var invoices = new List<Invoice>();
            var policyPauseDate = policy.PolicyPauseDate;

            var start = (DateTime)policyPauseDate;
            var end = effectiveDate;

            end = new DateTime(end.Year, end.Month, DateTime.DaysInMonth(end.Year, end.Month));

            var dates = Enumerable.Range(0, Int32.MaxValue)
                                 .Select(e => start.AddMonths(e))
                                 .TakeWhile(e => e <= end)
                                 .Select(e => e);

            var previouslyGeneratedInvoices = new List<billing_Invoice>();
            using (var scope = _dbContextScopeFactory.Create())
            {
                var defaultCollectionDate = new DateTime(0001, 1, 1);
                previouslyGeneratedInvoices = await _invoiceRepository
                    .Where(c => c.CollectionDate == defaultCollectionDate
                    && c.InvoiceStatus == InvoiceStatusEnum.Pending
                && c.PolicyId == policyId).ToListAsync();
            }

            foreach (var date in dates)
            {
                var firstDay = new DateTime(date.Year, date.Month, 1);
                if (!previouslyGeneratedInvoices.Any(c => c.InvoiceDate == firstDay))
                {
                    var invoice = await GenerateInvoiceByPolicyAndMonth(policy, date, string.Empty, InvoiceStatusEnum.Pending, SourceModuleEnum.FinCare, SourceProcessEnum.ReInstate);
                    invoices.Add(invoice);
                }
            }
            return invoices;
        }

        public async Task<List<Invoice>> GenerateReinstatementInvoices(int policyId, DateTime effectiveDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policyId);
            if (policy.LastLapsedDate == null) return new List<Invoice>();

            var invoices = new List<Invoice>();

            List<billing_Invoice> previouslyGeneratedInvoices;
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var defaultCollectionDate = new DateTime(0001, 1, 1);
                previouslyGeneratedInvoices = await _invoiceRepository.Where(c => c.CollectionDate == defaultCollectionDate && c.InvoiceStatus == InvoiceStatusEnum.Pending && c.PolicyId == policyId).ToListAsync();
            }

            var firstDay = new DateTime(effectiveDate.Year, effectiveDate.Month, 1);
            if (!previouslyGeneratedInvoices.Any(c => c.InvoiceDate == firstDay))
            {
                var invoice = await GenerateInvoiceByPolicyAndMonth(policy, effectiveDate, string.Empty, InvoiceStatusEnum.Pending, SourceModuleEnum.ClientCare, SourceProcessEnum.Maintenance);
                invoices.Add(invoice);
            }
            return invoices;
        }

        public async Task<List<Invoice>> GetPaidInvoicesByPolicyId(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var results = new List<Invoice>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoices = await _invoiceRepository
                    .Where(c => c.InvoiceStatus == InvoiceStatusEnum.Paid && c.PolicyId == policyId)
                    .ToListAsync();
                if (invoices.Count > 0)
                {
                    results = Mapper.Map<List<Invoice>>(invoices);
                }
            }

            return results;
        }

        public async Task<List<StatementAnalysis>> BankStatementAnalysis()
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewBillingReports);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var analysis = await _invoiceRepository.SqlQueryAsync<StatementAnalysis>(
                    DatabaseConstants.BankStatementAnalysisStoredProcedure);

                return analysis;
            }
        }

        public async Task<decimal> GetInvoiceBalance(int invoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoice = await _invoiceRepository.Where(i => i.InvoiceId == invoiceId)
                                .SingleAsync();

                var invoiceTran = await _transactionRepository.Where(t => t.InvoiceId == invoiceId &&
                                            t.TransactionType == TransactionTypeEnum.Invoice)
                                .SingleAsync();

                var reversal = await _transactionRepository
                                .Where(t => t.LinkedTransactionId == invoiceTran.TransactionId && t.TransactionType == TransactionTypeEnum.InvoiceReversal)
                                .FirstOrDefaultAsync();

                if (reversal != null)
                    return 0m;

                var allocations = await _invoiceAllocationRepository.Where(a => a.InvoiceId == invoiceId && !a.IsDeleted)
                                    .ToListAsync();

                foreach (var alloc in allocations)
                {
                    var debits = await _transactionRepository.Where(d => d.LinkedTransactionId == alloc.TransactionId)
                                 .ToListAsync();

                    foreach (var debit in debits)
                    {
                        if (debit.TransactionType != TransactionTypeEnum.DebitReallocation &&
                            debit.TransactionType != TransactionTypeEnum.Refund &&
                            debit.TransactionType != TransactionTypeEnum.InterDebtorTransfer)
                        {
                            var credit = await _transactionRepository .SingleAsync(c => c.TransactionId == alloc.TransactionId);

                            if (credit.Amount == debit.Amount)
                                alloc.Amount -= debit.Amount;
                        }
                    }
                }

                var balance = invoice.TotalInvoiceAmount - allocations.Sum(a => a.Amount);

                if (balance < 0) balance = 0m;

                if (balance > invoice.TotalInvoiceAmount)
                    balance = invoice.TotalInvoiceAmount;

                return balance;
            }
        }


        public async Task<List<Invoice>> GetUnsettledInvoices(int rolePlayerId, List<int> policyIds)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var results = new List<Invoice>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                List<Invoice> invoices = new List<Invoice>();
                if (policyIds == null || policyIds?.Count == 0)
                {
                    invoices = await _invoiceRepository.SqlQueryAsync<Invoice>(DatabaseConstants.GetUnsettledInvoices, new SqlParameter("rolePlayerId", rolePlayerId));
                }
                else
                {
                    // fetch at policy level
                    var policyIdsString = string.Join("|", policyIds.ToArray());
                    invoices = await _invoiceRepository.SqlQueryAsync<Invoice>(DatabaseConstants.GetUnsettledInvoicesForPolicies, new SqlParameter("policyIds", policyIdsString));
                }

                foreach (var invoice in invoices)
                {
                    if (invoice.TotalInvoiceAmount > 0)
                    {
                        results.Add(Mapper.Map<Invoice>(invoice));
                    }
                }
            }

            return results;
        }

        public async Task<Invoice> GeneratePartialInvoice(RolePlayerPolicy policy, DateTime invoiceDate, decimal invoiceAmount, string reason, InvoiceStatusEnum invoiceStatusEnum, SourceModuleEnum sourceModuleEnum, SourceProcessEnum sourceProcessEnum)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);
            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
            if (policy != null)
                using (var scope = _dbContextScopeFactory.Create())
                {
                    int collectionDay = policy.FirstInstallmentDate.Day;
                    if (invoiceDate.Month == 12 && policy.DecemberInstallmentDayOfMonth.HasValue)
                        collectionDay = (int)policy?.DecemberInstallmentDayOfMonth;

                    var invoice = new billing_Invoice
                    {
                        InvoiceStatus = invoiceStatusEnum,
                        PolicyId = policy.PolicyId,
                        InvoiceDate = new DateTime(invoiceDate.Year, invoiceDate.Month, 1),
                        TotalInvoiceAmount = invoiceAmount,
                        InvoiceNumber = string.Empty,
                        CollectionDate = new DateTime(invoiceDate.Year, invoiceDate.Month, collectionDay),
                        SourceModule = sourceModuleEnum,
                        SourceProcess = sourceProcessEnum,
                        Reason = reason
                    };

                    var lineItem = new billing_InvoiceLineItem { Amount = policy.InstallmentPremium, PolicyId = policy.PolicyId, CreatedBy = RmaIdentity.Email, CreatedDate = DateTime.Now };

                    if (invoiceStatusEnum != InvoiceStatusEnum.Queued)
                    {
                        var transaction = new billing_Transaction
                        {
                            RolePlayerId = policy.PolicyPayeeId,
                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                            Amount = policy.InstallmentPremium,
                            TransactionDate = postingDate,
                            PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                            TransactionType = TransactionTypeEnum.Invoice
                        };

                        invoice.Transactions.Add(transaction);
                    }

                    invoice.InvoiceLineItems.Add(lineItem);

                    var result = _invoiceRepository.Create(invoice);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return Mapper.Map<Invoice>(result);
                }
            return null;
        }

        public async Task<Invoice> GenerateInvoiceByPolicyAndMonth(RolePlayerPolicy policy, DateTime invoiceDate, string reason, InvoiceStatusEnum invoiceStatusEnum, SourceModuleEnum sourceModuleEnum, SourceProcessEnum sourceProcessEnum)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);

            if (policy == null)
                return null; // TODO: check why we're even returning a null... Need refactoring as returning a null is a "no no"

            using (var scope = _dbContextScopeFactory.Create())
            {
                int collectionDay = policy.FirstInstallmentDate.Day;
                if (invoiceDate.Month == 12 && policy.DecemberInstallmentDayOfMonth.HasValue)
                    collectionDay = (int)policy?.DecemberInstallmentDayOfMonth;

                var invoice = new billing_Invoice
                {
                    InvoiceStatus = invoiceStatusEnum,
                    PolicyId = policy.PolicyId,
                    InvoiceDate = new DateTime(invoiceDate.Year, invoiceDate.Month, 1),
                    TotalInvoiceAmount = policy.InstallmentPremium,
                    InvoiceNumber = string.Empty,
                    CollectionDate = new DateTime(invoiceDate.Year, invoiceDate.Month, collectionDay),
                    SourceModule = sourceModuleEnum,
                    SourceProcess = sourceProcessEnum,
                    Reason = reason
                };

                var lineItem = new billing_InvoiceLineItem { Amount = policy.InstallmentPremium, PolicyId = policy.PolicyId, CreatedBy = RmaIdentity.Email, CreatedDate = DateTime.Now };

                if (invoiceStatusEnum != InvoiceStatusEnum.Queued)
                {
                    var transaction = new billing_Transaction
                    {
                        RolePlayerId = policy.PolicyPayeeId,
                        TransactionTypeLinkId = (int)TransactionActionType.Debit,
                        Amount = policy.InstallmentPremium,
                        TransactionDate = postingDate,
                        PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                        TransactionType = TransactionTypeEnum.Invoice
                    };

                    invoice.Transactions.Add(transaction);
                }

                invoice.InvoiceLineItems.Add(lineItem);

                var result = _invoiceRepository.Create(invoice);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return Mapper.Map<Invoice>(result);
            }
        }

        public async Task<List<Invoice>> GetPartiallyAndUnpaidInvoicesByPolicyId(int policyId)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _invoiceRepository
                    .Where(c => c.PolicyId == policyId
                                && (c.InvoiceStatus == InvoiceStatusEnum.Partially
                                 || c.InvoiceStatus == InvoiceStatusEnum.Unpaid))
                    .ToListAsync();
                var results = Mapper.Map<List<Invoice>>(entities);
                return results.Where(i => i.Balance > 0).ToList();
            }
        }

        public async Task<decimal> GetTotalPendingRaisedForReinstatement(int policyId, DateTime effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _invoiceRepository.Where(s => s.PolicyId == policyId).ToListAsync();
                var invoices = Mapper.Map<List<Invoice>>(entities);
                return invoices.Sum(i => i.Balance);
            }
        }

        public async Task<decimal> GetTotalPendingRaisedForContinuation(int policyId, DateTime effectiveDate)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policyId);

                var policyPauseDate = policy.PolicyPauseDate;
                var start = (DateTime)policyPauseDate;
                var end = effectiveDate;

                end = new DateTime(end.Year, end.Month, DateTime.DaysInMonth(end.Year, end.Month));

                var dates = Enumerable.Range(0, Int32.MaxValue)
                                     .Select(e => start.AddMonths(e))
                                     .TakeWhile(e => e <= end)
                                     .Select(e => e).ToList();
                var installment = policy.InstallmentPremium;
                return dates.Count > 0 ? dates.Count * installment : 0;
            }
        }

        public async Task<int> AddInvoiceItem(Invoice invoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            Contract.Requires(invoice != null);
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = Mapper.Map<billing_Invoice>(invoice);
                _invoiceRepository.Create(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
                return entity.InvoiceId;
            }
        }

        public async Task GenerateInvoicesForPeriod(DateTime periodStartDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var policies = await _rolePlayerPolicyService.GetPoliciesActivatedBeforePeriod(periodStartDate);

                foreach (var policy in policies)
                {
                    var invoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceDate == periodStartDate && i.PolicyId == policy.PolicyId);
                    if (invoice != null) continue;
                    var newInvoice = new billing_Invoice
                    {
                        PolicyId = policy.PolicyId,
                        CollectionDate = periodStartDate,
                        TotalInvoiceAmount = policy.InstallmentPremium,
                        InvoiceStatus = InvoiceStatusEnum.Pending,
                        InvoiceNumber = await _documentGeneratorService.GenerateDocumentNumber(DocumentNumberTypeEnum.Invoice, string.Empty),
                        InvoiceDate = periodStartDate
                    };
                    newInvoice.InvoiceLineItems.Add(new billing_InvoiceLineItem { Amount = newInvoice.TotalInvoiceAmount });
                    newInvoice.Transactions.Add(new billing_Transaction()
                    {
                        Amount = policy.InstallmentPremium,
                        RolePlayerId = policy.PolicyPayeeId,
                        TransactionDate = periodStartDate,
                        TransactionType = TransactionTypeEnum.Invoice,
                        BankReference = policy.PolicyNumber
                    });
                    _invoiceRepository.Create(newInvoice);
                }

                await scope.SaveChangesAsync();
            }
        }

        public async Task<List<Invoice>> GetUnpaidInvoicesForPeriod(DateTime periodStartDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var results = new List<Invoice>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var entities = await _invoiceRepository.Where(a => a.InvoiceStatus != InvoiceStatusEnum.Paid && a.TotalInvoiceAmount > 0 &&
                 periodStartDate.Month == a.InvoiceDate.Month && periodStartDate.Year == a.InvoiceDate.Year).ToListAsync();

                foreach (var entity in entities)
                {
                    var invoice = Mapper.Map<Invoice>(entity);
                    if (invoice.Balance > 0)
                    {
                        results.Add(invoice);
                    }
                }
            }

            return results;
        }

        public async Task MonitorDuplicateInvoices()
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var duplicateInvoices = await _invoiceRepository.SqlQueryAsync<DuplicateInvoiceSearchResult>(DatabaseConstants.GetDuplicateInvoices);
                    foreach (var duplicateInvoice in duplicateInvoices)
                    {
                        var transaction = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == duplicateInvoice.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice);
                        var invoice = new Invoice
                        {
                            InvoiceId = duplicateInvoice.InvoiceId,
                            CreatedDate = duplicateInvoice.CreatedDate,
                            InvoiceDate = duplicateInvoice.InvoiceDate,
                            TotalInvoiceAmount = duplicateInvoice.Amount,
                            PolicyId = duplicateInvoice.PolicyId,
                            InvoiceStatus = InvoiceStatusEnum.Pending
                        };
                        await _transactionCreatorService.CreateCreditNoteForInvoice(transaction.RolePlayerId, duplicateInvoice.Amount, "Duplicate Invoice Settlement",
                            invoice);
                        await ModifyInvoiceStatus(duplicateInvoice.InvoiceId, InvoiceStatusEnum.Paid);
                    }
                    await scope.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Monitoring Duplicate Invoices - Error Message {ex.Message}");
            }
        }

        public async Task<bool> ReverseAllocation(int invoiceAllocationId)
        {
            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _invoiceAllocationRepository.SingleAsync(ia => ia.InvoiceAllocationId == invoiceAllocationId);
                entity.IsDeleted = true;
                _invoiceAllocationRepository.Update(entity);
                await scope.SaveChangesAsync();
                return true;
            }
        }

        public async Task MonitorCancelledPolicyInvoices()
        {
            try
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    var cancelledInvoices = await _invoiceRepository.SqlQueryAsync<CancelledInvoiceSearchResult>(DatabaseConstants.GetCancelledPolicyOutstandingInvoices);
                    foreach (var cancelledInvoice in cancelledInvoices)
                    {
                        var transaction = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == cancelledInvoice.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice);
                        var invoice = new Invoice
                        {
                            InvoiceId = cancelledInvoice.InvoiceId,
                            CreatedDate = cancelledInvoice.CreatedDate,
                            InvoiceDate = cancelledInvoice.InvoiceDate,
                            TotalInvoiceAmount = cancelledInvoice.Balance,
                            PolicyId = cancelledInvoice.PolicyId,
                            InvoiceStatus = InvoiceStatusEnum.Pending
                        };
                        await _transactionCreatorService.CreateCreditNoteForInvoice(transaction.RolePlayerId, cancelledInvoice.Amount, CreditNoteTypeEnum.CancellationCreditNote.GetDescription(),
                            invoice);
                        await ModifyInvoiceStatus(cancelledInvoice.InvoiceId, InvoiceStatusEnum.Paid);
                    }
                    await scope.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Monitoring Cancelled Policy Invoices - Error Message {ex.Message}");
            }
        }

        public async Task<PagedRequestResult<Invoice>> GetPolicyInvoices(int policyId, PagedRequest pagedRequest)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            using (_dbContextScopeFactory.Create())
            {
                var invoices = await _invoiceRepository.Where(inv => inv.PolicyId == policyId).
                      OrderBy(i => i.InvoiceDate).ToPagedResult<billing_Invoice, Invoice>(pagedRequest);

                return invoices;
            }
        }

        public async Task<InvoiceTypeEnum> GetInvoiceTypeByInvoiceId(int invoiceId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoice = await _invoiceRepository.SingleAsync(inv => inv.InvoiceId == invoiceId, $"Could not find invoice with id {invoiceId}");
                var coidProductId = await _configurationService.GetModuleSetting(SystemSettings.COIDProductId);
                var productOptionLinkedToPolicy = await _rolePlayerPolicyService.GetPolicyProductOption(invoice.PolicyId.Value);
                return productOptionLinkedToPolicy.ProductId == coidProductId.ToInt() ? InvoiceTypeEnum.Coid : InvoiceTypeEnum.Funeral;
            }
        }

        public async Task RaiseInterestOnOverDueInvoices()
        {
            try
            {
                using (_dbContextScopeFactory.Create())
                {
                    await _invoiceRepository.ExecuteSqlCommandAsync(DatabaseConstants.RaiseInterestForUnpaidInvoices);
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error occurred trying to raise interest > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
            }
        }

        public async Task<PagedRequestResult<Invoice>> SearchDebtorInvoices(int rolePlayerId, int statusId, PagedRequest pagedRequest)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var searchString = string.Empty;
            if (!string.IsNullOrEmpty(pagedRequest?.SearchCriteria))
                searchString = pagedRequest?.SearchCriteria;
            var policies = await _rolePlayerPolicyService.GetPoliciesByPolicyPayeeIdNoRefData(rolePlayerId);

            var policyIds = new List<int>();
            var policyNumberUsed = false;

            var invoices = new PagedRequestResult<Invoice>();
            if (policies != null && policies.Count > 0)
            {
                if (policies.Any(p => p.PolicyNumber == searchString))
                {
                    policyIds = policies.Where(p => p.PolicyNumber == searchString).Select(p => p.PolicyId).ToList();
                    policyNumberUsed = true;
                }
                else
                {
                    policyIds = policies.Select(p => p.PolicyId).ToList();
                }

                using (_dbContextScopeFactory.Create())
                {
                    var queryable = _invoiceRepository.Where(inv => policyIds.Contains(inv.PolicyId.Value));

                    if (searchString != "null" && !policyNumberUsed)
                        queryable = queryable.Where(inv => inv.InvoiceNumber == searchString);

                    if (statusId > 0)
                    {
                        var status = (InvoiceStatusEnum)statusId;
                        queryable = queryable.Where(inv => inv.InvoiceStatus == status);
                    }
                    invoices = await queryable.
                          OrderBy(i => i.InvoiceDate).ToPagedResult<billing_Invoice, Invoice>(pagedRequest);
                }
            }

            return invoices;
        }

        public async Task<int> GenerateGroupInvoice(int policyId, DateTime collectionDate, DateTime invoiceDate, string reason, InvoiceStatusEnum invoiceStatus, SourceModuleEnum? sourceModule, SourceProcessEnum? sourceProcess)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int invoiceId = 0;
                var parameters = new[] {
                new SqlParameter("@policyId", policyId),
                        new SqlParameter("@invoiceDate", invoiceDate),
                        new SqlParameter("@collectionDate", collectionDate),
                        new SqlParameter("@createdBy",   RmaIdentity.Email),
                        new SqlParameter("@invoiceStatusId", invoiceStatus),
                        new SqlParameter("@reason", reason),

                        new SqlParameter("@invoiceId",SqlDbType.Int){ Direction = ParameterDirection.Output}
                };

                if (sourceModule != null)
                {
                    parameters?.Append(new SqlParameter("@sourceModuleId", sourceModule.GetDescription().ToString()));
                }
                if (sourceProcess != null)
                {
                    parameters?.Append(new SqlParameter("@sourceProcessId", sourceProcess.GetDescription().ToString()));
                }

                invoiceId = Convert.ToInt32(parameters[4]?.Value);

                await _invoiceRepository.ExecuteSqlCommandAsync(DatabaseConstants.GenerateGroupInvoice,
                    parameters);

                return invoiceId;
            }
        }

        public async Task<Invoice> GenerateGroupPartialInvoice(RolePlayerPolicy policy, DateTime invoiceDate, decimal invoiceTotal, string reason, InvoiceStatusEnum invoiceStatusEnum, SourceModuleEnum sourceModuleEnum, SourceProcessEnum sourceProcessEnum, Invoice linkedInvoice)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddInvoice);

            var postingDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);

            if (policy != null && linkedInvoice != null)
            {
                using (var scope = _dbContextScopeFactory.Create())
                {
                    int collectionDay = policy.FirstInstallmentDate.Day;
                    if (invoiceDate.Month == 12 && policy.DecemberInstallmentDayOfMonth.HasValue)
                        collectionDay = (int)policy?.DecemberInstallmentDayOfMonth;

                    if (invoiceDate.Day < collectionDay)
                    {
                        collectionDay = invoiceDate.Day;
                    }

                    var invoice = new billing_Invoice
                    {
                        InvoiceStatus = invoiceStatusEnum,
                        PolicyId = policy.PolicyId,
                        InvoiceDate = new DateTime(invoiceDate.Year, invoiceDate.Month, 1),
                        TotalInvoiceAmount = invoiceTotal,
                        InvoiceNumber = string.Empty,
                        CollectionDate = new DateTime(invoiceDate.Year, invoiceDate.Month, collectionDay),
                        Reason = reason,
                        SourceModule = sourceModuleEnum,
                        SourceProcess = sourceProcessEnum,
                        LinkedInvoiceId = linkedInvoice?.InvoiceId
                    };

                    var lineItem = new billing_InvoiceLineItem
                    {
                        Amount = invoiceTotal,
                        PolicyId = policy.PolicyId,
                        CreatedBy = RmaIdentity.Email,
                        CreatedDate = DateTime.Now
                    };

                    if (invoiceStatusEnum != InvoiceStatusEnum.Queued)
                    {
                        var transaction = new billing_Transaction
                        {
                            RolePlayerId = policy.PolicyPayeeId,
                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                            Amount = invoiceTotal,
                            TransactionDate = postingDate,
                            PeriodId = await GetPeriodId(PeriodStatusEnum.Current),
                            TransactionType = TransactionTypeEnum.Invoice
                        };

                        invoice.Transactions.Add(transaction);
                    }

                    invoice.InvoiceLineItems.Add(lineItem);

                    var result = _invoiceRepository.Create(invoice);
                    await scope.SaveChangesAsync().ConfigureAwait(false);
                    return Mapper.Map<Invoice>(result);
                }
            }

            // TODO: This needs to be changed as returning a null is never a good idea,
            // as it forces the caller to check for null
            return null;
        }

        public async Task<int> CreateCreditNoteForInvoice(int rolePlayerId, decimal amount, string reason, Invoice invoice, InvoiceStatusEnum invoiceStatusEnum, SourceModuleEnum sourceModuleEnum, SourceProcessEnum sourceProcessEnum)
        {
            if (invoice == null)
                return 0;

            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.AddCreditNote);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var tran = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == invoice.InvoiceId && t.TransactionType == TransactionTypeEnum.Invoice);

                await _transactionCreatorService.CreateCreditNoteForInvoice(tran.RolePlayerId, Math.Abs(tran.Amount), reason,
                    invoice);

                await ModifyCreditNoteInvoiceStatusAndSource(invoice.InvoiceId, invoiceStatusEnum, sourceModuleEnum, sourceProcessEnum);
            }
            return invoice.InvoiceId;
        }

        private async Task SettleInvoicesForInceptionDateForwardMovement(RolePlayerPolicy policy)
        {
            var claimsExistAgainstPolicy = await _rolePlayerPolicyService.CheckNoClaimsAgainstPolicy(policy.PolicyId);
            if (!claimsExistAgainstPolicy)
            {
                var invoices = await _transactionCreatorService.GetPolicyInvoices(policy.PolicyId);
                if (invoices.Count > 0)
                {
                    foreach (var invoice in invoices)
                    {
                        await _transactionCreatorService.CreateCreditNoteForInvoice(policy.PolicyPayeeId, invoice.TotalInvoiceAmount, CreditNoteTypeEnum.PolicyInceptionChanges.GetDescription(), invoice);
                    }
                }
            }
        }

        public async Task CreatePolicyCancellationInvoices(BillingPolicyChangeDetail policyChangeDetails, RolePlayerPolicy policy, InvoiceStatusEnum invoiceStatus, SourceModuleEnum sourceModule, SourceProcessEnum sourceProcess)
        {
            Contract.Requires(policyChangeDetails != null);
            Contract.Requires(policy != null);
            if ((bool)policyChangeDetails.IsStillWithinCoolingOffPeriod)
            {
                await ProcessesCancelledPolicyWithinCoolingOffPeriod(policy, (bool)policyChangeDetails.ClaimsAgainstPolicy, invoiceStatus, sourceModule, sourceProcess);
            }
            else
            {
                await ProcessesCancelledPolicyOutsideCoolingOffPeriod(policy, invoiceStatus, sourceModule, sourceProcess);
            }
        }

        private async Task ProcessesCancelledPolicyWithinCoolingOffPeriod(RolePlayerPolicy policy, bool claimsExistAgainstPolicy, InvoiceStatusEnum invoiceStatus, SourceModuleEnum sourceModule, SourceProcessEnum sourceProcess)
        {
            if (!claimsExistAgainstPolicy)
            {
                if (await _configurationService.IsFeatureFlagSettingEnabled(BulkCreditNoteForInvoice))
                {
                    await _transactionCreatorService.CreateBulkCreditNoteForInvoice(policy.PolicyId, policy.PolicyPayeeId);
                }
                else
                {
                    var invoices = await _transactionCreatorService.GetPolicyInvoices(policy.PolicyId);

                    if (invoices.Count > 0)
                    {
                        foreach (var invoice in invoices)
                        {

                            await CreateCreditNoteForInvoice(policy.PolicyPayeeId, invoice.TotalInvoiceAmount, CreditNoteTypeEnum.CancellationCreditNote.GetDescription(), invoice, invoiceStatus, sourceModule, sourceProcess);
                        }
                    }
                }
            }
        }

        private async Task ProcessesCancelledPolicyOutsideCoolingOffPeriod(RolePlayerPolicy policy, InvoiceStatusEnum invoiceStatus, SourceModuleEnum sourceModule, SourceProcessEnum sourceProcess)
        {
            List<Invoice> invoices;
            if (policy.PaymentFrequency == PaymentFrequencyEnum.Annually)
            {
                invoices = await _transactionCreatorService.GetLastRaisedInvoice(policy.PolicyId);
            }
            else
            {
                invoices = await _transactionCreatorService.GetInvoicesInSpecificDateRange(policy.PolicyId, (DateTime)policy.CancellationDate, DateTimeHelper.SaNow);
            }

            var totalInvoiceAllocation = 0.00m;

            if (policy.PaymentFrequency != PaymentFrequencyEnum.Annually)
            {
                foreach (var invoice in invoices)
                {
                    var invoiceAllocation = invoice.TotalInvoiceAmount - invoice.Balance;
                    totalInvoiceAllocation += invoiceAllocation;
                }
            }

            if (invoices.Count > 0)
            {
                foreach (var invoice in invoices)
                {
                    await CreateCreditNoteForInvoice(policy.PolicyPayeeId, invoice.TotalInvoiceAmount, CreditNoteTypeEnum.CancellationCreditNote.GetDescription(), invoice, invoiceStatus, sourceModule, sourceProcess);
                }
            }
        }

        private async Task<decimal> CalculateAmountForMonthsEnjoyedCover(DateTime cancellationDate, DateTime policyInceptionDate, decimal installmentPremium)
        {
            var monthsEnjoyedCover = ((cancellationDate.Year - policyInceptionDate.Year) * 12) + cancellationDate.Month - policyInceptionDate.Month;
            var monthsEnjoyedCoveredPremiums = monthsEnjoyedCover * (installmentPremium / 12);
            return await Task.FromResult(monthsEnjoyedCoveredPremiums);
        }

        public async Task<string> CreateCreditNoteReferenceNumber()
        {
            return await _documentNumberService.GenerateCreditNoteDocumentNumber();
        }

        public async Task RaiseInterestForUnpaidInvoicesForDefaultedTerms()
        {
            using (_dbContextScopeFactory.Create())
            {
                await _invoiceRepository.ExecuteSqlCommandAsync(DatabaseConstants.RaiseInterestForUnpaidInvoicesForDefaultedTerms);
            }
        }

        public async Task<bool> GenerateAdhocInvoice(int policyId, decimal amount, int monthNumber)
        {
            return await Task.FromResult(true);
        }

        public async Task<string> CreateDebitNoteReferenceNumber()
        {
            return await _documentNumberService.GenerateDebitNoteDocumentNumber();
        }

        public async Task<PagedRequestResult<Invoice>> SearchRolePlayerInvoices(int rolePlayerId, int invoiceStatusId, PagedRequest pagedRequest)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                Contract.Requires(pagedRequest != null);

                var invoiceStatusFilters = invoiceStatusId > 0 ? new List<InvoiceStatusEnum> { (InvoiceStatusEnum)invoiceStatusId } : Enum.GetValues(typeof(InvoiceStatusEnum)).Cast<InvoiceStatusEnum>().ToList();

                if (invoiceStatusFilters.Count == 1 && (invoiceStatusFilters[0] == InvoiceStatusEnum.Unpaid || invoiceStatusFilters[0] == InvoiceStatusEnum.Partially))
                {
                    invoiceStatusFilters = new List<InvoiceStatusEnum> { InvoiceStatusEnum.Paid, InvoiceStatusEnum.Partially };
                }

                var invoices = new PagedRequestResult<billing_Invoice>();

                if (rolePlayerId > 0)
                {
                    invoices = await (from invoice in _invoiceRepository
                                      where invoice.Policy.PolicyOwnerId == rolePlayerId &&
                                      invoiceStatusFilters.Contains(invoice.InvoiceStatus)
                                      select invoice).ToPagedResult(pagedRequest);
                }

                var mappedInvoices = Mapper.Map<List<Invoice>>(invoices.Data);

                return new PagedRequestResult<Invoice>
                {
                    Data = mappedInvoices,
                    RowCount = invoices.RowCount,
                    Page = pagedRequest.Page,
                    PageSize = pagedRequest.PageSize,
                    PageCount = (int)Math.Ceiling(invoices.RowCount / (double)pagedRequest.PageSize)
                };
            }
        }

        public async Task<List<Invoice>> GetInvoicesReadyToCollectWithoutDataTransformationNeeded(DateTime effectiveDate)
        {
            var invoices = new List<Invoice>();

            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var today = DateTimeHelper.SaNow.Date;
                var currentMonth = DateTimeHelper.SaNow.Month;
                var debitOrdersGoLiveDate = await _configurationService.GetModuleSetting(autoDebitOrdersGoLiveDate);
                var collectionGenerationStartDate = DateTime.Parse(debitOrdersGoLiveDate);
                var collectionGenerationStartDateParam = new SqlParameter() { ParameterName = "@collectionGenerationStartDate", Value = collectionGenerationStartDate, SqlDbType = SqlDbType.Date };
                var effectiveDateParam = new SqlParameter() { ParameterName = "@effectiveDate", Value = effectiveDate, SqlDbType = SqlDbType.Date };
                var entities = await _collectionRepository.SqlQueryAsync<billing_Invoice>(DatabaseConstants.GetInvoicesReadyToCollect, collectionGenerationStartDateParam, effectiveDateParam);

                foreach (var entity in entities)
                {
                    var invoice = Mapper.Map<Invoice>(entity);
                    if (invoice.Balance > 0)
                    {
                        invoices.Add(invoice);
                    }
                }
            }

            return invoices;
        }

        public async Task ProcessQueuedInvoicesAndCreditNotes()
        {
            var processingDate = DateTime.Now.StartOfTheDay();
            var newInvoiceTransactions = new List<billing_Transaction>();
            var newCreditTransactions = new List<billing_Transaction>();
            using (var scope = _dbContextScopeFactory.Create())
            {
                var invoices = await _invoiceRepository.Where(i => i.TotalInvoiceAmount > 0 && i.InvoiceStatus == InvoiceStatusEnum.Queued && i.SourceModule == SourceModuleEnum.ClientCare).ToListAsync();
                foreach (var invoice in invoices)
                {
                    var isDuplicate = await IsDuplicateInvoice(invoice.InvoiceId, TransactionTypeEnum.Invoice);
                    if (!isDuplicate)
                    {
                        if (newInvoiceTransactions.Where(c => c.InvoiceId == invoice.InvoiceId).ToList().Count == 0)
                        {
                            var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId.Value);
                            if (policy == null)
                                continue;
                            var transaction = new billing_Transaction();
                            transaction.InvoiceId = invoice.InvoiceId;
                            transaction.TransactionType = TransactionTypeEnum.Invoice;
                            transaction.TransactionDate = DateTimeHelper.SaNow;
                            if (!IsFutureDatedDocument(invoice.InvoiceDate))
                            {
                                var latestPeriod = await _periodService.GetLatestPeriod();
                                if (latestPeriod != null)
                                {
                                    transaction.PeriodId = latestPeriod.Id;
                                    transaction.TransactionEffectiveDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Latest);
                                }
                                else
                                {
                                    transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                                    transaction.TransactionEffectiveDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                                }
                            }
                            else
                            {
                                var period = await GetPeriodBasedOnDocumentDate(invoice.InvoiceDate);
                                if (period != null)
                                    transaction.PeriodId = period.Id;
                                transaction.TransactionEffectiveDate = period.EndDate;
                            }

                            transaction.RolePlayerId = policy.PolicyPayeeId;
                            transaction.TransactionTypeLinkId = (int)TransactionActionType.Debit;
                            transaction.Amount = invoice.TotalInvoiceAmount;
                            transaction.RmaReference = invoice.InvoiceNumber;

                            newInvoiceTransactions.Add(transaction);
                            invoice.InvoiceStatus = InvoiceStatusEnum.Pending;

                            _invoiceRepository.Update(invoice);
                        }
                    }
                }

                _transactionRepository.Create(newInvoiceTransactions);
                await scope.SaveChangesAsync()
                .ConfigureAwait(false);
            }
            var incomeStatementChart = await _configurationService.GetModuleSetting(SystemSettings.UnearnedChart);
            var balanceSheetChart = await _configurationService.GetModuleSetting(SystemSettings.StandardBSChart);

            foreach (var transaction in newInvoiceTransactions)
            {
                var finPayee = await _rolePlayerService.GetFinPayee(transaction.RolePlayerId);
                var debtorIndustry = await _industryService.GetIndustry(finPayee.IndustryId);
                await _transactionCreatorService.PostItemToGeneralLedger(transaction.RolePlayerId, transaction.TransactionId, transaction.Amount, 0, incomeStatementChart, balanceSheetChart, true, debtorIndustry.IndustryClass, null);
            }

            var creditNoteTransactionsToBeEmailed = new List<CreditNoteToEmail>();
            using (var scope = _dbContextScopeFactory.Create())
            {
                var creditNotes = await _invoiceRepository.Where(i => i.TotalInvoiceAmount < 0 && i.InvoiceStatus == InvoiceStatusEnum.Queued && i.SourceModule == SourceModuleEnum.ClientCare).ToListAsync();
                foreach (var creditnote in creditNotes)
                {
                    var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(creditnote.PolicyId.Value);
                    if (policy == null)
                        continue;
                    var isDuplicate = await IsDuplicateCreditNote(creditnote.InvoiceNumber, TransactionTypeEnum.CreditNote, policy.PolicyPayeeId);
                    if (!isDuplicate)
                    {
                        if (newCreditTransactions.Where(c => c.RmaReference == creditnote.InvoiceNumber && c.RolePlayerId == policy.PolicyPayeeId).ToList().Count == 0)
                        {
                            var transaction = new billing_Transaction();
                            transaction.TransactionType = TransactionTypeEnum.CreditNote;
                            transaction.TransactionDate = DateTimeHelper.SaNow;
                            if (!IsFutureDatedDocument(creditnote.InvoiceDate))
                            {
                                var latestPeriod = await _periodService.GetLatestPeriod();
                                if (latestPeriod != null)
                                {
                                    transaction.PeriodId = latestPeriod.Id;
                                    transaction.TransactionEffectiveDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Latest);
                                }
                                else
                                {
                                    transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                                    transaction.TransactionEffectiveDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                                }
                            }
                            else
                            {
                                var period = await GetPeriodBasedOnDocumentDate(creditnote.InvoiceDate);
                                transaction.PeriodId = period.Id;
                                transaction.TransactionEffectiveDate = period.EndDate;
                            }

                            transaction.RolePlayerId = policy.PolicyPayeeId;
                            transaction.TransactionTypeLinkId = (int)TransactionActionType.Credit;
                            transaction.Amount = decimal.Negate(creditnote.TotalInvoiceAmount);
                            transaction.RmaReference = creditnote.InvoiceNumber;

                            var transactionAmount = decimal.Negate(creditnote.TotalInvoiceAmount);

                            var invoiceTransactions = await _transactionRepository.Where(t => t.Amount == transactionAmount
                            && t.TransactionType == TransactionTypeEnum.Invoice
                            && t.RolePlayerId == policy.PolicyPayeeId && t.InvoiceId != null).ToListAsync();
                            if (invoiceTransactions.Count > 0)
                            {
                                if (invoiceTransactions.Count == 1)
                                {
                                    var invoiceId = invoiceTransactions.FirstOrDefault()?.InvoiceId.Value;
                                    var invoiceToOffset = await _invoiceRepository.FirstOrDefaultAsync(c => c.InvoiceId == invoiceId);
                                    await _invoiceRepository.LoadAsync(invoiceToOffset, x => x.InvoiceAllocations);
                                    var mappedInvoice = Mapper.Map<Invoice>(invoiceToOffset);
                                    if (mappedInvoice.Balance == transactionAmount)
                                    {
                                        var linkedTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == invoiceId && t.TransactionType == TransactionTypeEnum.Invoice);
                                        if (linkedTransaction != null)
                                        {
                                            transaction.LinkedTransactionId = linkedTransaction.TransactionId;
                                            var productOptionId = policy.ProductOptionId;
                                            var productOption = await _productOptionService.GetProductOption(productOptionId);
                                            var productCategory = GetProductCategoryType(productOption.Code);
                                            var allocation = new billing_InvoiceAllocation { TransactionId = transaction.TransactionId, InvoiceId = invoiceId, Amount = transactionAmount, TransactionTypeLinkId = (int)TransactionActionType.Credit, BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation, ProductCategoryType = productCategory };
                                            transaction.InvoiceAllocations_TransactionId.Add(allocation);
                                        }
                                    }
                                }

                                if (invoiceTransactions.Count > 1)
                                {
                                    foreach (var invoiceTransaction in invoiceTransactions.OrderBy(c => c.TransactionId))
                                    {
                                        var invoiceId = invoiceTransaction.InvoiceId.Value;
                                        var invoiceToOffset = await _invoiceRepository.FirstOrDefaultAsync(c => c.InvoiceId == invoiceId);
                                        await _invoiceRepository.LoadAsync(invoiceToOffset, x => x.InvoiceAllocations);
                                        var mappedInvoice = Mapper.Map<Invoice>(invoiceToOffset);
                                        if (mappedInvoice.Balance == transactionAmount)
                                        {
                                            var linkedTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == invoiceId && t.TransactionType == TransactionTypeEnum.Invoice);
                                            if (linkedTransaction != null)
                                            {
                                                transaction.LinkedTransactionId = linkedTransaction.TransactionId;
                                                var allocation = new billing_InvoiceAllocation { TransactionId = transaction.TransactionId, InvoiceId = invoiceId, Amount = transactionAmount, TransactionTypeLinkId = (int)TransactionActionType.Credit, BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation };
                                                transaction.InvoiceAllocations_TransactionId.Add(allocation);
                                            }
                                            break;
                                        }
                                    }
                                }
                            }

                            creditnote.InvoiceStatus = InvoiceStatusEnum.Allocated;
                            _invoiceRepository.Update(creditnote);
                            newCreditTransactions.Add(transaction);
                        }
                    }
                }
                _transactionRepository.Create(newCreditTransactions);
                await scope.SaveChangesAsync()
                      .ConfigureAwait(false);
            }
        }

        public async Task ProcessQueuedFuneralInvoicesAndCreditNotes()
        {
            var processingDate = DateTime.Now.StartOfTheDay();
            var newInvoiceTransactions = new List<billing_Transaction>();
            var newCreditTransactions = new List<billing_Transaction>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                var invoices = await _invoiceRepository.Where(i =>
                    i.TotalInvoiceAmount > 0 &&
                    i.InvoiceStatus == InvoiceStatusEnum.Queued &&
                    i.SourceModule == SourceModuleEnum.ClientCare &&
                    !String.IsNullOrEmpty(i.InvoiceNumber)).ToListAsync();

                foreach (var invoice in invoices)
                {
                    var isDuplicate = await IsDuplicateFuneralInvoice(invoice.InvoiceId, TransactionTypeEnum.Invoice);

                    if (isDuplicate)
                    {
                        invoice.ModifiedBy = RmaIdentity.Username;
                        invoice.ModifiedDate = DateTimeHelper.SaNow;
                        invoice.InvoiceStatus = InvoiceStatusEnum.Pending;

                        _invoiceRepository.Update(invoice);

                        continue;
                    }

                    if (newInvoiceTransactions.Where(c => c.InvoiceId == invoice.InvoiceId).ToList().Count == 0)
                    {
                        var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId.Value);

                        if (policy == null)
                        {
                            invoice.ModifiedBy = RmaIdentity.Username;
                            invoice.ModifiedDate = DateTimeHelper.SaNow;
                            invoice.InvoiceStatus = InvoiceStatusEnum.Pending;

                            _invoiceRepository.Update(invoice);

                            continue;
                        }

                        var transaction = new billing_Transaction
                        {
                            InvoiceId = invoice.InvoiceId,
                            TransactionType = TransactionTypeEnum.Invoice,
                            RolePlayerId = policy.PolicyPayeeId,
                            TransactionTypeLinkId = (int)TransactionActionType.Debit,
                            Amount = invoice.TotalInvoiceAmount,
                            RmaReference = invoice.InvoiceNumber,
                            ModifiedBy = RmaIdentity.Username,
                            ModifiedDate = DateTimeHelper.SaNow
                        };

                        if (IsFutureDatedDocument(invoice.InvoiceDate))
                        {
                            var period = await GetPeriodBasedOnDocumentDate(invoice.InvoiceDate);
                            if (period != null)
                            {
                                transaction.PeriodId = period.Id;
                                transaction.TransactionDate = period.EndDate;
                            }
                        }
                        else
                        {
                            var latestPeriod = await _periodService.GetLatestPeriod();
                            if (latestPeriod == null)
                            {
                                transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                                transaction.TransactionDate = DateTimeHelper.SaNow;
                            }
                            else
                            {
                                transaction.PeriodId = latestPeriod.Id;
                                transaction.TransactionDate = DateTimeHelper.SaNow;
                            }
                        }

                        // link adjustment invoices transactions
                        if (invoice.LinkedInvoiceId != null)
                        {
                            var linkedInvoiceTransaction = await _transactionRepository.Where(x => x.InvoiceId == invoice.LinkedInvoiceId && x.TransactionType == TransactionTypeEnum.Invoice).FirstOrDefaultAsync();
                            transaction.LinkedTransactionId = linkedInvoiceTransaction.TransactionId;
                        }

                        // add transaction reason for premium adjustment
                        if (!string.IsNullOrEmpty(invoice.Reason))
                        {
                            var policyChangeMessageTypes = Enum.GetValues(typeof(PolicyChangeMessageTypeEnum)).Cast<PolicyChangeMessageTypeEnum>().ToList();
                            if (policyChangeMessageTypes.Any(x => String.Equals(invoice.Reason.Replace(" ", string.Empty), x.GetDescription(), StringComparison.OrdinalIgnoreCase)))
                            {
                                transaction.TransactionReason = TransactionReasonEnum.PremiumAdjustment;
                            }
                        }

                        newInvoiceTransactions.Add(transaction);

                        invoice.ModifiedBy = RmaIdentity.Username;
                        invoice.ModifiedDate = DateTimeHelper.SaNow;
                        invoice.InvoiceStatus = InvoiceStatusEnum.Pending;

                        _invoiceRepository.Update(invoice);
                    }
                }

                _transactionRepository.Create(newInvoiceTransactions);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }

            var incomeStatementChart = await _configurationService.GetModuleSetting(SystemSettings.UnearnedChart);
            var balanceSheetChart = await _configurationService.GetModuleSetting(SystemSettings.StandardBSChart);

            foreach (var transaction in newInvoiceTransactions)
            {
                var finPayee = await _rolePlayerService.GetFinPayee(transaction.RolePlayerId);
                var debtorIndustry = await _industryService.GetIndustry(finPayee.IndustryId);

                await _transactionCreatorService.PostItemToGeneralLedger(transaction.RolePlayerId,
                        transaction.TransactionId, transaction.Amount, 0, incomeStatementChart,
                        balanceSheetChart, true, debtorIndustry.IndustryClass, null);
            }

            var creditNoteTransactionsToBeEmailed = new List<CreditNoteToEmail>();

            using (var scope = _dbContextScopeFactory.Create())
            {
                var creditNotes = await _invoiceRepository.Where(i => i.TotalInvoiceAmount < 0
                                && i.InvoiceStatus == InvoiceStatusEnum.Queued
                                && i.SourceModule == SourceModuleEnum.ClientCare
                                && !String.IsNullOrEmpty(i.InvoiceNumber)).ToListAsync();

                foreach (var creditNote in creditNotes)
                {
                    var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(creditNote.PolicyId.Value);

                    if (policy == null)
                    {
                        continue;
                    }

                    var isDuplicate = await IsDuplicateCreditNote(creditNote.InvoiceNumber, TransactionTypeEnum.CreditNote, policy.PolicyPayeeId);

                    if (isDuplicate)
                    {
                        continue;
                    }

                    if (newCreditTransactions.Where(c => c.RmaReference == creditNote.InvoiceNumber && c.RolePlayerId == policy.PolicyPayeeId).ToList().Count == 0)
                    {
                        var transaction = new billing_Transaction
                        {
                            TransactionType = TransactionTypeEnum.CreditNote,
                            RolePlayerId = policy.PolicyPayeeId,
                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                            Amount = decimal.Negate(creditNote.TotalInvoiceAmount),
                            RmaReference = creditNote.InvoiceNumber
                        };

                        if (IsFutureDatedDocument(creditNote.InvoiceDate))
                        {
                            var period = await GetPeriodBasedOnDocumentDate(creditNote.InvoiceDate);
                            transaction.PeriodId = period.Id;
                            transaction.TransactionDate = period.EndDate;
                        }
                        else
                        {
                            var latestPeriod = await _periodService.GetLatestPeriod();
                            if (latestPeriod == null)
                            {
                                transaction.PeriodId = await GetPeriodId(PeriodStatusEnum.Current);
                                transaction.TransactionDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Latest);
                            }
                            else
                            {
                                transaction.PeriodId = latestPeriod.Id;
                                transaction.TransactionDate = await DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum.Current);
                            }
                        }

                        var transactionAmount = decimal.Negate(creditNote.TotalInvoiceAmount);

                        var invoiceTransactions = await _transactionRepository.Where(t => t.Amount == transactionAmount
                            && t.TransactionType == TransactionTypeEnum.Invoice
                            && t.RolePlayerId == policy.PolicyPayeeId && t.InvoiceId != null).ToListAsync();

                        if (invoiceTransactions.Count == 1)
                        {
                            var invoiceId = invoiceTransactions.FirstOrDefault()?.InvoiceId.Value;
                            var invoiceToOffset = await _invoiceRepository.FirstOrDefaultAsync(c => c.InvoiceId == invoiceId);
                            await _invoiceRepository.LoadAsync(invoiceToOffset, x => x.InvoiceAllocations);
                            var mappedInvoice = Mapper.Map<Invoice>(invoiceToOffset);

                            if (mappedInvoice.Balance == transactionAmount)
                            {
                                var linkedTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == invoiceId && t.TransactionType == TransactionTypeEnum.Invoice);

                                if (linkedTransaction != null)
                                {
                                    transaction.LinkedTransactionId = linkedTransaction.TransactionId;
                                    var productOptionId = policy.ProductOptionId;
                                    var productOption = await _productOptionService.GetProductOption(productOptionId);
                                    var productCategory = GetProductCategoryType(productOption.Code);

                                    var allocation = new billing_InvoiceAllocation
                                    {
                                        TransactionId = transaction.TransactionId,
                                        InvoiceId = invoiceId,
                                        Amount = transactionAmount,
                                        TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                        BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation,
                                        ProductCategoryType = productCategory
                                    };

                                    transaction.InvoiceAllocations_TransactionId.Add(allocation);
                                }
                            }
                        }

                        if (invoiceTransactions.Count > 1)
                        {
                            foreach (var invoiceTransaction in invoiceTransactions.OrderBy(c => c.TransactionId))
                            {
                                var invoiceId = invoiceTransaction.InvoiceId.Value;
                                var invoiceToOffset = await _invoiceRepository.FirstOrDefaultAsync(c => c.InvoiceId == invoiceId);
                                await _invoiceRepository.LoadAsync(invoiceToOffset, x => x.InvoiceAllocations);
                                var mappedInvoice = Mapper.Map<Invoice>(invoiceToOffset);

                                if (mappedInvoice.Balance == transactionAmount)
                                {
                                    var linkedTransaction = await _transactionRepository.FirstOrDefaultAsync(t => t.InvoiceId == invoiceId && t.TransactionType == TransactionTypeEnum.Invoice);
                                    if (linkedTransaction != null)
                                    {
                                        transaction.LinkedTransactionId = linkedTransaction.TransactionId;

                                        var allocation = new billing_InvoiceAllocation
                                        {
                                            TransactionId = transaction.TransactionId,
                                            InvoiceId = invoiceId,
                                            Amount = transactionAmount,
                                            TransactionTypeLinkId = (int)TransactionActionType.Credit,
                                            BillingAllocationType = BillingAllocationTypeEnum.InvoiceAllocation
                                        };

                                        transaction.InvoiceAllocations_TransactionId.Add(allocation);
                                    }

                                    break;
                                }
                            }
                        }

                        creditNote.InvoiceStatus = InvoiceStatusEnum.Allocated;
                        creditNote.ModifiedBy = RmaIdentity.Username;
                        creditNote.ModifiedDate = DateTimeHelper.SaNow;

                        _invoiceRepository.Update(creditNote);

                        newCreditTransactions.Add(transaction);
                    }
                }

                _transactionRepository.Create(newCreditTransactions);

                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }

        public async Task<DateTime> DeriveTransactionDateBasedOnPeriodStatus(PeriodStatusEnum periodStatus)
        {
            var currentPeriod = await _periodService.GetCurrentPeriod();
            var latestPeriod = await _periodService.GetLatestPeriod();

            var now = DateTimeHelper.SaNow;

            switch (periodStatus)
            {
                case PeriodStatusEnum.Current:
                    if (currentPeriod == null) return now;
                    if (now < currentPeriod.EndDate) return now;
                    return currentPeriod.EndDate;
                case PeriodStatusEnum.Latest:
                    if (latestPeriod == null) return now;
                    if (now < latestPeriod.EndDate) return now;
                    return latestPeriod.EndDate;
                default:
                    return now;
            }
        }

        public async Task<bool> EmailDebtorCreditNote(CreditNoteSendRequest request)
        {
            Contract.Requires(request != null);
            var debtor = new FinPayee();
            try
            {
                var reportPath = "RMACreditNote";
                var recipients = request?.ToAddress.Split(new char[] { ';', ',' });
                var emailAddress = recipients[0].Trim();

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entity = await _finPayeeRepository.FirstOrDefaultAsync(f => f.RolePlayerId == request.RoleplayerId);
                    debtor = Mapper.Map<FinPayee>(entity);
                    if (string.IsNullOrEmpty(emailAddress))
                    {
                        var contacts = await _rolePlayerService.GetRolePlayerContactDetails(debtor.RolePlayerId);

                        if (contacts.LastOrDefault(c => !c.IsDeleted) != null && !string.IsNullOrEmpty(contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress))
                        {
                            emailAddress = contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress;
                        }
                    }
                }
                if (!string.IsNullOrEmpty(emailAddress))
                {
                    var attachments = new List<MailAttachment>();
                    foreach (var transactionId in request?.TransactionIds)
                    {
                        var parameters = $"&transactionId={transactionId}&rs:Command=ClearSession";
                        var docBytes = await GetUriDocumentByteData(new Uri($"{finCareReportServerUrl}/{reportPath}{parameters}&rs:Format=PDF"), _headerCollection);

                        var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = docBytes };
                        var response = await _documentGeneratorService.PasswordProtectPdf(debtor.FinPayeNumber, pdfDocumentPass, fileEncryptRequest);


                        var attachment = new MailAttachment { AttachmentByteData = response.encryptedDocumentBytes, FileName = "RMACreditnote.pdf", FileType = "application/pdf" };

                        attachments.Add(attachment);
                    }

                    var bcc = string.Empty;

                    if (recipients.Length > 1)
                    {
                        bcc = string.Join(",", recipients.Skip(1));
                    }


                    var emailRequest = new SendMailRequest
                    {
                        ItemId = debtor.RolePlayerId,
                        ItemType = "CreditNote",
                        FromAddress = _fromAddress,
                        Recipients = emailAddress,
                        Subject = $"RMA Credit Note {request?.CreditNoteNumber}",
                        Body = creditNoteMessageBody,
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    };
                    if (!string.IsNullOrEmpty(bcc))
                    {
                        emailRequest.RecipientsCC = bcc;
                    }

                    await _sendEmailService.SendEmail(emailRequest);

                    var text = (!string.IsNullOrEmpty(request?.CreditNoteNumber)) ? $"Credit note number {request?.CreditNoteNumber} emailed to {request?.ToAddress}" : $"Credit note emailed to client";
                    var note = new BillingNote
                    {
                        ItemId = debtor.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.Email.GetDescription(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);
                }
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                ex.LogException($"Failed to send Credit note - roleplayerid:{debtor.RolePlayerId}  > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
                return await Task.FromResult(false);
            }
        }

        public async Task<bool> EmailDebtorInvoice(InvoiceSendRequest request)
        {
            Contract.Requires(request != null);
            var debtor = new FinPayee();
            try
            {
                var reportPath = "RMACoidInvoice";
                var recipients = request?.ToAddress.Split(new char[] { ';', ',' });
                var emailAddress = recipients[0];

                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var entity = await _finPayeeRepository.FirstOrDefaultAsync(f => f.RolePlayerId == request.RoleplayerId);
                    debtor = Mapper.Map<FinPayee>(entity);
                    if (string.IsNullOrEmpty(emailAddress))
                    {
                        var contacts = await _rolePlayerService.GetRolePlayerContactDetails(debtor.RolePlayerId);

                        if (contacts.LastOrDefault(c => !c.IsDeleted) != null && !string.IsNullOrEmpty(contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress))
                        {
                            emailAddress = contacts.LastOrDefault(c => !c.IsDeleted)?.EmailAddress;
                        }
                    }
                }

                if (!string.IsNullOrEmpty(emailAddress) && !string.IsNullOrEmpty(debtor.FinPayeNumber))
                {
                    var attachments = new List<MailAttachment>();
                    foreach (var invoiceId in request?.InvoiceIds)
                    {
                        var parameters = $"&invoiceId={invoiceId}&rs:Command=ClearSession";
                        var docBytes = await GetUriDocumentByteData(new Uri($"{finCareReportServerUrl}/{reportPath}{parameters}&rs:Format=PDF"), _headerCollection);

                        var fileEncryptRequest = new Admin.MasterDataManager.Contracts.Entities.FileEncryptRequest { documentBytes = docBytes };
                        var response = await _documentGeneratorService.PasswordProtectPdf(debtor.FinPayeNumber, pdfDocumentPass, fileEncryptRequest);

                        var attachment = new MailAttachment { AttachmentByteData = response.encryptedDocumentBytes, FileName = "RMAInvoice.pdf", FileType = "application/pdf" };

                        attachments.Add(attachment);
                    }

                    var bcc = string.Empty;

                    if (recipients.Length > 1)
                    {
                        bcc = string.Join(",", recipients.Skip(1));
                    }
                    var emailRequest = new SendMailRequest
                    {
                        ItemId = debtor.RolePlayerId,
                        ItemType = "Invoice",
                        FromAddress = _fromAddress,
                        Recipients = emailAddress,
                        Subject = $"RMA Invoice {request?.InvoiceNumber}",
                        Body = invoiceMessageBody,
                        IsHtml = true,
                        Attachments = attachments.ToArray()
                    };
                    if (!string.IsNullOrEmpty(bcc))
                    {
                        emailRequest.RecipientsCC = bcc;
                    }

                    await _sendEmailService.SendEmail(emailRequest);

                    var text = (!string.IsNullOrEmpty(request?.InvoiceNumber)) ? $"Invoice number {request?.InvoiceNumber} emailed to {request?.ToAddress}" : $"Invoice emailed to client"; ;
                    var note = new BillingNote
                    {
                        ItemId = debtor.RolePlayerId,
                        ItemType = BillingNoteTypeEnum.Email.GetDescription(),
                        Text = text
                    };
                    await _billingService.AddBillingNote(note);
                }
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                ex.LogException($"Failed to send Invoice - rolePlayerid: {request.RoleplayerId} > Message: {ex.Message} - StackTrace: {ex.StackTrace}");
                return await Task.FromResult(false);
            }
        }

        public async Task<List<CreditNoteSearchResult>> SearchCreditNotes(PagedRequest request, bool showActive)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            Contract.Requires(request != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                int recordCount = 0;
                var parameters = new[] {
                new SqlParameter("FilterType", 1),
                    new SqlParameter("Filter", request.SearchCriteria),
                    new SqlParameter("ShowActive", showActive),
                    new SqlParameter("pageNumber", request.Page),
                    new SqlParameter("pageSize", request.PageSize),
                    new SqlParameter("recordCount", SqlDbType.BigInt) { Direction = ParameterDirection.Output}
                };

                var searchResult = await _invoiceRepository.SqlQueryAsync<CreditNoteSearchResult>(
                    DatabaseConstants.SearchCreditNotes, parameters);

                recordCount = Convert.ToInt32(parameters[5]?.Value);

                return searchResult;
            }
        }

        private async Task<int> GetPeriodId(PeriodStatusEnum periodStatus)
        {
            var currentPeriod = new Period();
            switch (periodStatus)
            {
                case PeriodStatusEnum.Current:
                    currentPeriod = await _periodService.GetCurrentPeriod();
                    return currentPeriod.Id;
                case PeriodStatusEnum.Latest:
                    var latestPeriod = await _periodService.GetLatestPeriod();
                    return latestPeriod.Id;
                default:
                    currentPeriod = await _periodService.GetCurrentPeriod();
                    return currentPeriod.Id;
            }
        }

        private async Task<bool> IsDuplicateInvoice(int invoiceId, TransactionTypeEnum transactionType)
        {
            var results = await _transactionRepository.Where(t => t.InvoiceId == invoiceId && t.TransactionType == transactionType).ToListAsync();

            return results?.Count > 0;
        }

        private async Task<bool> IsDuplicateFuneralInvoice(int invoiceId, TransactionTypeEnum transactionType)
        {
            var results = await _transactionRepository.Where(t => t.InvoiceId == invoiceId &&
                t.TransactionType == transactionType && t.LinkedTransactionId.HasValue).ToListAsync();

            return results?.Count > 0;
        }

        public async Task<List<InvoicePaymentAllocation>> GetUnPaidInvoicesForPolicies(int rolePlayerId, List<int> policyIds)
        {
            Contract.Requires(policyIds != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = new List<RolePlayerPolicy>();
                var invoicePaymentAllocations = new List<InvoicePaymentAllocation>();

                var policyIdsString = string.Join("|", policyIds);

                SqlParameter[] parameters =
                {
                        new SqlParameter("rolePlayerId", rolePlayerId),
                        new SqlParameter("policyIds", policyIdsString)
                };

                foreach (var policyId in policyIds)
                {
                    var rolePlayerPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policyId);
                    policies.Add(rolePlayerPolicy);
                }

                var invoices = await _invoiceRepository.SqlQueryAsync<Invoice>(DatabaseConstants.GetUnsettledInvoicesForPolicies, parameters);

                var finPayeeNumber = (await _rolePlayerService.GetFinPayee(rolePlayerId)).FinPayeNumber;

                foreach (var invoice in invoices.Where(i => policyIds.Contains(i.PolicyId)))
                {
                    if (invoice == null) continue;

                    var policy = policies.FirstOrDefault(x => x.PolicyId == invoice.PolicyId);
                    if (policy == null)
                        continue;

                    var allocation = new InvoicePaymentAllocation()
                    {
                        PolicyNumber = policy.PolicyNumber,
                        InvoiceId = invoice.InvoiceId,
                        InvoiceStatus = invoice.InvoiceStatus,
                        CollectionDate = invoice.CollectionDate,
                        InvoiceDate = invoice.InvoiceDate,
                        TotalInvoiceAmount = invoice.TotalInvoiceAmount,
                        InvoiceNumber = invoice.InvoiceNumber,
                        AmountOutstanding = invoice.Balance,
                        DisplayName = finPayeeNumber
                    };

                    invoicePaymentAllocations.Add(allocation);
                }

                return invoicePaymentAllocations;
            }
        }

        public async Task<List<InvoicePaymentAllocation>> GetUnPaidInvoicesByPolicies(int rolePlayerId, List<int> policyIds)
        {
            Contract.Requires(policyIds != null);
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var policies = new List<RolePlayerPolicy>();
                var invoicePaymentAllocations = new List<InvoicePaymentAllocation>();

                foreach (var policyId in policyIds)
                {
                    var rolePlayerPolicy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(policyId);
                    policies.Add(rolePlayerPolicy);
                }

                var invoices = await _invoiceRepository.SqlQueryAsync<Invoice>(DatabaseConstants.GetUnsettledInvoices, new SqlParameter("rolePlayerId", rolePlayerId));

                var finPayeeNumber = (await _rolePlayerService.GetFinPayee(rolePlayerId)).FinPayeNumber;

                foreach (var invoice in invoices.Where(i => policyIds.Contains(i.PolicyId)))
                {
                    if (invoice == null) continue;

                    var policy = policies.FirstOrDefault(x => x.PolicyId == invoice.PolicyId);

                    if (policy == null)
                        continue;

                    var allocation = new InvoicePaymentAllocation()
                    {
                        PolicyNumber = policy.PolicyNumber,
                        InvoiceId = invoice.InvoiceId,
                        InvoiceStatus = invoice.InvoiceStatus,
                        CollectionDate = invoice.CollectionDate,
                        InvoiceDate = invoice.InvoiceDate,
                        TotalInvoiceAmount = invoice.TotalInvoiceAmount,
                        InvoiceNumber = invoice.InvoiceNumber,
                        AmountOutstanding = invoice.Balance,
                        DisplayName = finPayeeNumber
                    };

                    invoicePaymentAllocations.Add(allocation);
                }
                return invoicePaymentAllocations;
            }
        }

        private ProductCategoryTypeEnum GetProductCategoryType(string productOptionCode)
        {
            switch (productOptionCode.ToUpper())
            {
                case empCode:
                case wmpCode:
                    return ProductCategoryTypeEnum.Coid;
                case riotCode:
                case augCode:
                case gpaCode:
                    return ProductCategoryTypeEnum.VapsNoneStatutory;
                case cjpCode:
                case cicjpCode:
                case coidInternationalCode:
                    return ProductCategoryTypeEnum.VapsAssistance;
                default:
                    return ProductCategoryTypeEnum.Funeral;
            }
        }

        private async Task<bool> IsDuplicateCreditNote(string rmaRefence, TransactionTypeEnum transactionType, int rolePlayerId)
        {
            var results = await _transactionRepository.Where(t => t.RmaReference == rmaRefence
            && t.TransactionType == transactionType
            && t.RolePlayerId == rolePlayerId).ToListAsync();

            return results.Count > 0;
        }

        private bool IsFutureDatedDocument(DateTime documentDate)
        {
            if (documentDate.EndOfTheDay() > DateTime.Now.EndOfTheDay())
                return true;
            return false;
        }

        private async Task<Period> GetPeriodBasedOnDocumentDate(DateTime documentDate)
        {
            var period = await _periodService.GetPeriod(documentDate);
            return period;
        }

        private ProductCategoryTypeEnum? GetProductCategoryByProduct(Product product)
        {
            if (product.ProductClass == ProductClassEnum.Life && (UnderwriterEnum)product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
            {
                return ProductCategoryTypeEnum.Funeral;
            }
            else if (product.ProductClass == ProductClassEnum.Assistance || product.ProductClass == ProductClassEnum.NonStatutory && (UnderwriterEnum)product.UnderwriterId == UnderwriterEnum.RMALifeAssurance)
            {
                return product.ProductClass == ProductClassEnum.Assistance ? ProductCategoryTypeEnum.VapsAssistance : ProductCategoryTypeEnum.VapsNoneStatutory;
            }
            else if (product.ProductClass == ProductClassEnum.Statutory && (UnderwriterEnum)product.UnderwriterId == UnderwriterEnum.RMAMutualAssurance)
            {
                return ProductCategoryTypeEnum.Coid;
            }
            else
            {
                return null;
            }
        }

        public async Task<InvoiceDocumentModel> GetInvoiceDocument(int invoiceId)
        {
            try
            {
                _parameters = $"&invoiceId={invoiceId}&rs:Command=ClearSession";

                var environment = await _configurationService.GetModuleSetting("Environment");

                _headerCollection = new WebHeaderCollection
                {
                    {"Authorization", "Bearer " + RmaIdentity.AccessToken},
                    {SystemSettings.Environment, environment}
                };
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var invoice = await _invoiceRepository.FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);
                    var policy = await _rolePlayerPolicyService.GetRolePlayerPolicyWithNoReferenceData(invoice.PolicyId.Value);
                    var product = await _productOptionService.GetProductByProductOptionId(policy.ProductOptionId);
                    var productCategory = GetProductCategoryByProduct(product);//avoiding circular dependency with IPolicyService

                    var path = "";

                    if (productCategory == ProductCategoryTypeEnum.Funeral)
                    {
                        path = $"{_reportServerUrl}/RMAFuneralInvoice{_parameters}&rs:Format=PDF";
                        var invoiceDocument = await GetUriDocumentByteData(
                            new Uri(path), _headerCollection);

                        return new InvoiceDocumentModel { InvoiceId = invoiceId, InvoiceDocumentBytes = invoiceDocument };
                    }
                    else if (productCategory == ProductCategoryTypeEnum.Coid || productCategory == ProductCategoryTypeEnum.VapsNoneStatutory || productCategory == ProductCategoryTypeEnum.VapsAssistance)
                    {
                        path = $"{_reportServerUrl}/RMACoidInvoice{_parameters}&rs:Format=PDF";
                        var invoiceDocument = await GetUriDocumentByteData(
                            new Uri(path), _headerCollection);

                        return new InvoiceDocumentModel { InvoiceId = invoiceId, InvoiceDocumentBytes = invoiceDocument };
                    }
                    else
                    {
                        return new InvoiceDocumentModel { InvoiceId = invoiceId, InvoiceDocumentBytes = null };
                    }
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error when Generating Invoice Document for invoiceId- {invoiceId} - Error Message {ex.Message}");
                throw;
            }
        }

        public async Task<List<DebtorOpeningClosingDetail>> GetDebtorOpeningAndClosingBalances(int rolePlayerId)
        {
            try
            {
                var balancesDetails = new List<DebtorOpeningClosingDetail>();
                using (_dbContextScopeFactory.CreateReadOnly())
                {
                    var policies = await _rolePlayerPolicyService.GetPoliciesByPolicyPayeeIdNoRefData(rolePlayerId);
                    if (policies.Count > 0)
                    {
                        foreach (var policy in policies.Where(c => c.ParentPolicyId == null))
                        {
                            SqlParameter[] parameters =
                            {
                                new SqlParameter("@policyId", policy.PolicyId),
                            };

                            var balanceDetail = await _invoiceRepository.SqlQueryAsync<DebtorOpeningClosingDetail>(
                                DatabaseConstants.GetDebtorOpeningClosingBalanceByPolicy, parameters);
                            if (balanceDetail != null)
                                balancesDetails.AddRange(balanceDetail);
                        }
                    }

                    return balancesDetails;
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"Error retrieving opening and closing balances- Error Message {ex.Message}");
                throw;
            }
        }

        public async Task<List<InvoiceAllocation>> GetInvoiceAllocationsByTransaction(int transactionId)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoiceAllocations = new List<InvoiceAllocation>();

                var allocations = await _invoiceAllocationRepository.Where(i => i.TransactionId == transactionId).ToListAsync(); ;
                if (allocations != null && allocations.Count > 0)
                    invoiceAllocations = Mapper.Map<List<InvoiceAllocation>>(allocations);
                return invoiceAllocations;
            }
        }

        public async Task<List<Invoice>> GetPaidInvoicesByDateAndPolicyId(int policyId, DateTime invoiceDate)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.ViewInvoice);

            var results = new List<Invoice>();
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoices = await (from transaction in _transactionRepository
                                      where transaction.TransactionType == TransactionTypeEnum.Invoice
                                       && (transaction.TransactionReason != TransactionReasonEnum.PremiumAdjustment
                                            || transaction.TransactionReason == null)
                                       && transaction.TransactionDate.Month == invoiceDate.Month
                                       && transaction.TransactionDate.Year == invoiceDate.Year
                                       && transaction.Invoice.PolicyId == policyId
                                      select transaction.Invoice).ToListAsync();

                if (invoices.Count > 0)
                {
                    results = Mapper.Map<List<Invoice>>(invoices);
                }
            }

            return results;
        }

        public async Task<List<BenefitPayrollInvoice>> GetInvoicesForBenefitPayrolls(List<int> payrollIds)
        {
            using (_dbContextScopeFactory.CreateReadOnly())
            {
                var invoices = await _invoiceLineItemRepository.Where(x => payrollIds.Contains(x.BenefitPayrollId ?? 0))
                                                               .Select(s => new BenefitPayrollInvoice
                                                               {
                                                                   InvoiceId = s.InvoiceId,
                                                                   InvoiceDate = s.Invoice.InvoiceDate,
                                                                   TotalInvoiceAmount = s.ActualPremium ?? 0,
                                                                   BenefitPayrollId = s.BenefitPayrollId ?? 0,
                                                                   BenefitRateId = s.BenefitRateId ?? 0,
                                                                   InvoiceNumber = s.Invoice.InvoiceNumber,
                                                               })
                                                               .ToListAsync();

                return invoices;
            }
        }

        private async Task ModifyCreditNoteInvoiceStatusAndSource(int invoiceId, InvoiceStatusEnum newStatus, SourceModuleEnum sourceModuleEnum, SourceProcessEnum sourceProcessEnum)
        {
            if (await _configurationService.IsFeatureFlagSettingEnabled(BillingModulePermissions))
                RmaIdentity.DemandPermission(Permissions.EditInvoice);

            using (var scope = _dbContextScopeFactory.Create())
            {
                var entity = await _invoiceRepository.Where(x => x.InvoiceId == invoiceId).SingleAsync();
                entity.InvoiceStatus = newStatus;
                entity.SourceModule = sourceModuleEnum;
                entity.SourceProcess = sourceProcessEnum;

                _invoiceRepository.Update(entity);
                await scope.SaveChangesAsync().ConfigureAwait(false);
            }
        }
    }
}