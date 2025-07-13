using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

using System;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class Document : AuditDetails
    {
        public DateTime? DateRequested { get; set; } // EventIsAtCompany
        public DateTime? DateReceived { get; set; } // EventTypeId
        public string DocumentTypeName
        {
            get
            {
                return EnumHelper.DisplayAttributeValue((DocumentTypeEnum)DocumentType);
            }
        }
        public DocumentTypeEnum? DocumentType { get; set; } // DocumentTypeId

        public string Status
        {
            get
            {
                if (IsDeleted)
                {
                    return "Deleted";
                }
                if (IsAccepted == true && IsReceive.HasValue)
                {
                    return "Accepted";
                }
                if (IsDiscarded == true)
                {
                    return "Discarded";
                }
                if (IsWaived.HasValue)
                {
                    return "Waived";
                }
                if (IsReceive.HasValue && DateReceived.HasValue)
                {
                    return "Received";
                }
                return "Awaiting";
            }
        } // Status (length: 15)

        public bool? IsDiscarded { get; set; }
        public bool? IsAccepted { get; set; }
        public bool? IsWaived { get; set; }
        public int ClaimId { get; set; } // ClaimId
        public System.Guid? DocumentToken { get; set; } // DocumentToken
        public bool? IsRequired { get; set; } // IsRequired
        public bool? IsReceive { get; set; } // IsReceive

        //ENUM => ID Conversions
        public int DocumentTypeId
        {
            get => (int)DocumentType;
            set => DocumentType = (DocumentTypeEnum)value;
        }
    }
}
