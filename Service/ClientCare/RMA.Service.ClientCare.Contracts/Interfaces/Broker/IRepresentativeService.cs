using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClientCare.Contracts.Entities.Broker;
using RMA.Service.Integrations.Contracts.Entities.Fspe;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Broker
{
    public interface IRepresentativeService : IService
    {
        Task<Representative> GetRepresentative(int id);
        Task<Representative> GetRepresentativeReferenceData(int id);
        Task<List<Representative>> GetRepresentatives();
        Task<int> AddRepresentative(Representative broker);
        Task EditRepresentative(Representative broker);
        Task LinkRepresentative(LinkAgent representative);
        Task<List<Representative>> SearchRepresentative(string query);
        Task<List<Representative>> SearchNaturalRepresentatives(string query);
        Task<PagedRequestResult<Representative>> SearchRepresentatives(PagedRequest request);
        Task<List<Representative>> GetRepresentativeByBrokerageId(int brokerageId);
        Task<List<Representative>> GetRepresentativesByJuristicRepId(int representativeId);
        Task<List<Representative>> GetJuristicRepresentatives(List<int> brokerageIds);
        Task<List<RepEntity>> GetRepresentativeByBrokerageIdForRepEnity(int brokerageId);
        Task<List<Brokerage>> GetBrokeragesForRepresentative(int representativeId);
        Task<List<Contracts.Entities.Product.Product>> GetProductsRepCanSell(int representativeId, int brokerageId);
        Task<List<Brokerage>> GetBrokeragesEligibleToReceiveRepresentativePolicies(int representativeId, List<int> productIds);
        Task<bool> IsRepAllowedToSellProducts(int representativeId, List<int> productIds);
        Task<List<Representative>> GetJuristicRepresentativesByIds(List<int> representativeIds);
        Task<Representative> GetRepresentativeWithNoRefData(int id);
        Task<List<ContactPerson>> GetInternalAndExternalContactsByRepId(int repId);
        Task<List<Representative>> GetJuristicRepresentativesActivePolicies();
        Task<BrokerPartnership> GetBrokerPartnership(int brokerageId);
        Task<BrokerPartnership> GetBrokerPartnershipByPolicyId(int policyId);
        Task<List<BrokerPartnership>> GetBrokerPartnerships(List<int> brokerageIds);
    }
}