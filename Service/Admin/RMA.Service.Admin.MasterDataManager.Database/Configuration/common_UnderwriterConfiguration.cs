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
    public class common_UnderwriterConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<common_Underwriter>
    {
        public common_UnderwriterConfiguration()
            : this("common")
        {
        }

        public common_UnderwriterConfiguration(string schema)
        {
            ToTable("Underwriter", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(255);
            Property(x => x.TenantId).HasColumnName(@"TenantId").HasColumnType("int").IsRequired();
        }
    }

}
