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
    public class Load_ClientRateUploadErrorAuditConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<Load_ClientRateUploadErrorAudit>
    {
        public Load_ClientRateUploadErrorAuditConfiguration()
            : this("Load")
        {
        }

        public Load_ClientRateUploadErrorAuditConfiguration(string schema)
        {
            ToTable("ClientRateUploadErrorAudit", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.FileIdentifier).HasColumnName(@"FileIdentifier").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(128);
            Property(x => x.FileName).HasColumnName(@"FileName").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.IndustryClass).HasColumnName(@"IndustryClassId").HasColumnType("int").IsRequired();
            Property(x => x.MemberNo).HasColumnName(@"MemberNo").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(150);
            Property(x => x.RefNo).HasColumnName(@"RefNo").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ErrorCategory).HasColumnName(@"ErrorCategory").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(128);
            Property(x => x.ErrorMessage).HasColumnName(@"ErrorMessage").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(256);
            Property(x => x.ExcelRowNumber).HasColumnName(@"ExcelRowNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsOptional();
        }
    }

}
