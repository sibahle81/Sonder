using System;

namespace RMA.Service.Integrations.Contracts.Entities.CompCare
{

    //-============================================
    // Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse); 

    public class RootCCClaimResponse
    {
        public CCClaimResponse response { get; set; }
    }

    public class CCClaimResponse
    {
        public string claimReferenceNo { get; set; }
        public PersonEvent[] personEvents { get; set; }
        public string sourceSystemReference { get; set; }
        public string sourceSystemRoutingID { get; set; }
        public string requestGUID { get; set; }
        public string message { get; set; }
        public string code { get; set; }
    }

    public class PersonEvent
    {
        public int claimID { get; set; }
        public int employeeRolePlayerId { get; set; }
        public int employerRolePlayerId { get; set; }

        public int personEventID { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public DateTime dateOfBirth { get; set; }
        public string idNumber { get; set; }
        public string gender { get; set; }
        public string fileRefNumber { get; set; }
        public string employerName { get; set; }
        public string industryNumber { get; set; }
        public string occupation { get; set; }
        public DateTime eventDate { get; set; }
        public int eventCategoryID { get; set; }
        public bool isValid { get; set; }
    }
}