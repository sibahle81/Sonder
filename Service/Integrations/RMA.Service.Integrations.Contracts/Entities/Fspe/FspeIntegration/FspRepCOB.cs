using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "FspRepCOB", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class FspRepCOB
    {
        [XmlElement(ElementName = "FspRepCOBdate", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string FspRepCOBdate { get; set; }
        [XmlElement(ElementName = "FspRepCOBdescr", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public string FspRepCOBdescr { get; set; }
    }

}
