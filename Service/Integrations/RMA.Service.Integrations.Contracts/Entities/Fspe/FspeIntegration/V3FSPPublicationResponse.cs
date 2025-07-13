using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{

    [XmlRoot(ElementName = "V3FSPPublicationResponse", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class V3FSPPublicationResponse
    {
        [XmlElement(ElementName = "CarrierCode", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public CarrierCode CarrierCode { get; set; }
        [XmlElement(ElementName = "ExportDate", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string ExportDate { get; set; }
        [XmlElement(ElementName = "FSPEResponse", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public FSPEResponse FSPEResponse { get; set; }
        [XmlElement(ElementName = "PublicationReference", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string PublicationReference { get; set; }
        [XmlElement(ElementName = "PublicationResponse", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public PublicationResponse PublicationResponse { get; set; }
        [XmlElement(ElementName = "PublishDateTime", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string PublishDateTime { get; set; }
        [XmlAttribute(AttributeName = "xmlns")]
        public string Xmlns { get; set; }
        [XmlAttribute(AttributeName = "xsd", Namespace = "http://www.w3.org/2000/xmlns/")]
        public string Xsd { get; set; }
        [XmlAttribute(AttributeName = "xsi", Namespace = "http://www.w3.org/2000/xmlns/")]
        public string Xsi { get; set; }
    }

}
