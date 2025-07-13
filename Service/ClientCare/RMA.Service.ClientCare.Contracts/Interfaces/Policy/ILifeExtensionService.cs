using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.ClientCare.Contracts.Entities.Policy;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface ILifeExtensionService : IService
    {
        // Annual increases
        Task<int> CalculateAnnualIncreases();
        Task<int> SendQlinkUpdateTransactions();
        Task<int> ProcessAnnualIncreaseTransactions();
        Task<int> SendAnnualIncreaseNotifications(string taskHandlerName);
        Task<int> ApplyAnnualIncreases();
        Task SendAnnualIncreaseTaskNotification(string taskHandlerName, string message, bool success);

        // Premium paybacks scheduled tasks
        Task<int> CalculatePremiumPaybacks();
        Task<int> SendPremiumPaybackNotifications();
        Task<int> ProcessPaybackPayments();
        Task CompletePremiumPaybackPayment(int policyId, decimal amount);

        // Premium payback wizard
        Task<PremiumPaybackItem> ValidatePaybackBankAccount(PremiumPaybackItem payback);
        Task<PremiumPaybackItem> RejectPaybackPayment(PremiumPaybackItem payback);
        Task GeneratePolicyPremiumPaybackTask(PremiumPaybackCase @case);
        Task GeneratePolicyPremiumPaybackErrorTask(string paybackItems);
        Task SetupApprovedPremiumPayments(PremiumPaybackCase @case);
        Task SendPremiumPaybackAmount();
    }
}