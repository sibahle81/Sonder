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
    public class common_ImportCityConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<common_ImportCity>
    {
        public common_ImportCityConfiguration()
            : this("common")
        {
        }

        public common_ImportCityConfiguration(string schema)
        {
            ToTable("ImportCities", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(256);
            Property(x => x.FeatureClass).HasColumnName(@"FeatureClass").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(8);
            Property(x => x.FeatureCode).HasColumnName(@"FeatureCode").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(16);
            Property(x => x.Province).HasColumnName(@"Province").HasColumnType("int").IsRequired();
            Property(x => x.ProvinceId).HasColumnName(@"ProvinceId").HasColumnType("int").IsRequired();
        }
    }

}
