using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Serialization;

namespace RMA.Common.Extensions
{
    public static class XmlExtensions
    {
        public static string RemoveNamespaces(this string xmlValue)
        {
            if (string.IsNullOrEmpty(xmlValue)) return xmlValue;
            var r = new Regex(@"( xmlns.*?=\"".*?\"")>", RegexOptions.None, TimeSpan.FromMilliseconds(100));
            var match = r.Match(xmlValue);
            if (!match.Success || string.IsNullOrEmpty(match.Groups[1].Value)) return xmlValue;
            return xmlValue.Replace(match.Groups[1].Value, "");

        }

        public static string RemoveXmlDeclaration(this string xmlValue)
        {
            if (string.IsNullOrEmpty(xmlValue)) return xmlValue;
            var r = new Regex(@"(<\?xml.*?=\"".*?\""\?>)",RegexOptions.None, TimeSpan.FromMilliseconds(100));
            var match = r.Match(xmlValue);
            if (!match.Success || string.IsNullOrEmpty(match.Groups[1].Value)) return xmlValue;
            return xmlValue.Replace(match.Groups[1].Value, "");
        }

        public static string RemoveReferenceNamespaces(this string xmlValue)
        {
            return xmlValue?.Replace(" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"", "")
                .Replace(" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"", "");
        }

        //xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"

        public static string ElementValue(this XElement document, string elementName)
        {
            var element = document?.DescendantsAndSelf().Elements().FirstOrDefault(d => d.Name.LocalName == elementName);
            if (element != null) return element.Value;
            return string.Empty;
        }

        public static string ElementValue(this XDocument document, string elementName)
        {
            var element = document?.Root.DescendantsAndSelf().Elements()
                .FirstOrDefault(d => d.Name.LocalName == elementName);
            if (element != null) return element.Value;
            return string.Empty;
        }

        public static string AttributeValue(this XElement document, string elementName, string attribute)
        {
            var element = document?.DescendantsAndSelf().Elements().FirstOrDefault(d => d.Name.LocalName == elementName);
            if (element != null) return element.Attribute(attribute).Value;
            return string.Empty;
        }

        public static string AttributeValue(this XDocument document, string elementName, string attribute)
        {
            var element = document?.Root.DescendantsAndSelf().Elements()
                .FirstOrDefault(d => d.Name.LocalName == elementName);
            if (element != null) return element.Attribute(attribute).Value;
            return string.Empty;
        }

        public static void SetXElementValue(this XElement document, string elementName, string value)
        {
            var element = document?.DescendantsAndSelf().Elements().FirstOrDefault(d => d.Name.LocalName == elementName);
            if (element != null) element.Value = value;
        }

        public static void SetAttributeValue(this XElement document, string elementName, string attributeName,
            string value)
        {
            var element = document?.DescendantsAndSelf().Elements().FirstOrDefault(d => d.Name.LocalName == elementName);
            if (element != null) element.Attribute(attributeName).Value = value;
        }

        public static void SetAttributeValue(this XDocument document, string elementName, string attributeName,
          string value)
        {
            var element = document?.Root.DescendantsAndSelf().Elements()
                .FirstOrDefault(d => d.Name.LocalName == elementName);
            if (element != null) element.Attribute(attributeName).Value = value;
        }

        public static void SetElementValue(this XDocument document, string elementName, string value)
        {
            var element = document?.Root.DescendantsAndSelf().Elements()
                .FirstOrDefault(d => d.Name.LocalName == elementName);
            if (element != null) element.Value = value;
        }

        public static XmlDocument ToXmlDocument(this XDocument xdocument)
        {
            var xmlDocument = new XmlDocument();
            xmlDocument.Load(xdocument?.CreateReader());
            return xmlDocument;
        }

        public static XDocument ToXDocument(this XmlDocument xmlDocument)
        {
            using (var nodeReader = new XmlNodeReader(xmlDocument))
            {
                nodeReader.MoveToContent();
                return XDocument.Load(nodeReader);
            }
        }

        public static XElement GetXElement(this XmlNode node)
        {
            var document = new XDocument();
            using (var xmlWriter = document.CreateWriter())
            {
                node?.WriteTo(xmlWriter);
            }

            return document.Root;
        }

        public static XmlNode GetXmlNode(this XElement element)
        {
            using (var xmlReader = element?.CreateReader())
            {
                var xmlDoc = new XmlDocument();
                xmlDoc.Load(xmlReader);
                return xmlDoc;
            }
        }

        public static XElement ToXElement(this XmlElement element)
        {
            return XElement.Parse(element?.OuterXml);
        }

        public static XmlElement ToXmlElement(this XElement element)
        {
            var doc = new XmlDocument();
            var settings = new XmlReaderSettings
            {
                DtdProcessing = DtdProcessing.Prohibit // Ensures safe processing of XML  
            };

            using (var reader = XmlReader.Create(new StringReader(element?.ToString()), settings))
            {
                doc.Load(reader);
            }

            return doc.DocumentElement;
        }

        public static T DeserializeXMLToObject<T>(this string inputString) where T : class
        {
            if (string.IsNullOrEmpty(inputString)) return null;

            var serializer = new XmlSerializer(typeof(T));
            var settings = new XmlReaderSettings
            {
                DtdProcessing = DtdProcessing.Prohibit, // Disable DTD processing for security
                XmlResolver = null // Prevent potential information disclosure
            };

            using (var memStream = new MemoryStream(Encoding.UTF8.GetBytes(inputString)))
            using (var xmlReader = XmlReader.Create(memStream, settings))
            {
                return (T)serializer.Deserialize(xmlReader);
            }
        }
    }
}