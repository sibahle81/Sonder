using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System.Collections.Generic;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{
    public class ValidityCheckCategory
    {
        public int Id { get; set; } // Id (Primary key)
        public string Name { get; set; } // Name (length: 50)
        public ValidityCheckTypeEnum ValidityCheckType { get; set; } // ValidityCheckTypeId

        public virtual List<ValidityCheckSet> ValidityCheckSets { get; set; }

    }
}
