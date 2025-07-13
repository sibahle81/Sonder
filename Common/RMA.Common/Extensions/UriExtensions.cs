using System;
using System.Net;
using System.Threading.Tasks;

namespace RMA.Common.Extensions
{
    public static class UriExtensions
    {
        private const string backgroundProcessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMjA2IiwidXNlcm5hbWUiOiJqdmFuenlsQHJhbmRtdXR1YWwuY28uemEiLCJyb2xlSWQiOiIxIiwidXNlclR5cGVJZCI6IjIiLCJuYW1lIjoiSnViYmEgVGVzdCIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIiwiZW1haWwiOiJqdmFuenlsQHJhbmRtdXR1YWwuY28uemEiLCJ0b2tlbiI6ImEwMDJhZDZlLWE1MTEtNDY2Yi1hNTIwLTNlZjAxMTMxOWMzNCIsImlwZEFkZHJlc3MiOiIxMC4xMC4zNC44IiwidG9rZW5fdXNhZ2UiOiJhY2Nlc3NfdG9rZW4iLCJqdGkiOiJiZmFhNTkzYS1jNmIwLTRkYWUtOGI0ZC1iNzA1YmYzZjM5ZDEiLCJzY29wZSI6WyJvcGVuaWQiLCJlbWFpbCIsInByb2ZpbGUiLCJvZmZsaW5lX2FjY2VzcyJdLCJhdWQiOlsiUm1hU0YuQW5ndWxhckNsaWVudCIsIlJtYVNGLkFwaURvY3MiLCJSbWFTRi5BdWRpdEFwaSIsIlJtYVNGLkJpbGxpbmdBcGkiLCJSbWFTRi5CdXNpbmVzc1Byb2Nlc3NNYW5hZ2VyQXBpIiwiUm1hU0YuQ2FtcGFpZ25NYW5hZ2VyQXBpIiwiUm1hU0YuQ2xhaW1DYXJlQXBpIiwiUm1hU0YuQ2xpZW50Q2FyZUFwaSIsIlJtYVNGLkZpbkNhcmVBcGkiLCJSbWFTRi5JbnRlZ3JhdGlvbkFwaSIsIlJtYVNGLkludGVncmF0aW9uc0FwaSIsIlJtYVNGLk1hc3RlckRhdGFBcGkiLCJSbWFTRi5NZWRpQ2FyZUFwaSIsIlJtYVNGLlBlbnNDYXJlQXBpIiwiUm1hU0YuUmVwb3J0aW5nU2VydmljZXMiLCJSbWFTRi5SdWxlc01hbmFnZXJBcGkiLCJSbWFTRi5TY2FuQ2FyZUFwaSIsIlJtYVNGLlNlY3VyaXR5QXBpIiwiUm1hU0YuU3dhZ2dlckFwaSJdLCJuYmYiOjE1ODU1MDk1MTIsImV4cCI6MTU4NTUxMzExMiwiaWF0IjoxNTg1NTA5NTEyLCJpc3MiOiJodHRwczovL3Nmc3Rlc3QucmFuZG11dHVhbC5jby56YS9hdXRoIn0.V3fQw9AU5bRQo00CVukkQtd68pDgvCFpFhU-1Y-n47k";

        public static async Task<byte[]> GetUriDataAsync(this Uri url, WebHeaderCollection headerCollection = null)
        {
            try
            {
                byte[] byteData;

                if (headerCollection == null || (headerCollection?.Get("Authorization")?.Length < 1000))
                {
                    headerCollection = new WebHeaderCollection
                    {
                        { "Authorization", "Bearer " + backgroundProcessToken }
                    };
                }

                using (var client = new WebClient())
                {
                    client.Headers.Clear();
                    client.Headers.Add(headerCollection);
                    client.UseDefaultCredentials = true;
                    byteData = await client.DownloadDataTaskAsync(url);
                }

                return byteData;
            }
            catch (Exception ex)
            {
                ex.LogException();
                return Array.Empty<byte>();
            }
        }
    }
}
