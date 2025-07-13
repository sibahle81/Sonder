using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class ClaimBucketClass
    {

        public ClaimBucketClass()
        {
            PersonEvents = new List<PersonEvent>();
        }

        public int ClaimBucketClassId { get; set; } // ClaimBucketClassId (Primary key)
        public string Name { get; set; } // Name (length: 255)
        public string Description { get; set; } // Description (length: 500)
        public InjurySeverityTypeEnum? InjurySeverityType { get; set; } // InjurySeverityId

        public List<PersonEvent> PersonEvents { get; set; }
        public ProductClassEnum? ProductClass { get; set; }
    }
}
