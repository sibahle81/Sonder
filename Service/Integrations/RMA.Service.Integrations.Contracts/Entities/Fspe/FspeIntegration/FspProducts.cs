using System.Collections.Generic;
using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "FspProducts", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class FspProducts
    {
        [XmlElement(ElementName = "FspProduct", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public List<FspProduct> FspProduct { get; set; }
    }

}
