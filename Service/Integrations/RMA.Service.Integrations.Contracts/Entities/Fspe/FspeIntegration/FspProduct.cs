using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "FspProduct", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class FspProduct
    {
        [XmlElement(ElementName = "AdviceAutomated", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string AdviceAutomated { get; set; }
        [XmlElement(ElementName = "AdviceNonAutomated", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string AdviceNonAutomated { get; set; }
        [XmlElement(ElementName = "CategoryDescription", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string CategoryDescription { get; set; }
        [XmlElement(ElementName = "CategoryNo", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string CategoryNo { get; set; }
        [XmlElement(ElementName = "IntermediaryOther", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string IntermediaryOther { get; set; }
        [XmlElement(ElementName = "IntermediaryScripted", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string IntermediaryScripted { get; set; }
        [XmlElement(ElementName = "SubCategoryNo", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string SubCategoryNo { get; set; }
    }

}
