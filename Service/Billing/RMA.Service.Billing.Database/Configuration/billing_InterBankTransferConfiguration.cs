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
    public class billing_InterBankTransferConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<billing_InterBankTransfer>
    {
        public billing_InterBankTransferConfiguration()
            : this("billing")
        {
        }

        public billing_InterBankTransferConfiguration(string schema)
        {
            ToTable("InterBankTransfer", schema);
            HasKey(x => x.InterBankTransferId);

            Property(x => x.InterBankTransferId).HasColumnName(@"InterBankTransferId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.FromRmaBankAccountId).HasColumnName(@"FromRmaBankAccountId").HasColumnType("int").IsRequired();
            Property(x => x.ToRmaBankAccountId).HasColumnName(@"ToRmaBankAccountId").HasColumnType("int").IsRequired();
            Property(x => x.OriginalAmount).HasColumnName(@"OriginalAmount").HasColumnType("decimal").IsOptional().HasPrecision(18,2);
            Property(x => x.TransferAmount).HasColumnName(@"TransferAmount").HasColumnType("decimal").IsOptional().HasPrecision(18,2);
            Property(x => x.FromTransactionId).HasColumnName(@"FromTransactionId").HasColumnType("int").IsOptional();
            Property(x => x.ToTransactionId).HasColumnName(@"ToTransactionId").HasColumnType("int").IsOptional();
            Property(x => x.AllocationProgressStatus).HasColumnName(@"AllocationProgressStatusId").HasColumnType("int").IsOptional();
            Property(x => x.TransactionType).HasColumnName(@"TransactionTypeId").HasColumnType("int").IsOptional();
            Property(x => x.ReceiverDebtorNumber).HasColumnName(@"ReceiverDebtorNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.FromTransactionReference).HasColumnName(@"FromTransactionReference").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.ToTransactionReference).HasColumnName(@"ToTransactionReference").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.InterDebtorTransferId).HasColumnName(@"InterDebtorTransferId").HasColumnType("int").IsOptional();
            Property(x => x.PeriodStatus).HasColumnName(@"PeriodStatusId").HasColumnType("int").IsRequired();
            Property(x => x.FromRolePlayerId).HasColumnName(@"FromRolePlayerId").HasColumnType("int").IsOptional();
            Property(x => x.ToRolePlayerId).HasColumnName(@"ToRolePlayerId").HasColumnType("int").IsOptional();

            // Foreign keys
            HasOptional(a => a.InterDebtorTransfer).WithMany(b => b.InterBankTransfers).HasForeignKey(c => c.InterDebtorTransferId).WillCascadeOnDelete(false); // FK_InterBankTransfer_InterDebtorTransfer
            HasRequired(a => a.FromRmaBankAccount).WithMany(b => b.InterBankTransfers_FromRmaBankAccountId).HasForeignKey(c => c.FromRmaBankAccountId).WillCascadeOnDelete(false); // FK_InterBankTransfer_RmaBankAccounts
            HasRequired(a => a.ToRmaBankAccount).WithMany(b => b.InterBankTransfers_ToRmaBankAccountId).HasForeignKey(c => c.ToRmaBankAccountId).WillCascadeOnDelete(false); // FK_InterBankTransfer_RmaBankAccounts1
        }
    }

}
