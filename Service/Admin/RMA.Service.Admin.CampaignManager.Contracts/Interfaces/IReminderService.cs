using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Admin.CampaignManager.Contracts.Entities;

using System.Threading.Tasks;

namespace RMA.Service.Admin.CampaignManager.Contracts.Interfaces
{
    public interface IReminderService : IService
    {
        Task<Reminder> GetCampaignReminder(int campaignId);
        Task<int> AddCampaignReminder(Reminder reminder);
        Task EditCampaignReminder(Reminder reminder);
        Task<int> SendReminders();
    }
}