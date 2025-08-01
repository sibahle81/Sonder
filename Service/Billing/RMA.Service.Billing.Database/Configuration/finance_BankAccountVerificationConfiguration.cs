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
using RMA.Service.Billing.Database.Entities;

namespace RMA.Service.Billing.Database.Configuration
{
    public class finance_BankAccountVerificationConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<finance_BankAccountVerification>
    {
        public finance_BankAccountVerificationConfiguration()
            : this("finance")
        {
        }

        public finance_BankAccountVerificationConfiguration(string schema)
        {
            ToTable("BankAccountVerification", schema);
            HasKey(x => x.BankAccountVerificationId);

            Property(x => x.BankAccountVerificationId).HasColumnName(@"BankAccountVerificationId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.IsValid).HasColumnName(@"IsValid").HasColumnType("bit").IsOptional();
            Property(x => x.BankAccountVerificationPurposeType).HasColumnName(@"BankAccountVerificationPurposeTypeId").HasColumnType("int").IsRequired();
            Property(x => x.AccountNumber).HasColumnName(@"AccountNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(20);
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
        }
    }

}
