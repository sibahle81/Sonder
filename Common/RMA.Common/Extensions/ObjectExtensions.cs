using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using System;
using System.IO;
using System.Text;
using System.Xml;
using System.Xml.Serialization;

using Formatting = Newtonsoft.Json.Formatting;

namespace RMA.Common.Extensions
{
    public static class ObjectExtensions
    {
        public enum eContractResolver
        {
            Default = 0,
            CamelCase = 1,
            SnakeCase = 2,
            LowerCase = 3,
            Indented = 4
        }

        public static string ToJson(this object source, bool includeNull = true,
            eContractResolver camelCase = eContractResolver.Default, bool enumToString = false,
            Formatting? formatting = null)
        {
            var converter = System.Array.Empty<JsonConverter>();
            if (enumToString)
                converter = new JsonConverter[] { new StringEnumConverter() };
            IContractResolver resolver = new DefaultContractResolver();
            switch (camelCase)
            {
                case eContractResolver.CamelCase:
                    {
                        resolver = new CamelCasePropertyNamesContractResolver();
                        break;
                    }

                case eContractResolver.SnakeCase:
                    {
                        resolver = new SnakeCasePropertyNamesContractResolver();
                        break;
                    }

                case eContractResolver.LowerCase:
                    {
                        resolver = new LowercaseContractResolver();
                        break;
                    }
            }

            var settings = new JsonSerializerSettings
            {
                ContractResolver = resolver,
                Converters = converter,
                NullValueHandling = includeNull ? NullValueHandling.Include : NullValueHandling.Ignore
            };
            if (formatting == null)
                return JsonConvert.SerializeObject(source, settings);
            return JsonConvert.SerializeObject(source, formatting.Value, settings);
        }

        public static string ToXml<T>(this object source, Encoding encoding = null, string xmlPrefix = "",
            string xmlNamespace = "")
        {
            if (encoding == null)
                encoding = Encoding.UTF8;
            var serializer = new XmlSerializer(typeof(T));
            using (var sww = new StringWriterWithEncoding(encoding))
            {
                using (var writer = XmlWriter.Create(sww))
                {

                    var xmlnsEmpty = new XmlSerializerNamespaces();
                    xmlnsEmpty.Add(xmlPrefix, xmlNamespace);
                    serializer.Serialize(writer, source, xmlnsEmpty);
                    return sww.ToString();
                }
            }
        }

        internal sealed class StringWriterWithEncoding : StringWriter
        {
            public StringWriterWithEncoding(Encoding encoding)
            {
                Encoding = encoding;
            }

            public override Encoding Encoding { get; }
        }
    }

    public class LowercaseContractResolver : DefaultContractResolver
    {
        protected override string ResolvePropertyName(string propertyName)
        {
            if (propertyName == null) throw new ArgumentNullException(nameof(propertyName), "propertyName IS NULL");
            return char.ToLowerInvariant(propertyName[0]) + propertyName.Substring(1);
        }
    }
}