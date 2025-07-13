using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "KIClassOfBusiness", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class KIClassOfBusiness
    {
        [XmlElement(ElementName = "COBcatI", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string COBcatI { get; set; }
        [XmlElement(ElementName = "COBcatII", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string COBcatII { get; set; }
        [XmlElement(ElementName = "COBcatIIA", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string COBcatIIA { get; set; }
        [XmlElement(ElementName = "COBcatIII", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string COBcatIII { get; set; }
        [XmlElement(ElementName = "COBcatIV", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string COBcatIV { get; set; }
        [XmlElement(ElementName = "COBCode", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string COBCode { get; set; }
        [XmlElement(ElementName = "COBDescription", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string COBDescription { get; set; }
    }

}
