using System.ComponentModel.DataAnnotations;

namespace RMA.Service.Admin.MasterDataManager.Contracts.Enums
{
    public enum AuditItemTypeEnum
    {
        [Display(Name = "client_Declaration")]
        ClientDeclaration = 1,

        [Display(Name = "client_DeclarationAllowance")]
        ClientDeclarationAllowance = 2
    }
}