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
    public partial class client_IndustryClassRenewal : ILazyLoadSafeEntity
    {
        public int IndustryClassRenewalId { get; set; } // IndustryClassRenewalId (Primary key)
        public string Description { get; set; } // Description (length: 50)
        public IndustryClassEnum IndustryClass { get; set; } // IndustryClassId
        public int RenewalPeriodStartMonth { get; set; } // RenewalPeriodStartMonth
        public int RenewalPeriodStartDayOfMonth { get; set; } // RenewalPeriodStartDayOfMonth
        public int RenewalPeriodEndMonth { get; set; } // RenewalPeriodEndMonth
        public int RenewalPeriodEndDayOfMonth { get; set; } // RenewalPeriodEndDayOfMonth
        public int DeclarationPeriodStartMonth { get; set; } // DeclarationPeriodStartMonth
        public int DeclarationPeriodStartDayOfMonth { get; set; } // DeclarationPeriodStartDayOfMonth
        public int DeclarationPeriodEndMonth { get; set; } // DeclarationPeriodEndMonth
        public int DeclarationPeriodEndDayOfMonth { get; set; } // DeclarationPeriodEndDayOfMonth

        public client_IndustryClassRenewal()
        {
            InitializePartial();
        }

        partial void InitializePartial();
    }

}
