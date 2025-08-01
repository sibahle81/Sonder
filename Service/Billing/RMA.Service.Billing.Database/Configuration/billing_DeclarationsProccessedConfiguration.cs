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
using RMA.Service.Billing.Database.Entities;

namespace RMA.Service.Billing.Database.Configuration
{
<<<<<<< HEAD:Service/Billing/RMA.Service.Billing.Database/Configuration/billing_DeclarationsProccessedConfiguration.cs
    public class billing_DeclarationsProccessedConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<billing_DeclarationsProccessed>
    {
        public billing_DeclarationsProccessedConfiguration()
            : this("billing")
        {
        }

        public billing_DeclarationsProccessedConfiguration(string schema)
        {
            ToTable("DeclarationsProccessed", schema);
            HasKey(x => x.DeclarationProccessedId);

            Property(x => x.DeclarationProccessedId).HasColumnName(@"DeclarationProccessedId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.DeclarationId).HasColumnName(@"DeclarationId").HasColumnType("int").IsRequired();
=======
    public class policy_CategoryInsuredCoverConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<policy_CategoryInsuredCover>
    {
        public policy_CategoryInsuredCoverConfiguration()
            : this("policy")
        {
        }

        public policy_CategoryInsuredCoverConfiguration(string schema)
        {
            ToTable("CategoryInsuredCover", schema);
            HasKey(x => x.CategoryInsuredCoverId);

            Property(x => x.CategoryInsuredCoverId).HasColumnName(@"CategoryInsuredCoverId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.PolicyId).HasColumnName(@"PolicyId").HasColumnType("int").IsRequired();
            Property(x => x.CategoryInsured).HasColumnName(@"CategoryInsuredId").HasColumnType("int").IsRequired();
            Property(x => x.EffectiveFrom).HasColumnName(@"EffectiveFrom").HasColumnType("datetime").IsRequired();
            Property(x => x.EffectiveTo).HasColumnName(@"EffectiveTo").HasColumnType("datetime").IsOptional();
>>>>>>> b1ce166581f7bf7a8c2e1529b5a49ee8a4feb712:Service/ClientCare/RMA.Service.ClientCare.Database/Configuration/policy_CategoryInsuredCoverConfiguration.cs
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
<<<<<<< HEAD:Service/Billing/RMA.Service.Billing.Database/Configuration/billing_DeclarationsProccessedConfiguration.cs
            HasRequired(a => a.Declaration).WithMany(b => b.DeclarationsProccesseds).HasForeignKey(c => c.DeclarationId).WillCascadeOnDelete(false); // FK_DeclarationsProccessed_Declaration
=======
            HasRequired(a => a.Policy).WithMany(b => b.CategoryInsuredCovers).HasForeignKey(c => c.PolicyId).WillCascadeOnDelete(false); // FK_CategoryInsuredCover_Policy
>>>>>>> b1ce166581f7bf7a8c2e1529b5a49ee8a4feb712:Service/ClientCare/RMA.Service.ClientCare.Database/Configuration/policy_CategoryInsuredCoverConfiguration.cs
        }
    }

}
