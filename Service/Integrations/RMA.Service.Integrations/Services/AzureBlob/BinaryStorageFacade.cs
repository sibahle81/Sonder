using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using RMA.Common.Extensions;
using RMA.Common.Service.ServiceFabric;
using RMA.Service.Admin.MasterDataManager.Contracts.Constants;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Integrations.Contracts.Entities.BlobStorage;
using RMA.Service.Integrations.Contracts.Interfaces.AzureBlob;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace RMA.Service.Integrations.Services.AzureBlob
{
    /// <summary>
    /// Provides operations for storing and retrieving documents from Azure Blob Storage.
    /// </summary>
    public class BinaryStorageFacade : RemotingStatelessService, IBinaryStorageService
    {
        private string _connectionString;
        private readonly IConfigurationService _configService;

        public BinaryStorageFacade(StatelessServiceContext context, IConfigurationService configService)
            : base(context)
        {
            _configService = configService;
        }

        /// <summary>
        /// Saves the provided document to Azure Blob Storage and returns its absolute URI.
        /// </summary>
        /// <param name="entry">The document entry containing the file data and metadata.</param>
        /// <returns>A task representing the asynchronous operation, with the blob URI as the result.</returns>
        public async Task<string> SaveDocument(DocumentEntry entry)
        {
            if (entry == null)
                return string.Empty;

            // Retrieve the connection string, checking configuration or environment variable.
            _connectionString = await GetConnectionString();

            // Validate the connection string.
            if (string.IsNullOrEmpty(_connectionString))
                throw new ArgumentNullException("Cannot SaveDocument, _connectionString for Integration:ScanCareDocumentConnectionString is null");

            // Parse the connection string to create a CloudStorageAccount.
            CloudStorageAccount account = CloudStorageAccount.Parse(_connectionString);
            CloudBlobClient blobClient = account.CreateCloudBlobClient();

            // Use the current year (lowercased) as the container name.
            string containerName = DateTimeHelper.SaNow.Year.ToString().ToLower();
            CloudBlobContainer container = blobClient.GetContainerReference(containerName);

            // Create the container if it does not exist.
            await container.CreateIfNotExistsAsync();

            // Build a unique file name.
            string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(entry.FileName);
            string fileExtension = Path.GetExtension(entry.FileName);
            string uniqueFileName = $"{fileNameWithoutExtension}_{Guid.NewGuid()}{fileExtension}";

            // Build the blob reference. If DocumentKeys contains exactly one key, include its value in the path.
            string fileReference = (entry.DocumentKeys != null && entry.DocumentKeys.Count == 1)
                ? $"{entry.SystemName}/{entry.DocumentKeys.Values.First()}/{uniqueFileName}"
                : $"{entry.SystemName}/{uniqueFileName}";

            // Get a reference to the blob.
            CloudBlockBlob blob = container.GetBlockBlobReference(fileReference);

            // Build metadata key-value pairs.
            IDictionary<string, string> metadata = new Dictionary<string, string>();
            if (!string.IsNullOrEmpty(entry.DocumentTypeName))
                metadata.Add("documentTypeName", entry.DocumentTypeName);

            metadata.Add("sourceFileName", entry.FileName);

            // Add any additional keys from DocumentKeys.
            if (entry.DocumentKeys != null)
            {
                foreach (var documentKey in entry.DocumentKeys)
                {
                    if (!string.IsNullOrEmpty(documentKey.Value))
                        metadata.Add(documentKey.Key, documentKey.Value);
                }
            }

            // Apply metadata to the blob.
            foreach (var kvp in metadata)
            {
                blob.Metadata.Add(kvp.Key, kvp.Value);
            }

            // Upload the document's byte array to the blob.
            await blob.UploadFromByteArrayAsync(entry.Data, 0, entry.Data.Length);

            // Set the content type based on the file extension.
            blob.Properties.ContentType = MimeMapping.GetMimeMapping(entry.FileName);
            await blob.SetPropertiesAsync();

            // Return the absolute URI of the stored blob.
            return blob.Uri.ToString();
        }

        /// <summary>
        /// Retrieves a document from Azure Blob Storage using its URI.
        /// </summary>
        /// <param name="uri">The URI of the document to retrieve.</param>
        /// <returns>A task representing the asynchronous operation, with the document entry as the result.</returns>
        public async Task<DocumentEntry> GetDocument(string uri)
        {
            _connectionString = await GetConnectionString();

            // Validate the connection string.
            if (string.IsNullOrEmpty(_connectionString))
                throw new ArgumentNullException("Cannot GetDocument, _connectionString for Integration:ScanCareDocumentConnectionString is null");

            CloudStorageAccount account = CloudStorageAccount.Parse(_connectionString);
            CloudBlobClient serviceClient = account.CreateCloudBlobClient();
            // Retrieve a reference to the blob from the server.
            ICloudBlob docRef = await serviceClient.GetBlobReferenceFromServerAsync(new Uri(uri));

            DocumentEntry entry = new DocumentEntry();
            using (var ms = new MemoryStream())
            {
                // Download the blob content into a memory stream.
                await docRef.DownloadToStreamAsync(ms);
                entry.Data = ms.ToArray();
            }

            // Extract metadata values.
            entry.DocumentTypeName = docRef.Metadata.ContainsKey("documentTypeName") ? docRef.Metadata["documentTypeName"] : string.Empty;
            entry.FileName = docRef.Metadata.ContainsKey("sourceFileName") ? docRef.Metadata["sourceFileName"] : string.Empty;
            // Optionally, assign the full metadata dictionary.
            entry.DocumentKeys = docRef.Metadata;

            return entry;
        }

        /// <summary>
        /// Retrieves the Azure Blob Storage connection string from configuration or environment.
        /// </summary>
        /// <returns>A task representing the asynchronous operation, with the connection string as the result.</returns>
        private async Task<string> GetConnectionString()
        {
            if (string.IsNullOrEmpty(_connectionString))
            {
                _connectionString = await _configService.GetModuleSetting(SystemSettings.IntegrationScanCareDocumentConnectionString)
                                                        .ConfigureAwait(false);
            }

            // Fallback: try environment variable if configuration is missing.
            if (string.IsNullOrEmpty(_connectionString))
                _connectionString = Environment.GetEnvironmentVariable("IntegrationsSBConnectionString");

            return _connectionString;
        }

        /// <summary>
        /// Moves a blob to a new virtual path *inside the same container* and
        /// returns the new absolute URI.
        /// </summary>
        public async Task<string> MoveBlobAsync(string oldUri, string newRelativePath, IDictionary<string, string> metadata)
        {
            var account = CloudStorageAccount.Parse(await GetConnectionString());
            var client = account.CreateCloudBlobClient();

            // old -----------------------------------------------------------
            var oldBlob = await client.GetBlobReferenceFromServerAsync(new Uri(oldUri));

            var container = oldBlob.Container;           // same container – cheap
            var newBlob = container.GetBlockBlobReference(newRelativePath);

            // start server-side copy & wait
            await newBlob.StartCopyAsync(oldBlob.Uri);
            while (newBlob.CopyState.Status == CopyStatus.Pending)
                await Task.Delay(250);                   // tiny poll loop is enough

            if (newBlob.CopyState.Status != CopyStatus.Success)
                throw new InvalidOperationException($"Copy failed: {newBlob.CopyState.StatusDescription}");

            // merge extra metadata (identifier, etc.)
            if (metadata != null)
                foreach (var kv in metadata)
                    newBlob.Metadata[kv.Key] = kv.Value;

            await newBlob.SetMetadataAsync();

            // delete the source
            await oldBlob.DeleteIfExistsAsync();

            return newBlob.Uri.ToString();
        }

    }
}
