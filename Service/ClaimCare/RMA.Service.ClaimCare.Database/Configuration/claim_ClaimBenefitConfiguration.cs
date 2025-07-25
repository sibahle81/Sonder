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
using RMA.Service.ClaimCare.Database.Entities;

namespace RMA.Service.ClaimCare.Database.Configuration
{
    public class claim_ClaimBenefitConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<claim_ClaimBenefit>
    {
        public claim_ClaimBenefitConfiguration()
            : this("claim")
        {
        }

        public claim_ClaimBenefitConfiguration(string schema)
        {
            ToTable("ClaimBenefit", schema);
            HasKey(x => x.ClaimBenefitId);

            Property(x => x.ClaimBenefitId).HasColumnName(@"ClaimBenefitId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.ClaimId).HasColumnName(@"ClaimId").HasColumnType("int").IsRequired();
            Property(x => x.BenefitId).HasColumnName(@"BenefitId").HasColumnType("int").IsRequired();
            Property(x => x.EstimatedValue).HasColumnName(@"EstimatedValue").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.IsInSync).HasColumnName(@"IsInSync").HasColumnType("bit").IsRequired();

            // Foreign keys
            HasRequired(a => a.Claim).WithMany(b => b.ClaimBenefits).HasForeignKey(c => c.ClaimId).WillCascadeOnDelete(false); // FK_ClaimBenefit_Claim
        }
    }

}
