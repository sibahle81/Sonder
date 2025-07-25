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
using RMA.Service.ClientCare.Database.Entities;

namespace RMA.Service.ClientCare.Database.Configuration
{
    public class product_DiscountTypeConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<product_DiscountType>
    {
        public product_DiscountTypeConfiguration()
            : this("product")
        {
        }

        public product_DiscountTypeConfiguration(string schema)
        {
            ToTable("DiscountType", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Code).HasColumnName(@"Code").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(10);
            Property(x => x.DiscountPercentage).HasColumnName(@"DiscountPercentage").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.EffectiveDate).HasColumnName(@"EffectiveDate").HasColumnType("date").IsRequired();
            Property(x => x.Description).HasColumnName(@"Description").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(255);
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
        }
    }

}
