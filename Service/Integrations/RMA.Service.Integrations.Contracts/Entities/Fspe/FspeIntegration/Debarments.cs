using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "Debarments", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class Debarments
    {
        [XmlElement(ElementName = "Debarred", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public Debarred Debarred { get; set; }
    }

}
