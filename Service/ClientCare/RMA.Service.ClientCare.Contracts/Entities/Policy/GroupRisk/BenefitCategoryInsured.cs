using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy.GroupRisk
{
    public class BenefitCategoryInsured
    {
        public int PersonInsuredCategoryId { get; set; } // CategoryInsuredId (Primary key)
        public int InsuredSumAssuredId { get; set; } // InsuredSumAssuredId (Primary key)
    }
}
