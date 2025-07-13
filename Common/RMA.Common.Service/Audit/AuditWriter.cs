using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using RMA.Common.Security;
using RMA.Common.Service.ServiceBus.Producers;

using System;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Common.Service.Audit
{
    public class AuditWriter : IAuditWriter
    {
        public const string AuditQueueName = "mcc.audit.auditlog";
        public const string ListenerQueueName = "mcc.audit.lastviewed";
        public const string ProductOption = "product_ProductOption";

        public const string Product = "product_Product";

        public const string ProductBenefit = "product_Benefit";

        public const string BackendProcess = "BackendProcess";
        public const string UserPreference = "security_UserPreference";
        public const string PremiumListing = "Load_PremiumListing";
        public const string Wizard = "bpm_Wizard";
        public const string SuperMagicSecretClaim = "SuperMagicSecretClaim";
        public const string Permission = "permission";

        private static readonly string[] EnforceAuditingOnTheseEntities
            = new string[] { "payment_Payment", "commission_Header" };

        public Task AddAudit<TEntity>(int id, string action, string oldItem, string newItem)
        {
            try
            {
                return AddAudit(id, typeof(TEntity), action, oldItem, newItem);
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
            return Task.FromResult(true);
        }

        public async Task AddAudit(int id, Type itemType, string action, string oldItem, string newItem)
        {
            string itemTypeName = string.Empty;
            if (itemType != null)
                itemTypeName = GetItemTypeName(itemType);

            if (SkipAudit(itemTypeName)) return;

            //Send messages to service bus to remove the write delay from the main transaction.
            //messages will be sent to the audit log listener 
            var producer = new ServiceBusQueueProducer<AuditLogEntry>(AuditQueueName);

            await producer.PublishMessageAsync(new AuditLogEntry()
            {
                Action = action,
                CorrelationToken = RmaIdentity.TraceId,
                Date = DateTimeHelper.SaNow,
                ItemId = id,
                ItemType = itemTypeName,
                OldItem = oldItem,
                NewItem = newItem,
                Username = RmaIdentity.Username
            });
        }

        public async Task AddLastViewed<TEntity>(int id)
        {
            try
            {
                await AddLastViewed(id, typeof(TEntity));
            }
            catch (Exception ex)
            {
                ex.LogException();
            }
        }

        public async Task AddLastViewed(int id, Type itemType)
        {
            string itemTypeName = string.Empty;

            if (itemType != null)
                itemTypeName = GetItemTypeName(itemType);

            if (SkipAudit(itemTypeName)) return;

            var producer = new ServiceBusQueueProducer<LastViewedEntry>(ListenerQueueName);
            await producer.PublishMessageAsync(new LastViewedEntry()
            {
                Date = DateTimeHelper.SaNow,
                ItemId = id,
                ItemType = itemTypeName,
                Username = RmaIdentity.Username
            });
        }

        private static bool SkipAudit(string itemTypeName)
        {
            if (string.IsNullOrEmpty(itemTypeName))
                return true;

            if (itemTypeName.StartsWith("audit_", StringComparison.OrdinalIgnoreCase))
                return true;

            if (itemTypeName == Wizard)
                return true;
            if (itemTypeName == PremiumListing)
                return true;
            if (itemTypeName == UserPreference)
                return true;
            if (itemTypeName == ProductOption)
                return true;

            if (itemTypeName == Product)
                return true;

            if (itemTypeName == ProductBenefit)
                return true;

            if (RmaIdentity.CurrentIdentity.FindAll(Permission).Any(t => t.Value == SuperMagicSecretClaim))
                return false;

            if (EnforceAuditingOnTheseEntities.Contains(itemTypeName))
                return false;

            if (RmaIdentity.Username == BackendProcess)
                return true;

            return false;
        }

        private static string GetItemTypeName(Type itemType)
        {
            return itemType.Name;
        }
    }
}
