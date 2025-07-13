using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "PublicationResponse", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class PublicationResponse
    {
        [XmlAttribute(AttributeName = "ResultCode")]
        public string ResultCode { get; set; }
        [XmlElement(ElementName = "ResultInfo", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string ResultInfo { get; set; }
    }

}
