//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Admin.BusinessProcessManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.BusinessProcessManager.Database.Configuration
{
    public class common_AdhocPaymentInstructionsStatuConfig : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<common_AdhocPaymentInstructionsStatu>
    {
        public common_AdhocPaymentInstructionsStatuConfig()
            : this("common")
        {
        }

        public common_AdhocPaymentInstructionsStatuConfig(string schema)
        {
            ToTable("AdhocPaymentInstructionsStatus", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
        }
    }

}
