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
using RMA.Service.FinCare.Contracts.Enums;

namespace RMA.Service.FinCare.Database.Entities
{
    public partial class commission_PolicyImportError : ILazyLoadSafeEntity
    {
        public int Id { get; set; } // id (Primary key)
        public int ImportBatch { get; set; } // ImportBatch
        public int Rowid { get; set; } // rowid

        public commission_PolicyImportError()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
