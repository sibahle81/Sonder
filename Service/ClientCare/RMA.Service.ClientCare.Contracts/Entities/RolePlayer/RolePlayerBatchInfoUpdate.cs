using RMA.Common.Entities;
namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerBatchInfoUpdate : ServiceBusMessageBase
    {
        public int BatchId { get; set; }
    }
}
