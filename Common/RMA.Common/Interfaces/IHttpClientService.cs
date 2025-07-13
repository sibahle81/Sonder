using RMA.Common.Entities;
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace RMA.Common.Interfaces
{
    public interface IHttpClientService
    {
        Task<HttpResponseMessage> DeleteAsync(HttpClientSettings httpClientSettings, Uri requestUri);
        Task<HttpResponseMessage> GetAsync(HttpClientSettings httpClientSettings, string requestUri);
        Task<HttpResponseMessage> PostAsync(HttpClientSettings httpClientSettings, string requestUri, HttpContent content);
        Task<HttpResponseMessage> PostAsync(HttpClientSettings httpClientSettings, string requestUri, HttpContent content, CancellationToken cancellationToken);
        Task<HttpResponseMessage> PutAsync(HttpClientSettings httpClientSettings, string requestUri, HttpContent content);
    }
}
