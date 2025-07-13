using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Common.Interfaces;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;

namespace RMA.Common.Service.Services
{
    public class HttpClientFacade : IHttpClientService
    {
        private readonly List<HttpClientWithLastTimeUsed> _httpClientsWithLastTimeUsed = new List<HttpClientWithLastTimeUsed>();
        private System.Timers.Timer _timerToRemoveUnusedHttpClients;
        

        public HttpClientFacade()
        {
            SetTimerToRemoveUnusedHttpClients();
        }

        public Task<HttpResponseMessage> DeleteAsync(HttpClientSettings httpClientSettings, Uri requestUri)
        {
            if (httpClientSettings == null)
                httpClientSettings = new HttpClientSettings();
            HttpClient httpClient = GetHttpClient(httpClientSettings);
            return httpClient.DeleteAsync(requestUri);
        }

        public Task<HttpResponseMessage> GetAsync(HttpClientSettings httpClientSettings, string requestUri)
        {
            if (httpClientSettings == null)
                httpClientSettings = new HttpClientSettings();
            HttpClient httpClient = GetHttpClient(httpClientSettings);
            return httpClient.GetAsync(requestUri);
        }

        public Task<HttpResponseMessage> PostAsync(HttpClientSettings httpClientSettings, string requestUri, HttpContent content)
        {
            if (httpClientSettings == null)
                httpClientSettings = new HttpClientSettings();
            HttpClient httpClient = GetHttpClient(httpClientSettings);
            return httpClient.PostAsync(requestUri, content);
        }

        public Task<HttpResponseMessage> PostAsync(HttpClientSettings httpClientSettings, string requestUri, HttpContent content, CancellationToken cancellationToken)
        {
            if (httpClientSettings == null)
                httpClientSettings = new HttpClientSettings();
            HttpClient httpClient = GetHttpClient(httpClientSettings);
            return httpClient.PostAsync(requestUri, content, cancellationToken);
        }

        public Task<HttpResponseMessage> PutAsync(HttpClientSettings httpClientSettings, string requestUri, HttpContent content)
        {
            if (httpClientSettings == null)
                httpClientSettings = new HttpClientSettings();
            HttpClient httpClient = GetHttpClient(httpClientSettings);
            return httpClient.PutAsync(requestUri, content);
        }

        private HttpClient GetHttpClient(HttpClientSettings httpClientSettings)
        {
            HttpClientWithLastTimeUsed httpClientWithLastTimeUsed = _httpClientsWithLastTimeUsed.
                Where(c => c.HttpClient.BaseAddress == httpClientSettings.BaseAddress).
                Where(c => c.HttpClient.DefaultRequestHeaders.Where(h => h.Key != "Authorization" && h.Key != "Accept").Sum(h => h.Value.ToList().Count) == httpClientSettings.RequestHeaders.Count).
                Where(c => c.HttpClient.DefaultRequestHeaders.Accept.Count == httpClientSettings.MediaTypes.Count).
                Where(c => c.HttpClient.DefaultRequestHeaders.Accept.All(a => httpClientSettings.MediaTypes.Any(m => m == a.MediaType))).
                Where(c => httpClientSettings.RequestHeaders.All(r => c.HttpClient.DefaultRequestHeaders.Any(h => h.Key == r.Key && h.Value.Any(v => v == r.Value)))).
                Where(c => c.HttpClient.DefaultRequestHeaders.Authorization?.Scheme == httpClientSettings.DefaultRequestHeaderAuthorization?.Scheme &&
                           c.HttpClient.DefaultRequestHeaders.Authorization?.Parameter == httpClientSettings.DefaultRequestHeaderAuthorization?.Parameter).
                FirstOrDefault();
            if (httpClientWithLastTimeUsed == null)
            {
                var httpClient = new HttpClient();
                if (httpClientSettings.BaseAddress != null)
                    httpClient.BaseAddress = httpClientSettings.BaseAddress;
                httpClient.DefaultRequestHeaders.Accept.Clear();
                foreach (var header in httpClientSettings.RequestHeaders)
                    httpClient.DefaultRequestHeaders.Add(header.Key, header.Value);
                foreach (var mediaType in httpClientSettings.MediaTypes)
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(mediaType));
                if (httpClientSettings.DefaultRequestHeaderAuthorization != null)
                    httpClient.DefaultRequestHeaders.Authorization = httpClientSettings.DefaultRequestHeaderAuthorization;
                httpClientWithLastTimeUsed = new HttpClientWithLastTimeUsed()
                {
                    HttpClient = httpClient,
                    LastTimeUsed = DateTime.Now
                };
                _httpClientsWithLastTimeUsed.Add(httpClientWithLastTimeUsed);
            }
            else
                httpClientWithLastTimeUsed.LastTimeUsed = DateTime.Now;
            return httpClientWithLastTimeUsed.HttpClient;
        }

        private void SetTimerToRemoveUnusedHttpClients()
        {
            try
            {
                var checkPeriodInHours = Environment.GetEnvironmentVariable("HttpClientServiceCheckPeriodInHours").ToInt(24);
                if (checkPeriodInHours > 0)
                {
                    TimeSpan timeSpan = new TimeSpan(checkPeriodInHours, 0, 0);
                    _timerToRemoveUnusedHttpClients = new System.Timers.Timer(timeSpan.TotalMilliseconds);
                    _timerToRemoveUnusedHttpClients.Elapsed += RemoveUnusedHttpClients;
                    _timerToRemoveUnusedHttpClients.AutoReset = false;
                    _timerToRemoveUnusedHttpClients.Enabled = true;
                }
            }
            catch (Exception ex)
            {
                ex.LogException($"SetTimerToRemoveUnusedHttpClients > Message: {ex.Message}");
            }
        }

        private void RemoveUnusedHttpClients(Object source, ElapsedEventArgs e)
        {
            SetTimerToRemoveUnusedHttpClients();
            try
            {
                var checkPeriodInHours = Environment.GetEnvironmentVariable("HttpClientServiceCheckPeriodInHours").ToInt(24);
                TimeSpan timeSpan = new TimeSpan(checkPeriodInHours, 1, 0);
                DateTime cutOffTime = DateTime.Now - timeSpan;
                var unusedHttpClients = _httpClientsWithLastTimeUsed.Where(c => c.LastTimeUsed < cutOffTime).ToList();
                unusedHttpClients.ForEach(c =>
                {
                    _httpClientsWithLastTimeUsed.Remove(c);
                    c.HttpClient.Dispose();
                });
                if (_httpClientsWithLastTimeUsed.Count > 1000)
                    Log.Warning(@"Number of HttpClients: {count}", _httpClientsWithLastTimeUsed.Count);
                else
                    Log.Information(@"Number of HttpClients: {count}", _httpClientsWithLastTimeUsed.Count);
            }
            catch (Exception ex)
            {
                ex.LogException($"RemoveUnusedHttpClients > Message: {ex.Message}");
            }
        }

        ~HttpClientFacade()
        {
            _httpClientsWithLastTimeUsed.ForEach(c => c.HttpClient.Dispose());
        }

        private class HttpClientWithLastTimeUsed
        {
            public HttpClient HttpClient { get; set; }
            public DateTime LastTimeUsed { get; set; }
        }
    }
}