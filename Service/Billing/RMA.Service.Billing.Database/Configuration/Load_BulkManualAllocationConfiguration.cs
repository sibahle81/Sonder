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
    public class Load_BulkManualAllocationConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<Load_BulkManualAllocation>
    {
        public Load_BulkManualAllocationConfiguration()
            : this("Load")
        {
        }

        public Load_BulkManualAllocationConfiguration(string schema)
        {
            ToTable("BulkManualAllocation", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.BankAccountNumber).HasColumnName(@"BankAccountNumber").HasColumnType("nvarchar").IsOptional().HasMaxLength(50);
            Property(x => x.UserReference).HasColumnName(@"UserReference").HasColumnType("nvarchar").IsOptional().HasMaxLength(200);
            Property(x => x.StatementReference).HasColumnName(@"StatementReference").HasColumnType("nvarchar").IsOptional().HasMaxLength(200);
            Property(x => x.TransactionDate).HasColumnName(@"TransactionDate").HasColumnType("nvarchar").IsOptional().HasMaxLength(50);
            Property(x => x.Amount).HasColumnName(@"Amount").HasColumnType("nvarchar").IsOptional().HasMaxLength(50);
            Property(x => x.Status).HasColumnName(@"Status").HasColumnType("nvarchar").IsOptional().HasMaxLength(50);
            Property(x => x.UserReference2).HasColumnName(@"UserReference2").HasColumnType("nvarchar").IsOptional().HasMaxLength(200);
            Property(x => x.ReferenceType).HasColumnName(@"ReferenceType").HasColumnType("nvarchar").IsOptional().HasMaxLength(100);
            Property(x => x.Allocatable).HasColumnName(@"Allocatable").HasColumnType("nvarchar").IsOptional().HasMaxLength(10);
            Property(x => x.AllocateTo).HasColumnName(@"AllocateTo").HasColumnType("nvarchar").IsOptional().HasMaxLength(200);
            Property(x => x.BulkAllocationFileId).HasColumnName(@"BulkAllocationFileId").HasColumnType("int").IsRequired();
            Property(x => x.Error).HasColumnName(@"Error").HasColumnType("nvarchar").IsOptional().HasMaxLength(500);
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.LineProcessingStatusId).HasColumnName(@"LineProcessingStatusId").HasColumnType("int").IsOptional();
            Property(x => x.PeriodId).HasColumnName(@"PeriodId").HasColumnType("int").IsOptional();

            // Foreign keys
            HasRequired(a => a.BulkAllocationFile).WithMany(b => b.BulkManualAllocations).HasForeignKey(c => c.BulkAllocationFileId).WillCascadeOnDelete(false); // FK_BulkManualAllocation_BulkManualAllocation1
        }
    }

}
