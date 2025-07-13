using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "RepProduct", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class RepProduct
    {
        [XmlElement(ElementName = "Advice", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string Advice { get; set; }
        [XmlElement(ElementName = "AdviceFirstDate", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string AdviceFirstDate { get; set; }
        [XmlElement(ElementName = "CategoryNo", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string CategoryNo { get; set; }
        [XmlElement(ElementName = "Intermediary", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string Intermediary { get; set; }
        [XmlElement(ElementName = "IntermediaryFirstDate", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string IntermediaryFirstDate { get; set; }
        [XmlElement(ElementName = "ProductDescription", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string ProductDescription { get; set; }
        [XmlElement(ElementName = "Scripted", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string Scripted { get; set; }
        [XmlElement(ElementName = "ScriptedFirstDate", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string ScriptedFirstDate { get; set; }
        [XmlElement(ElementName = "SubCategoryNo", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string SubCategoryNo { get; set; }
        [XmlElement(ElementName = "Sus", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string Sus { get; set; }
        [XmlElement(ElementName = "SusFirstDate", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string SusFirstDate { get; set; }
    }

}
