using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.MediCare.Contracts.Entities.Medical;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.MediCare.Contracts.Interfaces.Medical
{
    public interface IHealthCareProviderService : IService
    {
        Task<HealthCareProvider> GetHealthCareProviderById(int healthCareProviderId);
        Task<HealthCareProvider> SearchHealthCareProviderByPracticeNumber(string practiceNumber);
        Task<List<HealthCareProvider>> GetHealthCareProviders();
        Task<List<HealthCareProvider>> GetJvHealthCareProviders();
        Task<int> AddHealthCareProvider(HealthCareProvider healthCareProvider);
        Task<int> EditHealthCareProvider(HealthCareProvider healthCareProvider);
        Task<PagedRequestResult<HealthCareProvider>> SearchHealthCareProviders(PagedRequest request);

        Task<PagedRequestResult<HealthCareProvider>> SearchHealthCareProvidersForInvoiceReports(PagedRequest request);
        Task<List<HealthCareProvider>> FilterHealthCareProviders(string searchString);
        Task<bool> IsHcpHospital(string searchString);
        Task<int> GetHealthCareProviderAgreedTariff(int healthCareProviderId, bool isChronic, DateTime serviceDate);
        Task<string> GetHealthCareProviderAgreedTariffTypeIds(int healthCareProviderId, bool isChronic, DateTime serviceDate);
        Task<decimal> GetHealthCareProviderVatAmount(bool isVatRegistered, DateTime invoiceDate);
        Task<bool> IsRequireMedicalReport(int healthCareProviderId);
        Task<HealthCareProvider> GetHealthCareProviderByIdForSTPIntegration(int healthCareProviderId);
        Task<List<HealthCareProvider>> FilterHealthCareProvidersLinkedToExternalUser(string searchString);
        Task<PagedRequestResult<HealthCareProvider>> GetPagedHealthCareProviders(PagedRequest pagedRequest);
    }
}
