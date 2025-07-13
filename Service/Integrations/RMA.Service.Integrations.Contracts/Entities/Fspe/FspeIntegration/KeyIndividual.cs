using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "KeyIndividual", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class KeyIndividual
    {
        [XmlElement(ElementName = "IdentityNumber", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string IdentityNumber { get; set; }
        [XmlElement(ElementName = "Name", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string Name { get; set; }
        [XmlElement(ElementName = "Surname", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string Surname { get; set; }
        [XmlElement(ElementName = "DateAppointed", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string DateAppointed { get; set; }
        [XmlElement(ElementName = "Products", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public Products Products { get; set; }
        [XmlElement(ElementName = "ClassOfBusiness", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public ClassOfBusiness ClassOfBusiness { get; set; }
    }

}
