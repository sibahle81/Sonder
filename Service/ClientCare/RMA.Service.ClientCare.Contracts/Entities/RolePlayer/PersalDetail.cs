using System;

namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class PersalDetail
    {
        public int RolePlayerPersalDetailId { get; set; }

        public int RolePlayerId { get; set; }

        public string PersalNumber { get; set; }

        public string Employer { get; set; }

        public string Department { get; set; }

        public bool IsDeleted { get; set; }

        public string PayrollCode { get; set; }

        public string CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public string ModifiedBy { get; set; }

        public DateTime ModifiedDate { get; set; }
    }
}
