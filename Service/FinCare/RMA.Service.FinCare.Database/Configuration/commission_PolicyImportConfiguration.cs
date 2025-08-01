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
using RMA.Service.FinCare.Contracts.Enums;
using RMA.Service.FinCare.Database.Entities;

namespace RMA.Service.FinCare.Database.Configuration
{
    public class commission_PolicyImportConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<commission_PolicyImport>
    {
        public commission_PolicyImportConfiguration()
            : this("commission")
        {
        }

        public commission_PolicyImportConfiguration(string schema)
        {
            ToTable("PolicyImport", schema);
            HasKey(x => x.Rowid);

            Property(x => x.ImportBatch).HasColumnName(@"ImportBatch").HasColumnType("int").IsRequired();
            Property(x => x.Rowid).HasColumnName(@"rowid").HasColumnType("bigint").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.BrokerName).HasColumnName(@"BrokerName").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(255);
            Property(x => x.BrokerRepId).HasColumnName(@"BrokerRepID").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.PolicyNumber).HasColumnName(@"PolicyNumber").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(18);
            Property(x => x.ProductId).HasColumnName(@"ProductID").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(35);
            Property(x => x.PolicyStatus).HasColumnName(@"PolicyStatus").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(30);
            Property(x => x.PolicyCaptureDate).HasColumnName(@"PolicyCaptureDate").HasColumnType("date").IsOptional();
            Property(x => x.PolicyQaddDate).HasColumnName(@"PolicyQADDDate").HasColumnType("date").IsOptional();
            Property(x => x.PolicyInceptionDate).HasColumnName(@"PolicyInceptionDate").HasColumnType("date").IsRequired();
            Property(x => x.LifeId).HasColumnName(@"LifeID").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.MemberType).HasColumnName(@"MemberType").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(35);
            Property(x => x.LifeDob).HasColumnName(@"LifeDOB").HasColumnType("date").IsRequired();
            Property(x => x.LifeStatus).HasColumnName(@"LifeStatus").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(15);
            Property(x => x.BillingPremium).HasColumnName(@"BillingPremium").HasColumnType("decimal").IsOptional().HasPrecision(14,2);
            Property(x => x.CommissionablePremium).HasColumnName(@"CommissionablePremium").HasColumnType("decimal").IsOptional().HasPrecision(14,2);
            Property(x => x.CommissionablePremiumDelta).HasColumnName(@"CommissionablePremiumDelta").HasColumnType("decimal").IsOptional().HasPrecision(14,2);
            Property(x => x.AffordabilityStatus).HasColumnName(@"AffordabilityStatus").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(30);
            Property(x => x.CollectionStatus).HasColumnName(@"CollectionStatus").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(30);
            Property(x => x.FirstCollectionMonth).HasColumnName(@"FirstCollectionMonth").HasColumnType("date").IsOptional();
            Property(x => x.Importeddate).HasColumnName(@"importeddate").HasColumnType("datetime").IsRequired();
            Property(x => x.CurrentRecord).HasColumnName(@"CurrentRecord").HasColumnType("int").IsOptional();
            Property(x => x.RecordVersion).HasColumnName(@"RecordVersion").HasColumnType("int").IsOptional();
            Property(x => x.Processed).HasColumnName(@"processed").HasColumnType("int").IsOptional();
            Property(x => x.AnnIncrType).HasColumnName(@"AnnIncrType").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(60);
            Property(x => x.Parent).HasColumnName(@"parent").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1);
            Property(x => x.CoverAmt).HasColumnName(@"CoverAmt").HasColumnType("decimal").IsOptional().HasPrecision(14,2);
            Property(x => x.PrevCoverAmt).HasColumnName(@"PrevCoverAmt").HasColumnType("decimal").IsOptional().HasPrecision(14,2);
            Property(x => x.Statusdate).HasColumnName(@"statusdate").HasColumnType("datetime").IsOptional();
            Property(x => x.QLinkTransactionId).HasColumnName(@"QLinkTransactionId").HasColumnType("int").IsOptional();
            Property(x => x.PolicyId).HasColumnName(@"PolicyId").HasColumnType("int").IsOptional();
        }
    }

}
