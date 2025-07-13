using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Client
{
    public class CommunicationPreference
    {
        public int ClientId { get; set; }
        public CommunicationTypeEnum CommunicationType { get; set; }

        public int CommunicationTypeId
        {
            get => (int)CommunicationType;
            set => CommunicationType = (CommunicationTypeEnum)value;
        }
    }
}
