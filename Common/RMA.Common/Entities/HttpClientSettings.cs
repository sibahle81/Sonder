using System;
using System.Collections.Generic;
using System.Net.Http.Headers;

namespace RMA.Common.Entities
{
    public class HttpClientSettings
    {
        public Uri BaseAddress { get; set; }
        public List<KeyValuePair<string, string>> RequestHeaders { get; } = new List<KeyValuePair<string, string>>();
        public List<string> MediaTypes { get; } = new List<string>();
        public AuthenticationHeaderValue DefaultRequestHeaderAuthorization { get; set; }

        public void AddDefaultRequestHeader(string key, string value)
        {
            if (key == null)
                throw new ArgumentNullException(nameof(key));
            if (string.Equals(key, "Authorization", StringComparison.InvariantCultureIgnoreCase))
            {
                if (value != null)
                {
                    value = value.Trim();
                    int index = value.IndexOf(' ');
                    string scheme = value.Substring(0, index);
                    string parameter = value.Substring(index + 1);
                    DefaultRequestHeaderAuthorization = new AuthenticationHeaderValue(scheme, parameter);
                }
                else
                {
                    DefaultRequestHeaderAuthorization = null;
                }
            }
            else
            {
                RequestHeaders.Add(new KeyValuePair<string, string>(key, value));
            }
        }

        public void AddDefaultRequestHeaderAccept(string mediaType)
        {
            MediaTypes.Add(mediaType);
        }

    }
}

