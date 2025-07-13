using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "Debarred", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class Debarred
    {
        [XmlElement(ElementName = "DebarredStatus", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string DebarredStatus { get; set; }
        [XmlElement(ElementName = "IdentityNumber", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string IdentityNumber { get; set; }
        [XmlElement(ElementName = "Name", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string Name { get; set; }
        [XmlElement(ElementName = "ReasonDebarredDate", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string ReasonDebarredDate { get; set; }
        [XmlElement(ElementName = "ReasonDebarredReason", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string ReasonDebarredReason { get; set; }
        [XmlElement(ElementName = "Surname", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string Surname { get; set; }
    }

}
