using System.Collections.Generic;
using Microsoft.ServiceFabric.Services.Remoting;

using RMA.Service.Integrations.Contracts.Entities.BlobStorage;

using System.Threading.Tasks;

namespace RMA.Service.Integrations.Contracts.Interfaces.AzureBlob
{
    public interface IBinaryStorageService : IService
    {
        /// <summary>
        /// Saves the provided document to Azure Blob Storage and returns its absolute URI.
        /// </summary>
        /// <param name="entry">The document entry containing the file data and metadata.</param>
        /// <returns>A task representing the asynchronous operation, with the blob URI as the result.</returns>
        Task<string> SaveDocument(DocumentEntry entry);

        /// <summary>
        /// Retrieves a document from Azure Blob Storage using its URI.
        /// </summary>
        /// <param name="uri">The URI of the document to retrieve.</param>
        /// <returns>A task representing the asynchronous operation, with the document entry as the result.</returns>
        Task<DocumentEntry> GetDocument(string uri);

        /// <summary>
        /// Moves a blob to a new virtual path *inside the same container* and
        /// returns the new absolute URI.
        /// </summary>
        Task<string> MoveBlobAsync(string oldUri, string newRelativePath, IDictionary<string, string> metadata);
    }
}
