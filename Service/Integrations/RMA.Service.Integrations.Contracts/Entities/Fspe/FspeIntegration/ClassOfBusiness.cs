using System.Collections.Generic;
using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "ClassOfBusiness", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class ClassOfBusiness
    {
        [XmlElement(ElementName = "SPClassOfBusiness", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public List<SPClassOfBusiness> SPClassOfBusiness { get; set; }
        [XmlElement(ElementName = "KIClassOfBusiness", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public List<KIClassOfBusiness> KIClassOfBusiness { get; set; }
    }

}
