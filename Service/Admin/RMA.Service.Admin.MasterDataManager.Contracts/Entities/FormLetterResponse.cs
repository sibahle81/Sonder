using System.Runtime.Serialization;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Entities
{

    [DataContract]
    public class FormLetterResponse
    {
        public FormLetterResponse(FormLetterRequest request)
        {
            Request = request;
        }

        [DataMember]
        public FormLetterRequest Request { get; set; }
        [DataMember]
        public byte[] ByteData { get; set; }
    }
}