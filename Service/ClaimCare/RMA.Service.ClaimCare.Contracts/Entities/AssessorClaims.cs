using RMA.Common.Entities;
using RMA.Service.Admin.SecurityManager.Contracts.Entities;

using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class AssessorClaims : AuditDetails
    {
        public List<User> Users { get; set; }
        public List<Claim> Claims { get; set; }
    }
}