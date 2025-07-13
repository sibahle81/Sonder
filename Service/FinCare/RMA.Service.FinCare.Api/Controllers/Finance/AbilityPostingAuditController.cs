using Microsoft.AspNetCore.Mvc;

using RMA.Common.Web.Controllers;
using RMA.Service.FinCare.Contracts.Entities.Finance;
using RMA.Service.FinCare.Contracts.Interfaces.Finance;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.FinCare.Api.Controllers.Finance
{
    [Route("api/Finance/[controller]")]
    public class AbilityPostingAuditController : RmaApiController
    {
        private readonly IAbilityPostingAuditService _abilityPostingAuditService;

        public AbilityPostingAuditController(IAbilityPostingAuditService abilityPostingAuditService)
        {
            _abilityPostingAuditService = abilityPostingAuditService;
        }

        [HttpGet]
        public async Task<ActionResult<List<AbilityPostingAudit>>> Get()
        {
            var abilityPostingAudits = await _abilityPostingAuditService.GetAbilityPostingAudits();
            return Ok(abilityPostingAudits);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AbilityPostingAudit>> Get(int id)
        {
            var abilityPostingAudit = await _abilityPostingAuditService.GetAbilityPostingAudit(id);
            return Ok(abilityPostingAudit);
        }

        [HttpGet("GetAuditDetailsByReference/{reference}")]
        public async Task<ActionResult<AbilityPostingAudit>> Get(string reference)
        {
            var abilityPostingAudit = await _abilityPostingAuditService.GetAuditDetailsByReference(reference);
            return Ok(abilityPostingAudit);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Post([FromBody] AbilityPostingAudit abilityPostingAudit)
        {
            var res = await _abilityPostingAuditService.AddAbilityPostingAudit(abilityPostingAudit);
            return Ok(res);
        }
#pragma warning disable S125
        /* Bellow method are not Used
        [HttpPut]
        public async Task<ActionResult<ProductCrossRefTranType>> Put([FromBody] ProductCrossRefTranType productCrossRefTranType)
        {
                await _abilityPostingAuditService.EditProductCrossRefTranType(productCrossRefTranType);
                return Ok();
        }

        [HttpGet("AbilityPostingAudit/Client/{clientId}")]
        public async Task<ActionResult<IEnumerable<StatementItem>>> GetStatement(int clientId)
        {
                var clientCovers = await _clientCoverService.GetClientCoverByClientId(clientId);
                var invoices = await _invoiceService.GetInvoicesForClient(clientId);
                var transactionTypes = await _transactionTypeService.GetTransactionTypes();
                var paymentHeaders = await _paymentHeaderService.GetPaymentHeaders();
                var paymentHeaderDetails = await _paymentHeaderDetailsService.GetPaymentHeaderDetails();

                var statementItems = (from clientCover in clientCovers
                                      join invoice in invoices on clientCover.Id equals invoice.ClientCoverId
                                      join paymentHeader in paymentHeaders on invoice.Id equals paymentHeader.InvoiceId
                                      join paymentHeaderDetail in paymentHeaderDetails on paymentHeader.Id equals paymentHeaderDetail.PaymentHeaderId
                                      join transactionType in transactionTypes on paymentHeaderDetail.TransactionType equals transactionType.Id
                                      select new StatementItem
                                      {
                                          clientCoverId = clientCover.Id,
                                          type = transactionType.Name,
                                          reference = invoice.ReferenceNumber,
                                          documentDate = invoice.DocumentDate,
                                          date = invoice.DocumentDate,
                                          paymentDate = paymentHeaderDetail.PaymentDate,
                                          paymentHeaderId = paymentHeaderDetail.PaymentHeaderId,
                                          paymentHeaderDetailId = paymentHeaderDetail.Id
                                      }).OrderBy(x => x.date).ToList();

                foreach (var statementItem in statementItems)
                {
                    var daysOverDue = (DateTimeHelper.SaNow - statementItem.documentDate.Value).TotalDays;
                    var itemBalance = paymentHeaderDetails.Where(x => x.Id == statementItem.paymentHeaderDetailId).Sum(x => x.Balance);
                    var oustandingAmount = paymentHeaderDetails.Where(x => x.Id == statementItem.paymentHeaderDetailId).Sum(x => x.Amount);
                    if (statementItem.type == "Payment")
                    {
                        statementItem.debitAmount = 0;
                        statementItem.creditAmount = oustandingAmount;
                        statementItem.lineBalance -= itemBalance;
                    }
                    if (statementItem.type == "Credit Note")
                    {
                        statementItem.type = "Credit Note";
                        statementItem.debitAmount = oustandingAmount;
                        statementItem.creditAmount = 0;
                        statementItem.lineBalance = itemBalance;
                    }
                    if (statementItem.type == "Invoice")
                    {
                        statementItem.debitAmount = oustandingAmount;
                        statementItem.creditAmount = 0;
                        statementItem.lineBalance = oustandingAmount;
                        statementItem.lineBalance = itemBalance;
                    }
                    if (statementItem.type == "Payment Reversal")
                    {
                        statementItem.debitAmount = oustandingAmount;
                        statementItem.creditAmount = 0;
                        statementItem.lineBalance = oustandingAmount;
                        statementItem.lineBalance = itemBalance;
                    }
                    if (statementItem.type == "Interest")
                    {
                        statementItem.debitAmount = oustandingAmount;
                        statementItem.creditAmount = 0;
                    }
                }
                return Ok(statementItems);
        }
         */
#pragma warning restore S125
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _abilityPostingAuditService.RemoveAbilityPostingAudit(id);
            return Ok();
        }
    }
}