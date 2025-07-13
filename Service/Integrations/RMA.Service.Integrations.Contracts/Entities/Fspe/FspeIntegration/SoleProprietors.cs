using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "SoleProprietors", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class SoleProprietors
    {
        [XmlElement(ElementName = "SoleProprietor", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public SoleProprietor SoleProprietor { get; set; }
    }
}
