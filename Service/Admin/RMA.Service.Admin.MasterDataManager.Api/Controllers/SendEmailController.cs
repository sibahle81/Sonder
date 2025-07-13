using Microsoft.AspNetCore.Mvc;

using RMA.Common.Entities;
using RMA.Common.Web.Controllers;
using RMA.Service.Admin.CampaignManager.Contracts.Interfaces;

using System.Configuration;
using System.Text;
using System.Threading.Tasks;
using System.Linq;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RMA.Service.Admin.MasterDataManager.Api.Controllers
{
    public class SendEmailController : RmaApiController
    {
        private readonly ISendEmailService _emailer;

        public SendEmailController(ISendEmailService emailer)
        {
            _emailer = emailer;
        }

        // POST: mdm/Api/SendEmail
        [HttpPost]
        public async Task<int> Post([FromBody] SendMailRequest sendEmailRequest)
        {
            if (sendEmailRequest != null)
            {
                CleanRecipients(sendEmailRequest);
                return await _emailer.SendEmail(sendEmailRequest);
            }
            return await Task.FromResult(0);
        }

        private static void CleanRecipients(SendMailRequest sendEmailRequest)
        {
            string NormalizeEmailList(string s)
            {
                return s?.Replace(',', ';');
            }

            sendEmailRequest.Recipients = NormalizeEmailList(sendEmailRequest.Recipients);
            sendEmailRequest.RecipientsCC = NormalizeEmailList(sendEmailRequest.RecipientsCC);
            sendEmailRequest.RecipientsBCC = NormalizeEmailList(sendEmailRequest.RecipientsBCC);

            var debug = string.IsNullOrEmpty(ConfigurationManager.AppSettings["SendEmailDebug"])
                        || bool.Parse(ConfigurationManager.AppSettings["SendEmailDebug"]);
            var includeDebugEmails = !string.IsNullOrEmpty(ConfigurationManager.AppSettings["IncludeDebugEmails"]);

            if (!debug) return;

            sendEmailRequest.Recipients = RemoveNonRmaEmail(sendEmailRequest.Recipients, includeDebugEmails);
            sendEmailRequest.RecipientsCC = RemoveNonRmaEmail(sendEmailRequest.RecipientsCC, includeDebugEmails);
            sendEmailRequest.RecipientsBCC = RemoveNonRmaEmail(sendEmailRequest.RecipientsBCC, includeDebugEmails);
        }

        private static string RemoveNonRmaEmail(string emailcsv, bool includeDebug = false)
        {
            if (string.IsNullOrWhiteSpace(emailcsv)) return null;
            var sb = new StringBuilder();
            foreach (var item in from item in emailcsv.Split(';')
                                 where item.EndsWith("@randmutual.co.za", System.StringComparison.OrdinalIgnoreCase)
                                 select item)
            {
                sb.Append(item).Append(';');
            }

            if (includeDebug)
                sb.Append(ConfigurationManager.AppSettings["IncludeDebugEmails"]);

            return sb.ToString();
        }
    }
}