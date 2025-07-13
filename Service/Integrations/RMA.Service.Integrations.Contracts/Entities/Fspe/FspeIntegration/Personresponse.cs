using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "Personresponse", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class Personresponse
    {
        [XmlElement(ElementName = "IdentityNumber", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string IdentityNumber { get; set; }
        [XmlElement(ElementName = "ResponseDate", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string ResponseDate { get; set; }
        [XmlElement(ElementName = "ResponseMessage", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string ResponseMessage { get; set; }
    }

}
