using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClaimCare.Contracts.Entities;
using RMA.Service.ClientCare.Contracts.Entities.MediCare;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClaimCare.Contracts.Interfaces.Claim
{
    public interface IMedicalInvoiceClaimService : IService
    {
        Task<MedicalInvoiceClaim> GetMedicalInvoiceClaim(string claimReferenceNumber);
        Task<MedicalInvoiceClaim> GetMedicalInvoiceClaimByPersonEventId(int personEventId);
        Task<List<MedicalInvoiceInjury>> GetMedicalInvoiceClaimInjury(int personEventId);
        Task<List<MedicalInvoiceInjury>> GetMedicalInvoiceClaimSecondaryInjuries(int personEventId);
        Task<string> GetClaimReferenceNumberByPersonEventId(int personEventId);
        Task<int> GetPersonEventIdByClaimReferenceNumber(string claimReferenceNumber);
        Task<bool> ValidateMedicalBenefit(int claimId, DateTime invoiceDate);
        Task<List<PersonEventAccidentDetail>> GetPersonEventAccidentDetailsByEventId(int eventId);
        Task<PagedRequestResult<MedicalSwitchBatchSearchPersonEvent>> GetSearchMedicalSwitchBatchPersonEvent(PagedRequest request);
        Task<bool> CheckIsStpClaim(int personEventId);
        Task<bool> IsChronic(int personEventId, DateTime invoiceDate);
        Task<ClaimDetailsForSTPIntegration> GetClaimDetailsForSTPIntegration(string claimReferenceNumber);
        Task<bool> CheckClaimMedicalBenefitsExistForSTPIntegration(string claimReferenceNumber);
        Task<List<MedicalInvoiceInjury>> GetClaimInjuryDetailsForSTPIntegration(string claimReferenceNumber);
        Task<bool> CreateClaimMedicalReport(MedicalReport medicalReport);
        Task<List<MedicalReport>> GetClaimMedicalReport(int personEventId);
        Task<MedicalReport> GetSickNoteByMedicalReportId(int medicalReportId);
        Task<bool> UpdateSickNote(MedicalReport medicalReport);
    }
}
