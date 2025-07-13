using System.Collections.Generic;
using System.Xml.Serialization;

namespace RMA.Service.Integrations.Contracts.Entities.Fspe.FspeIntegration
{
    [XmlRoot(ElementName = "KeyIndividuals", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
    public class KeyIndividuals
    {
        [XmlElement(ElementName = "KeyIndividual", Namespace = "http://www.astutefse.com/schemas/fse/1.0")]
        public List<KeyIndividual> KeyIndividual { get; set; }
    }

}
