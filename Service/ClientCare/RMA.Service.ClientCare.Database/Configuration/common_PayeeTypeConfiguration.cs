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
    public class common_PayeeTypeConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<common_PayeeType>
    {
        public common_PayeeTypeConfiguration()
            : this("common")
        {
        }

        public common_PayeeTypeConfiguration(string schema)
        {
            ToTable("PayeeType", schema);
            HasKey(x => x.PayeeTypeId);

            Property(x => x.PayeeTypeId).HasColumnName(@"PayeeTypeId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Description).HasColumnName(@"Description").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(2048);
            Property(x => x.IsSundry).HasColumnName(@"IsSundry").HasColumnType("bit").IsRequired();
            Property(x => x.IsMedical).HasColumnName(@"IsMedical").HasColumnType("bit").IsRequired();
            Property(x => x.IsPd).HasColumnName(@"IsPD").HasColumnType("bit").IsRequired();
            Property(x => x.IsFatal).HasColumnName(@"IsFatal").HasColumnType("bit").IsRequired();
            Property(x => x.IsDaysOff).HasColumnName(@"IsDaysOff").HasColumnType("bit").IsRequired();
            Property(x => x.IsFuneralBenefit).HasColumnName(@"IsFuneralBenefit").HasColumnType("bit").IsRequired();
            Property(x => x.IsPension).HasColumnName(@"IsPension").HasColumnType("bit").IsRequired();
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
        }
    }

}
