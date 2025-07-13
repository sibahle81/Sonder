using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class LinkedUserMember
    {
        public int RolePlayerId { get; set; }
        public string MemberName { get; set; }
        public string FinPayeNumber { get; set; }
        public UserCompanyMapStatusEnum UserCompanyMapStatus { get; set; }
        public int RoleId { get; set; }
    }
}