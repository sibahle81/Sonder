using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RMA.Common.Entities
{
    public class LookupValue
    {
        public int LookupValueId { get; set; } // LookupValueID (Primary key)
        public int LookupTypeId { get; set; } // LookupTypeID
        public System.DateTime StartDate { get; set; } // StartDate
        public System.DateTime EndDate { get; set; } // EndDate
        public decimal? Value { get; set; } // Value
    }
}
