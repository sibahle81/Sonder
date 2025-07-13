using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities;
using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.ClientCare.Contracts.Entities.Product;
using RMA.Service.Integrations.Contracts.Entities.Fspe;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Broker
{
    public interface IBrokerageService : IService
    {
        Task<Brokerage> GetBrokerage(int id);
        Task<Brokerage> GetBrokerageBasicReferenceData(int id);
        Task<Brokerage> GetBrokerageByFSPNumber(string fspNumber);
        Task<Brokerage> GetFspFromFsb(string fspNumber, bool wizardRequest, string brokercode);
        Task<List<Brokerage>> GetBrokerages();
        Task<PagedRequestResult<Brokerage>> SearchBrokerages(PagedRequest request, bool isBinderPartnerSearch);
        Task<PagedRequestResult<BrokerConsultant>> GetBrokerConsultants(PagedRequest request);
        Task EditBrokerage(Brokerage brokerage);
        Task<List<string>> ValidationCompany(string fspNumber, string registrationNumber);
        Task<List<string>> ValidateRepresentatives(string fspNumber, List<Representative> representatives);
        Task RefreshFspData();
        Task<List<Lookup>> GetBrokeragesByCoverTypeIds(List<int> coverTypes);
        Task<BrokerageBankAccount> GetBrokerageBankAccount(int id);
        Task<RepresentativeBankAccount> GetRepresentativeBankAccount(int id);
        Task<Brokerage> GetBrokerageWithoutReferenceData(int id);
        Task<List<Brokerage>> GetBrokerageAndContactByIds(List<int> ids);
        Task<bool> SendBrokerageWelcomeLetter(Brokerage brokerage);
        Task<Brokerage> GetBrokerageImportRequestDetails(string fspNumber);
        Task<bool> SubmitFSPDataImportRequest(BrokerageRepresentativeRequest request);
        Task ProcessFSPDataImportResponse(string claimCheckReference);
        Task GetAllFromSubscriptionList();
        Task<Brokerage> GetBrokerageByUserId(int userId);
        Task<List<string>> GetBrokeragesWithAllOption();
        Task<Brokerage> GetBrokerageAndRepresentativesByFSPNumber(string fspNumber);
        Task<List<string>> GetBrokersLinkedtoClaims(string productOptionName);
        Task<Brokerage> GetBrokerageByUserEmail(string userEmail);
        Task<BrokerageModel> GetByFSPNumber(string fspNumber);
        Task<bool> ProcessFSPDataImportResponseList(List<Fsp> fsps);
        Task<List<ProductOptionConfiguration>> GetProductOptionConfigurationsByOptionTypeId(int optionTypeId, int brokerageId, DateTime? effectiveDate);
        Task<List<ProductOptionConfiguration>> GetProductOptionConfigurationsByBrokerageId(int brokerageId, DateTime? effectiveDate);
        Task<List<ProductOptionConfiguration>> GetProductOptionConfigurationsByProductOptionId(int productOptionId, DateTime? effectiveDate);
    }
}