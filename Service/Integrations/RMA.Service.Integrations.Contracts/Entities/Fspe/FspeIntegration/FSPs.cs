using System.Collections.Generic;
using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "FSPs", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class FSPs
    {
        [XmlElement(ElementName = "FSP", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public List<FSP> FSP { get; set; }
    }

}
