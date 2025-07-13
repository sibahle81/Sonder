using Microsoft.ServiceFabric.Services.Remoting;
using RMA.Service.Admin.MasterDataManager.Contracts.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Interfaces
{
    public interface IContactValidationService : IService
    {
        Task<EmailInfo> ValidateEmailAddress(string emailAddress);

        Task<List<EmailInfo>> ValidateEmailAddresses(List<string> emailAddresses);

        Task<bool> IsValidMobileNumber(string mobileNumber);

        Task<List<string>> GetCellPhonePrefixesForRSA();

        Task<List<string>> GetCellPhonePrefixes(string countryCode);
    }
}
