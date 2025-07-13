using Microsoft.ServiceFabric.Services.Remoting;

using System;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IOnboardingNotificationService : IService
    {
        Task SendPremiumListingNewPolicyNotification(string wizardName, Guid fileIdentifier);
        Task<bool> SendConsolidatedFuneralNewPolicyNotifications(string wizardName, Guid fileIdentifier);
        Task SendQlinkErrorNotification(string policyNumber, string errorMessage);
        Task SendMyValuePlusNewPolicyNotifications(string wizardName, Guid fileIdentifier);
    }
}
