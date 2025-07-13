using System.ComponentModel.DataAnnotations;

namespace RMA.Service.Admin.CampaignManager.Contracts.Enums
{
    public enum EmailTemplate
    {

        [Display(Name = "Standard Newsletter")]
        StandardNewsletter = 1,
        [Display(Name = "Claim Individual Email")]
        ClaimIndividualEmail = 2,
        [Display(Name = "Claim Group Email")]
        ClaimGroupEmail = 3,
        [Display(Name = "Claim Additional Document")]
        ClaimAdditionalDocument = 4,
        [Display(Name = "SLA Breach Email")]
        SLABreachEmail = 5,
        [Display(Name = "Claim  Policy Continuation Email")]
        ClaimPolicyContinuationEmaill = 6,
        [Display(Name = "Claim Document Rejection")]
        ClaimDocumentRejection = 33,
        [Display(Name = "Welcome letter Email")]
        WelcomeletterEmail = 75
    }
}






