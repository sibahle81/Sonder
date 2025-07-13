using RMA.Common.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClaimCare.Contracts.Entities
{
    public class UnclaimedBenefitHeader : AuditDetails
    {
        #region Properties
        public string FileName { get; set; } // FileName (length: 256)

        public FileTypeEnum? FileType { get; set; } // FileTypeId

        public int UnclaimedBenefitHeaderId { get; set; } // UnclaimedBenefitHeaderId (Primary key)

        #endregion
    }
}