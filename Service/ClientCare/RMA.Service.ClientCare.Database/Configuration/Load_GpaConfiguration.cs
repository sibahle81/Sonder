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
    public class Load_GpaConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<Load_Gpa>
    {
        public Load_GpaConfiguration()
            : this("Load")
        {
        }

        public Load_GpaConfiguration(string schema)
        {
            ToTable("GPA", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.FileIdentifier).HasColumnName(@"FileIdentifier").HasColumnType("uniqueidentifier").IsRequired();
            Property(x => x.ClientReference).HasColumnName(@"ClientReference").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.Company).HasColumnName(@"Company").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.EmployeeNumber).HasColumnName(@"EmployeeNumber").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.IdNumber).HasColumnName(@"IdNumber").HasColumnType("nvarchar").IsRequired().HasMaxLength(20);
            Property(x => x.IdType).HasColumnName(@"IdType").HasColumnType("nvarchar").IsOptional().HasMaxLength(20);
            Property(x => x.DateOfBirth).HasColumnName(@"DateOfBirth").HasColumnType("nvarchar").IsOptional().HasMaxLength(32);
            Property(x => x.Gender).HasColumnName(@"Gender").HasColumnType("nvarchar").IsOptional().HasMaxLength(100);
            Property(x => x.FirstName).HasColumnName(@"FirstName").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.LastName).HasColumnName(@"LastName").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.Cell).HasColumnName(@"Cell").HasColumnType("nvarchar").IsRequired().HasMaxLength(20);
            Property(x => x.Email).HasColumnName(@"Email").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.MonthlyRiskSalary).HasColumnName(@"MonthlyRiskSalary").HasColumnType("int").IsRequired();
            Property(x => x.DiContribution).HasColumnName(@"DIContribution").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.DiOption).HasColumnName(@"DIOption").HasColumnType("nvarchar").IsRequired().HasMaxLength(10);
            Property(x => x.EmployeeStartDate).HasColumnName(@"EmployeeStartDate").HasColumnType("nvarchar").IsRequired().HasMaxLength(32);
            Property(x => x.Escalation).HasColumnName(@"Escalation").HasColumnType("nvarchar").IsOptional().HasMaxLength(50);
            Property(x => x.ExcelRowNumber).HasColumnName(@"ExcelRowNumber").HasColumnType("int").IsRequired();
        }
    }

}
