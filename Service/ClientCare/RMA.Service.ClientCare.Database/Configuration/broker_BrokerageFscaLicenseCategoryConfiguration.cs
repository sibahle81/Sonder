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
    public class broker_BrokerageFscaLicenseCategoryConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<broker_BrokerageFscaLicenseCategory>
    {
        public broker_BrokerageFscaLicenseCategoryConfiguration()
            : this("broker")
        {
        }

        public broker_BrokerageFscaLicenseCategoryConfiguration(string schema)
        {
            ToTable("BrokerageFscaLicenseCategory", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.BrokerageId).HasColumnName(@"BrokerageId").HasColumnType("int").IsRequired();
            Property(x => x.FscaLicenseCategoryId).HasColumnName(@"FscaLicenseCategoryId").HasColumnType("int").IsRequired();
            Property(x => x.AdviceDateActive).HasColumnName(@"AdviceDateActive").HasColumnType("date").IsOptional();
            Property(x => x.IntermediaryDateActive).HasColumnName(@"IntermediaryDateActive").HasColumnType("date").IsOptional();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.Brokerage).WithMany(b => b.BrokerageFscaLicenseCategories).HasForeignKey(c => c.BrokerageId).WillCascadeOnDelete(false); // FK_BrokerageFscaLicenseCategory_Brokerage
            HasRequired(a => a.FscaLicenseCategory).WithMany(b => b.BrokerageFscaLicenseCategories).HasForeignKey(c => c.FscaLicenseCategoryId).WillCascadeOnDelete(false); // FK_BrokerageFscaLicenseCategory_FscaLicenseCategory
        }
    }

}
