using System.ComponentModel.DataAnnotations;

namespace RMA.Service.ClaimCare.Contracts.Enums
{
    public enum STPExitReasonEnum
    {
        [Display(Name = "Unknown", Description = "Reason unknown")]
        Unknown = 0,
        [Display(Name = "Member Submit", Description = "Error submitting member details(auto adjudicate)")]
        MemberSubmit = 1,
        [Display(Name = "Claim Detail", Description = "Error getting claim details(auto adjudicate)")]
        ClaimDetail = 2,
        [Display(Name = "Claim Status", Description = "Error getting claim details(auto adjudicate)")]
        ClaimStatus = 3,
        [Display(Name = "No Policy", Description = "Active Policy not found(auto adjudicate)")]
        NoPolicy = 4,
        [Display(Name = "Liability Status", Description = "Documents received after 90 days")]
        LiabilityStatus = 5,
        [Display(Name = "Stabilisation Date", Description = "Final medical report requires stabilisation date missing")]
        StabilisationDate = 6,
        [Display(Name = "Employer Wfn", Description = "Error completing employer wfn(auto adjudicate)")]
        EmployerWfn = 7,
        [Display(Name = "Img Update", Description = "Error updating imaging claimnumber(auto adjudicate)")]
        ImgUpdate = 8,
        [Display(Name = "Claim Ref Number", Description = "Error getting claim ref number(auto adjudicate)")]
        ClaimRefNumber = 9,
        [Display(Name = "Update Acknowledgement", Description = "Error acknowledging claim(auto adjudicate)")]
        UpdateAcknowledgement = 10,
        [Display(Name = "Claim Requirement", Description = "Error outstanding requirements not received(auto adjudicate)")]
        ClaimRequirement = 11,
        [Display(Name = "Check Injury", Description = "Error checking if it's a Minor Injury (auto adjudicate)")]
        CheckInjury = 12,
        [Display(Name = "Get Injury", Description = "Error getting injury details(auto adjudicate)")]
        GetInjury = 13,
        [Display(Name = "Get Policy", Description = "Error getting policy(auto adjudicate)")]
        GetPolicy = 14,
        [Display(Name = "Get Acknowledgement", Description = "Error getting acknowledgement info(auto adjudicate)")]
        GetAcknowledgement = 15,
        [Display(Name = "Injury", Description = "Severe injury added on a closed stp claim")]
        Injury = 16,
        [Display(Name = "Medical_Report", Description = "New ICD10 code mismatch - Above STP limit")]
        MedicalReport = 17,
        [Display(Name = "ICD10_Modified", Description = "Cumulative amount is greater than the stp limit")]
        ICD10Modified = 18,
        [Display(Name = "Medical_Invoice_Value", Description = "Cumulative invoice value is greater than stp limit (Not Applicable for STP)")]
        MedicalInvoiceValue = 19,
        [Display(Name = "Cumulative_Medical_Invoices", Description = "Invoices total is greater than the stp limit(Not Applicable for STP)")]
        CumulativeMedicalInvoices = 20,
        [Display(Name = "Team Lead/Claims manager", Description = "Team lead/Claims manager manually exited the claim from stp")]
        TeamLead = 21,
        [Display(Name = "TTD_Days", Description = "Days off is greater than the stp daysoff Limit")]
        TTDDays = 22,
        [Display(Name = "Check VOPD", Description = "VOPD Results not found")]
        CheckVOPD = 23,
        [Display(Name = "Get VOPD Results", Description = "VOPD Results Mismatch")]
        GetVOPDResults = 24,
        [Display(Name = "STM", Description = "STM Failed")]
        CheckSTM = 25,
        [Display(Name = "VOPD Deceased", Description = "VOPD Deceased")]
        VopdDeceased = 26,
        [Display(Name = "VOPD Mismatch", Description = "VOPD Mismatch")]
        VopdMismatch = 27,
        [Display(Name = "Claim Type", Description = "Not a Valid COID type")]
        GetClaimType = 28,
        [Display(Name = "Check Report Date", Description = "Report date > 90 days from date of injury")]
        CheckReportDate = 29,
        [Display(Name = "No VOPD Response", Description = "No VOPD Response in 48hrs")]
        NoVOPDResponse = 30,
        [Display(Name = "No Estimates", Description = "No Estimates were found for medical Report")]
        NoEstimates = 31,
        [Display(Name = "CompCare Exit", Description = "Exited STP in CompCare")]
        CompCareExit = 32,
        [Display(Name = "ImgWFN", Description = "Error completing imaging wfn(auto adjudicate)")]
        ImgWFN = 33,
        [Display(Name = "OdmwaWfn", Description = "Error sending odmwa wfn(auto adjudicate)")]
        OdmwaWfn = 34,
        [Display(Name = "CheckOdmwa", Description = "Error checking if odmwa claim(auto adjudicate)")]
        CheckOdmwa = 35,
        [Display(Name = "GetPolicySoi", Description = "Error getting policy soi(auto adjudicate)")]
        GetPolicySoi = 36,
    }
}
