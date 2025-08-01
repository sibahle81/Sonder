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
    public class common_TmpDebtorsDetailConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<common_TmpDebtorsDetail>
    {
        public common_TmpDebtorsDetailConfiguration()
            : this("common")
        {
        }

        public common_TmpDebtorsDetailConfiguration(string schema)
        {
            ToTable("TmpDebtorsDetails", schema);
            HasKey(x => new { x.DebtorsId, x.OpneningBalance, x.CurrentBalance, x.AssignedOn, x.CreatedBy, x.CreatedDate, x.ModifiedBy, x.ModifiedDate });

            Property(x => x.DebtorsId).HasColumnName(@"DebtorsId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.CustomerNumber).HasColumnName(@"CustomerNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(10);
            Property(x => x.CustomerName).HasColumnName(@"CustomerName").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Book).HasColumnName(@"Book").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(20);
            Property(x => x.OpneningBalance).HasColumnName(@"OpneningBalance").HasColumnType("decimal").IsRequired().HasPrecision(18,2).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.CurrentBalance).HasColumnName(@"CurrentBalance").HasColumnType("decimal").IsRequired().HasPrecision(18,2).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.AssignedOn).HasColumnName(@"AssignedOn").HasColumnType("datetime").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.Ptp).HasColumnName(@"PTP").HasColumnType("int").IsOptional();
            Property(x => x.LastChanged).HasColumnName(@"LastChanged").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(20);
            Property(x => x.LastStatus).HasColumnName(@"LastStatus").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(20);
            Property(x => x.OverDueBy).HasColumnName(@"OverDueBy").HasColumnType("int").IsOptional();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
        }
    }

}
