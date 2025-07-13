using System.Collections.Generic;
using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "Representatives", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class Representatives
    {
        [XmlElement(ElementName = "Representative", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public List<Representative> Representative { get; set; }
    }

}
