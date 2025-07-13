using System.Collections.Generic;
using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "Products", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class Products
    {
        [XmlElement(ElementName = "RepProduct", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public List<RepProduct> RepProduct { get; set; }
    }

}
