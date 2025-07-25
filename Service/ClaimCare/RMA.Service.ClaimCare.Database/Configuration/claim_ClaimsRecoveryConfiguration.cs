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
    public class claim_ClaimsRecoveryConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<claim_ClaimsRecovery>
    {
        public claim_ClaimsRecoveryConfiguration()
            : this("claim")
        {
        }

        public claim_ClaimsRecoveryConfiguration(string schema)
        {
            ToTable("ClaimsRecovery", schema);
            HasKey(x => x.ClaimRecoveryId);

            Property(x => x.ClaimRecoveryId).HasColumnName(@"ClaimRecoveryId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.ClaimId).HasColumnName(@"ClaimId").HasColumnType("int").IsRequired();
            Property(x => x.ClaimNumber).HasColumnName(@"ClaimNumber").HasColumnType("int").IsOptional();
            Property(x => x.WorkPool).HasColumnName(@"WorkpoolId").HasColumnType("int").IsOptional();
            Property(x => x.ClaimStatus).HasColumnName(@"ClaimStatusId").HasColumnType("int").IsOptional();
            Property(x => x.ClaimRecoveryReason).HasColumnName(@"RecoveryReasonId").HasColumnType("int").IsOptional();
            Property(x => x.RecoveryInvokedBy).HasColumnName(@"RecoveryInvokedBy").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.AssignedToUserId).HasColumnName(@"AssignedToUserId").HasColumnType("int").IsOptional();
            Property(x => x.RolePlayerId).HasColumnName(@"RolePlayerId").HasColumnType("int").IsRequired();
            Property(x => x.RolePlayerBankingId).HasColumnName(@"RolePlayerBankingId").HasColumnType("int").IsRequired();
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.IdNumber).HasColumnName(@"IdNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ClaimRecoveryInvoiceId).HasColumnName(@"ClaimRecoveryInvoiceId").HasColumnType("int").IsRequired();
            Property(x => x.PaymentPlan).HasColumnName(@"PaymentPlan").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.PaymentDay).HasColumnName(@"PaymentDay").HasColumnType("int").IsOptional();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.Claim).WithMany(b => b.ClaimsRecoveries).HasForeignKey(c => c.ClaimId).WillCascadeOnDelete(false); // FK_ClaimsRecovery_Claim
        }
    }

}
