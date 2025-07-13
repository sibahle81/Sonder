namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class PersonEventAssaultDetail
    {

        public int PersonEventAssaultDetailId { get; set; }
        public int PersonEventId { get; set; }
        public System.DateTime DateOfEvent { get; set; }
        public System.DateTime TimeOfEvent { get; set; }
        public string AssaultLocation { get; set; }
        public string NameOfEmployee { get; set; }
        public string IndustrNumber { get; set; }
        public string CompanyNumber { get; set; }
        public string DetailsOfInjury { get; set; }
        public string AssailantNameOfEmployee { get; set; }
        public string AssailantIndustrNumber { get; set; }
        public string AssailantCompanyNumber { get; set; }
        public bool? SignedInjuredEmployeeStatement { get; set; }
        public bool? SignedAssaultStatement { get; set; }
        public bool? SignedWitnessStatement { get; set; }
        public bool? EmployerInvestigationReport { get; set; }
        public bool? SapsReport { get; set; }
        public bool? MineManagerRecommensation { get; set; }
    }
}
