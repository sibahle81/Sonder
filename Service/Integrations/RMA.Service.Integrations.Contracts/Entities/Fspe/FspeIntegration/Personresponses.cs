using System.Collections.Generic;
using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "Personresponses", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class Personresponses
    {
        [XmlElement(ElementName = "Personresponse", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public List<Personresponse> Personresponse { get; set; }
    }

}
