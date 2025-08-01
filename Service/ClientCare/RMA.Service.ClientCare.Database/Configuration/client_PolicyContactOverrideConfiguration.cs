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
    public class client_PolicyContactOverrideConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<client_PolicyContactOverride>
    {
        public client_PolicyContactOverrideConfiguration()
            : this("client")
        {
        }

        public client_PolicyContactOverrideConfiguration(string schema)
        {
            ToTable("PolicyContactOverride", schema);
            HasKey(x => x.PolicyContactOverrideId);

            Property(x => x.PolicyContactOverrideId).HasColumnName(@"PolicyContactOverrideId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.PolicyId).HasColumnName(@"PolicyId").HasColumnType("int").IsOptional();
            Property(x => x.MobileNumber).HasColumnName(@"MobileNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(16);
            Property(x => x.Email).HasColumnName(@"Email").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(128);
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasOptional(a => a.Policy).WithMany(b => b.PolicyContactOverrides).HasForeignKey(c => c.PolicyId).WillCascadeOnDelete(false); // FK_PolicyContactOverride_Policy
        }
    }

}
