using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "FSPEResponse", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class FSPEResponse
    {
        [XmlElement(ElementName = "FSPs", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public FSPs FSPs { get; set; }
    }

}
