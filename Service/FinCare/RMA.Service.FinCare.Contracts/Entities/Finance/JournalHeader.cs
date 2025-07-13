using System.Collections.Generic;

namespace RMA.Service.FinCare.Contracts.Entities.Finance
{
    public class JournalHeader
    {
        public string Header_DescriptionOfJournal { get; set; }
        public string Header_CompanyID { get; set; }
        public string Header_JournalName { get; set; }
        public List<JournalLine> JournalLines { get; set; }
    }
}
