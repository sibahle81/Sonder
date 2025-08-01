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
    public class policy_PolicyChangeProductConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<policy_PolicyChangeProduct>
    {
        public policy_PolicyChangeProductConfiguration()
            : this("policy")
        {
        }

        public policy_PolicyChangeProductConfiguration(string schema)
        {
            ToTable("PolicyChangeProduct", schema);
            HasKey(x => x.PolicyChangeProductId);

            Property(x => x.PolicyChangeProductId).HasColumnName(@"PolicyChangeProductId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.PolicyId).HasColumnName(@"PolicyId").HasColumnType("int").IsRequired();
            Property(x => x.EffectiveDate).HasColumnName(@"EffectiveDate").HasColumnType("date").IsRequired();
            Property(x => x.ProductOptionId).HasColumnName(@"ProductOptionId").HasColumnType("int").IsRequired();
            Property(x => x.PolicyChangeStatus).HasColumnName(@"PolicyChangeStatusId").HasColumnType("int").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.Policy).WithMany(b => b.PolicyChangeProducts).HasForeignKey(c => c.PolicyId).WillCascadeOnDelete(false); // FK_PolicyChangeProduct_Policy
            HasRequired(a => a.ProductOption).WithMany(b => b.PolicyChangeProducts).HasForeignKey(c => c.ProductOptionId).WillCascadeOnDelete(false); // FK_PolicyChangeProduct_ProductOption
        }
    }

}
