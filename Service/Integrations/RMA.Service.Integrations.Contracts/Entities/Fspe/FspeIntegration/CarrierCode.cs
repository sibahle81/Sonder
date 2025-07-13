using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "CarrierCode", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class CarrierCode
    {
        [XmlAttribute(AttributeName = "Reference")]
        public string Reference { get; set; }
        [XmlText]
        public string Text { get; set; }
    }
}
