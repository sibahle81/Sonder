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
    public class finance_AbilityPostingAuditConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<finance_AbilityPostingAudit>
    {
        public finance_AbilityPostingAuditConfiguration()
            : this("finance")
        {
        }

        public finance_AbilityPostingAuditConfiguration(string schema)
        {
            ToTable("AbilityPostingAudit", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.Reference).HasColumnName(@"Reference").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.PaymentId).HasColumnName(@"PaymentId").HasColumnType("int").IsOptional();
            Property(x => x.SysNo).HasColumnName(@"SysNo").HasColumnType("int").IsOptional();
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.PaymentHeaderDetailId).HasColumnName(@"PaymentHeaderDetailId").HasColumnType("int").IsOptional();
            Property(x => x.PaymentReference).HasColumnName(@"PaymentReference").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.PaymentBatchReference).HasColumnName(@"PaymentBatchReference").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.Amount).HasColumnName(@"Amount").HasColumnType("decimal").IsOptional().HasPrecision(18,2);
            Property(x => x.PayeeDetails).HasColumnName(@"PayeeDetails").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.Bank).HasColumnName(@"Bank").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.BankBranch).HasColumnName(@"BankBranch").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.AccountDetails).HasColumnName(@"AccountDetails").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.PaymentType).HasColumnName(@"PaymentTypeId").HasColumnType("int").IsOptional();
            Property(x => x.IsProcessed).HasColumnName(@"IsProcessed").HasColumnType("bit").IsOptional();
            Property(x => x.BrokerageId).HasColumnName(@"BrokerageId").HasColumnType("int").IsOptional();
            Property(x => x.CompanyNo).HasColumnName(@"CompanyNo").HasColumnType("int").IsOptional();
            Property(x => x.BranchNo).HasColumnName(@"BranchNo").HasColumnType("int").IsOptional();
            Property(x => x.BenefitCode).HasColumnName(@"BenefitCode").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Origin).HasColumnName(@"Origin").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(10);
            Property(x => x.RmaBankAccount).HasColumnName(@"RMABankAccount").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.IsCoid).HasColumnName(@"IsCoid").HasColumnType("bit").IsOptional();
            Property(x => x.PayeeRolePlayerIdentificationTypeId).HasColumnName(@"PayeeRolePlayerIdentificationTypeId").HasColumnType("int").IsOptional();
        }
    }

}
