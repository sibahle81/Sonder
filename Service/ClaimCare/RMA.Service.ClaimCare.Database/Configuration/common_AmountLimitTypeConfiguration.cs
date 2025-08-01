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
using RMA.Service.ClaimCare.Database.Entities;

namespace RMA.Service.ClaimCare.Database.Configuration
{
    public class common_AmountLimitTypeConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<common_AmountLimitType>
    {
        public common_AmountLimitTypeConfiguration()
            : this("common")
        {
        }

        public common_AmountLimitTypeConfiguration(string schema)
        {
            ToTable("AmountLimitType", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Description).HasColumnName(@"Description").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
        }
    }

}
