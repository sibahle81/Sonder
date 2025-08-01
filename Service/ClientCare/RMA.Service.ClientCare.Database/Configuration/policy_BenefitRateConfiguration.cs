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
    public class policy_BenefitRateConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<policy_BenefitRate>
    {
        public policy_BenefitRateConfiguration()
            : this("policy")
        {
        }

        public policy_BenefitRateConfiguration(string schema)
        {
            ToTable("BenefitRate", schema);
            HasKey(x => x.BenefitRateId);

            Property(x => x.BenefitRateId).HasColumnName(@"BenefitRateId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.BenefitDetailId).HasColumnName(@"BenefitDetailId").HasColumnType("int").IsRequired();
            Property(x => x.BenefitCategoryId).HasColumnName(@"BenefitCategoryId").HasColumnType("int").IsOptional();
            Property(x => x.EffectiveDate).HasColumnName(@"EffectiveDate").HasColumnType("date").IsRequired();
            Property(x => x.BillingBasis).HasColumnName(@"BillingBasis").HasColumnType("char").IsRequired().IsFixedLength().IsUnicode(false).HasMaxLength(1);
            Property(x => x.RateValue).HasColumnName(@"RateValue").HasColumnType("decimal").IsRequired().HasPrecision(24,6);
            Property(x => x.RateStatus).HasColumnName(@"RateStatusId").HasColumnType("int").IsRequired();
            Property(x => x.IsPercentageSplit).HasColumnName(@"IsPercentageSplit").HasColumnType("bit").IsRequired();
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.PolicyBenefitDetail).WithMany(b => b.BenefitRates).HasForeignKey(c => c.BenefitDetailId).WillCascadeOnDelete(false); // PolicyBenefitDetail_BenefitRate
        }
    }

}
