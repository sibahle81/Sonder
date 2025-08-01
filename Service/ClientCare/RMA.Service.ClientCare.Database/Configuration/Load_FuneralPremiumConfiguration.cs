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
    public class Load_FuneralPremiumConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<Load_FuneralPremium>
    {
        public Load_FuneralPremiumConfiguration()
            : this("Load")
        {
        }

        public Load_FuneralPremiumConfiguration(string schema)
        {
            ToTable("FuneralPremium", schema);
            HasKey(x => new { x.ExecutionId, x.FileIdentifier, x.FileName });

            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.Surname).HasColumnName(@"Surname").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.IdNumber).HasColumnName(@"IDNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.DateofBirth).HasColumnName(@"DateofBirth").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.PassportNumber).HasColumnName(@"PassportNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.Industrynumber).HasColumnName(@"Industrynumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.Company).HasColumnName(@"Company").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.Country).HasColumnName(@"Country").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.Date).HasColumnName(@"Date").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.TotalAmount).HasColumnName(@"TotalAmount").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.ExecutionId).HasColumnName(@"ExecutionID").HasColumnType("uniqueidentifier").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.FileIdentifier).HasColumnName(@"FileIdentifier").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(1000).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.FileName).HasColumnName(@"FileName").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(2000).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.PolicyNr).HasColumnName(@"PolicyNr").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(110);
            Property(x => x.IsProcessed).HasColumnName(@"IsProcessed").HasColumnType("bit").IsOptional();
            Property(x => x.DateProcessed).HasColumnName(@"DateProcessed").HasColumnType("datetime").IsOptional();
        }
    }

}
