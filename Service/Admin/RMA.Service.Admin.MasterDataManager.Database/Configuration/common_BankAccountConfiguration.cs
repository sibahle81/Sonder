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
using RMA.Service.Admin.MasterDataManager.Database.Entities;

namespace RMA.Service.Admin.MasterDataManager.Database.Configuration
{
    public class common_BankAccountConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<common_BankAccount>
    {
        public common_BankAccountConfiguration()
            : this("common")
        {
        }

        public common_BankAccountConfiguration(string schema)
        {
            ToTable("BankAccount", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.DepartmentName).HasColumnName(@"DepartmentName").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.BankId).HasColumnName(@"BankId").HasColumnType("int").IsRequired();
            Property(x => x.BankAccountType).HasColumnName(@"BankAccountTypeId").HasColumnType("int").IsRequired();
            Property(x => x.ClientType).HasColumnName(@"ClientTypeId").HasColumnType("int").IsOptional();
            Property(x => x.AccountNumber).HasColumnName(@"AccountNumber").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(25);
            Property(x => x.AccountName).HasColumnName(@"AccountName").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(25);
            Property(x => x.BranchId).HasColumnName(@"BranchId").HasColumnType("int").IsRequired();
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.TransactionType).HasColumnName(@"TransactionType").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(6);

            // Foreign keys
            HasRequired(a => a.Bank).WithMany(b => b.BankAccounts).HasForeignKey(c => c.BankId).WillCascadeOnDelete(false); // FK_common.BankAccount_Bank
            HasRequired(a => a.BankBranch).WithMany(b => b.BankAccounts).HasForeignKey(c => c.BranchId).WillCascadeOnDelete(false); // FK_BankAccount_BankBranch
        }
    }

}
