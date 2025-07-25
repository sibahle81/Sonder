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
    public class client_RolePlayerPolicyDeclarationDetailConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<client_RolePlayerPolicyDeclarationDetail>
    {
        public client_RolePlayerPolicyDeclarationDetailConfiguration()
            : this("client")
        {
        }

        public client_RolePlayerPolicyDeclarationDetailConfiguration(string schema)
        {
            ToTable("RolePlayerPolicyDeclarationDetail", schema);
            HasKey(x => x.RolePlayerPolicyDeclarationDetailId);

            Property(x => x.RolePlayerPolicyDeclarationDetailId).HasColumnName(@"RolePlayerPolicyDeclarationDetailId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.RolePlayerPolicyDeclarationId).HasColumnName(@"RolePlayerPolicyDeclarationId").HasColumnType("int").IsRequired();
            Property(x => x.ProductOptionId).HasColumnName(@"ProductOptionId").HasColumnType("int").IsRequired();
            Property(x => x.CategoryInsured).HasColumnName(@"CategoryInsuredId").HasColumnType("int").IsRequired();
            Property(x => x.Rate).HasColumnName(@"Rate").HasColumnType("decimal").IsOptional().HasPrecision(38,10);
            Property(x => x.AverageNumberOfEmployees).HasColumnName(@"AverageNumberOfEmployees").HasColumnType("int").IsRequired();
            Property(x => x.AverageEmployeeEarnings).HasColumnName(@"AverageEmployeeEarnings").HasColumnType("decimal").IsOptional().HasPrecision(38,10);
            Property(x => x.Premium).HasColumnName(@"Premium").HasColumnType("decimal").IsOptional().HasPrecision(38,10);
            Property(x => x.LiveInAllowance).HasColumnName(@"LiveInAllowance").HasColumnType("decimal").IsOptional().HasPrecision(38,10);
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.EffectiveFrom).HasColumnName(@"EffectiveFrom").HasColumnType("date").IsOptional();
            Property(x => x.EffectiveTo).HasColumnName(@"EffectiveTo").HasColumnType("date").IsOptional();

            // Foreign keys
            HasRequired(a => a.RolePlayerPolicyDeclaration).WithMany(b => b.RolePlayerPolicyDeclarationDetails).HasForeignKey(c => c.RolePlayerPolicyDeclarationId).WillCascadeOnDelete(false); // FK_RolePlayerPolicyDeclarationDetail_RolePlayerPolicyDeclaration
        }
    }

}
