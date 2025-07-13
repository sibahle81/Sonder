using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Common.Entities.DatabaseQuery;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.Contracts.Interfaces.Policy
{
    public interface IDiscountFileListingService : IService
    {
        Task<List<string>> ImportDiscountFileListing(string fileName, FileContentImport content);
        Task<DiscountFile> GetDiscountFilesUploaded();
        Task<PagedRequestResult<DiscountFileListing>> GetPagedDiscountFileListings(PagedRequest request, Guid fileIdentifier);
    }
}
