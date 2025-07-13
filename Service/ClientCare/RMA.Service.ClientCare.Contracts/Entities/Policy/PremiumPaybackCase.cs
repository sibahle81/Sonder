using System.Collections.Generic;

namespace RMA.Service.ClientCare.Contracts.Entities.Policy
{
    public class PremiumPaybackCase
    {
        public List<PremiumPaybackItem> PaybackItems { get; set; }

        public PremiumPaybackCase()
        {
            PaybackItems = new List<PremiumPaybackItem>();
        }
    }
}
