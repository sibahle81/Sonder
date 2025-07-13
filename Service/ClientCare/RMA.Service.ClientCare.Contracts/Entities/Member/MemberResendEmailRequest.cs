using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Member
{
    public class MemberResendEmailRequest
    {
        public List<RolePlayerContact> RolePlayerContacts { get; set; }
    }
}
