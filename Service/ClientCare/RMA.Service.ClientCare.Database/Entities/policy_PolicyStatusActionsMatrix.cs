//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Database.Entities
{
    public partial class policy_PolicyStatusActionsMatrix : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // Id (Primary key)
        public int PolicyStatus { get; set; } // PolicyStatus
        public bool DoRaiseInstallementPremiums { get; set; } // DoRaiseInstallementPremiums
        public bool SubmitDebitOrder { get; set; } // SubmitDebitOrder

        public policy_PolicyStatusActionsMatrix()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
