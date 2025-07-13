using System.Collections.Generic;
using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "FspRepCOBs", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class FspRepCOBs
    {
        [XmlElement(ElementName = "FspRepCOB", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public List<FspRepCOB> FspRepCOB { get; set; }
    }

}
