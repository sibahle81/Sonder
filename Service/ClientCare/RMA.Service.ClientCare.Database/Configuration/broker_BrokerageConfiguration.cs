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
    public class broker_BrokerageConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<broker_Brokerage>
    {
        public broker_BrokerageConfiguration()
            : this("broker")
        {
        }

        public broker_BrokerageConfiguration(string schema)
        {
            ToTable("Brokerage", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.Code).HasColumnName(@"Code").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.FspNumber).HasColumnName(@"FSPNumber").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(255);
            Property(x => x.TradeName).HasColumnName(@"TradeName").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.LegalCapacity).HasColumnName(@"LegalCapacity").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.RegNo).HasColumnName(@"RegNo").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.Status).HasColumnName(@"Status").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.CompanyType).HasColumnName(@"CompanyType").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.FaxNo).HasColumnName(@"FaxNo").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(20);
            Property(x => x.TelNo).HasColumnName(@"TelNo").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(20);
            Property(x => x.FspWebsite).HasColumnName(@"FspWebsite").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.FinYearEnd).HasColumnName(@"FinYearEnd").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.MedicalAccreditationNo).HasColumnName(@"MedicalAccreditationNo").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.StartDate).HasColumnName(@"StartDate").HasColumnType("datetime").IsOptional();
            Property(x => x.EndDate).HasColumnName(@"EndDate").HasColumnType("datetime").IsOptional();
            Property(x => x.PaymentMethod).HasColumnName(@"PaymentMethodId").HasColumnType("int").IsRequired();
            Property(x => x.PaymentFrequency).HasColumnName(@"PaymentFrequencyId").HasColumnType("int").IsRequired();
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.IsAuthorised).HasColumnName(@"IsAuthorised").HasColumnType("bit").IsRequired();
            Property(x => x.OnboardAdminFee).HasColumnName(@"OnboardAdminFee").HasColumnType("decimal").IsOptional().HasPrecision(3,2);
            Property(x => x.OnboardPercentageShare).HasColumnName(@"OnboardPercentageShare").HasColumnType("decimal").IsOptional().HasPrecision(3,2);
            Property(x => x.BrokerageType).HasColumnName(@"BrokerageTypeId").HasColumnType("int").IsRequired();
            Property(x => x.VatRegistrationNumber).HasColumnName(@"VatRegistrationNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.FicaVerified).HasColumnName(@"FicaVerified").HasColumnType("bit").IsRequired();
            Property(x => x.FicaRiskRating).HasColumnName(@"FicaRiskRating").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
        }
    }

}
