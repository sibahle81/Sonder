using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "FSP", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class FSP
    {
        [XmlElement(ElementName = "Debarments", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public Debarments Debarments { get; set; }
        [XmlElement(ElementName = "FspDateAuthorised", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string FspDateAuthorised { get; set; }
        [XmlElement(ElementName = "FspName", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string FspName { get; set; }
        [XmlElement(ElementName = "FspNo", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string FspNo { get; set; }
        [XmlElement(ElementName = "FspProducts", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public FspProducts FspProducts { get; set; }
        [XmlElement(ElementName = "FspReg", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string FspReg { get; set; }
        [XmlElement(ElementName = "FspStatus", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string FspStatus { get; set; }
        [XmlElement(ElementName = "FspType", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string FspType { get; set; }
        [XmlElement(ElementName = "IsDelta", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string IsDelta { get; set; }
        [XmlElement(ElementName = "KeyIndividuals", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public KeyIndividuals KeyIndividuals { get; set; }
        [XmlElement(ElementName = "Personresponses", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public Personresponses Personresponses { get; set; }
        [XmlElement(ElementName = "Representatives", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public Representatives Representatives { get; set; }
        [XmlElement(ElementName = "SoleProprietors", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public SoleProprietors SoleProprietors { get; set; }
    }

}
