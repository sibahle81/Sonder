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
    public class Load_MyValuePlusErrorConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<Load_MyValuePlusError>
    {
        public Load_MyValuePlusErrorConfiguration()
            : this("Load")
        {
        }

        public Load_MyValuePlusErrorConfiguration(string schema)
        {
            ToTable("MyValuePlusError", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.FileIdentifier).HasColumnName(@"FileIdentifier").HasColumnType("uniqueidentifier").IsRequired();
            Property(x => x.MainMemberName).HasColumnName(@"MainMemberName").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(128);
            Property(x => x.MainMemberIdNumber).HasColumnName(@"MainMemberIdNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(16);
            Property(x => x.ErrorCategory).HasColumnName(@"ErrorCategory").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(128);
            Property(x => x.ErrorMessage).HasColumnName(@"ErrorMessage").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(256);
            Property(x => x.ErrorDate).HasColumnName(@"ErrorDate").HasColumnType("datetime").IsRequired();
            Property(x => x.NotificationStatus).HasColumnName(@"NotificationStatusId").HasColumnType("int").IsRequired();
        }
    }

}
