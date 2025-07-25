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
    public class claim_PdRecoveryConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<claim_PdRecovery>
    {
        public claim_PdRecoveryConfiguration()
            : this("claim")
        {
        }

        public claim_PdRecoveryConfiguration(string schema)
        {
            ToTable("PDRecovery", schema);
            HasKey(x => x.PdRecoveryId);

            Property(x => x.PdRecoveryId).HasColumnName(@"PDRecoveryId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.MedicalAssessmentId).HasColumnName(@"MedicalAssessmentId").HasColumnType("int").IsRequired();
            Property(x => x.FromPdAwardId).HasColumnName(@"FromPDAwardID").HasColumnType("int").IsRequired();
            Property(x => x.FromBeneficiaryPensionId).HasColumnName(@"FromBeneficiaryPensionID").HasColumnType("int").IsOptional();
            Property(x => x.AgainstBeneficiaryPensionId).HasColumnName(@"AgainstBeneficiaryPensionID").HasColumnType("int").IsOptional();
            Property(x => x.PdRecoveryStatusId).HasColumnName(@"PDRecoveryStatusID").HasColumnType("int").IsRequired();
            Property(x => x.OriginalAmount).HasColumnName(@"OriginalAmount").HasColumnType("decimal").IsRequired().HasPrecision(10,2);
            Property(x => x.OriginalPdExtent).HasColumnName(@"OriginalPDExtent").HasColumnType("decimal").IsRequired().HasPrecision(10,2);
            Property(x => x.RecoveryAmount).HasColumnName(@"RecoveryAmount").HasColumnType("decimal").IsOptional().HasPrecision(10,2);
            Property(x => x.RecoveryMonthlyPension).HasColumnName(@"RecoveryMonthlyPension").HasColumnType("decimal").IsOptional().HasPrecision(10,2);
            Property(x => x.CalcOperands).HasColumnName(@"CalcOperands").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(500);
            Property(x => x.DateRecovered).HasColumnName(@"DateRecovered").HasColumnType("datetime").IsOptional();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.PdAward).WithMany(b => b.PdRecoveries).HasForeignKey(c => c.FromPdAwardId).WillCascadeOnDelete(false); // FK_PDRecovery_PDAward
            HasRequired(a => a.PdRecoveryStatu).WithMany(b => b.PdRecoveries).HasForeignKey(c => c.PdRecoveryStatusId).WillCascadeOnDelete(false); // FK_PDRecovery_PDRecoveryStatus
        }
    }

}
