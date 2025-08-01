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
using RMA.Service.FinCare.Database.Entities;

namespace RMA.Service.FinCare.Database.Configuration
{
    public class billing_LastViewedConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<billing_LastViewed>
    {
        public billing_LastViewedConfiguration()
            : this("billing")
        {
        }

        public billing_LastViewedConfiguration(string schema)
        {
            ToTable("LastViewed", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.ItemId).HasColumnName(@"ItemId").HasColumnType("int").IsRequired();
            Property(x => x.ItemType).HasColumnName(@"ItemType").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.User).HasColumnName(@"User").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Date).HasColumnName(@"Date").HasColumnType("datetime").IsRequired();
        }
    }

}
