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
using RMA.Service.MediCare.Database.Entities;

namespace RMA.Service.MediCare.Database.Configuration
{
    public class medical_TebaInvoiceConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<medical_TebaInvoice>
    {
        public medical_TebaInvoiceConfiguration()
            : this("medical")
        {
        }

        public medical_TebaInvoiceConfiguration(string schema)
        {
            ToTable("TebaInvoice", schema);
            HasKey(x => x.TebaInvoiceId);

            Property(x => x.TebaInvoiceId).HasColumnName(@"TebaInvoiceId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.ClaimId).HasColumnName(@"ClaimId").HasColumnType("int").IsRequired();
            Property(x => x.PersonEventId).HasColumnName(@"PersonEventId").HasColumnType("int").IsOptional();
            Property(x => x.InvoicerId).HasColumnName(@"InvoicerId").HasColumnType("int").IsRequired();
            Property(x => x.InvoicerTypeId).HasColumnName(@"InvoicerTypeId").HasColumnType("int").IsRequired();
            Property(x => x.HcpInvoiceNumber).HasColumnName(@"HCPInvoiceNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.HcpAccountNumber).HasColumnName(@"HCPAccountNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.InvoiceNumber).HasColumnName(@"InvoiceNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.InvoiceDate).HasColumnName(@"InvoiceDate").HasColumnType("datetime").IsRequired();
            Property(x => x.DateSubmitted).HasColumnName(@"DateSubmitted").HasColumnType("datetime").IsRequired();
            Property(x => x.DateReceived).HasColumnName(@"DateReceived").HasColumnType("datetime").IsOptional();
            Property(x => x.DateCompleted).HasColumnName(@"DateCompleted").HasColumnType("datetime").IsOptional();
            Property(x => x.DateTravelledFrom).HasColumnName(@"DateTravelledFrom").HasColumnType("datetime").IsOptional();
            Property(x => x.DateTravelledTo).HasColumnName(@"DateTravelledTo").HasColumnType("datetime").IsOptional();
            Property(x => x.PreAuthId).HasColumnName(@"PreAuthId").HasColumnType("int").IsOptional();
            Property(x => x.InvoiceStatus).HasColumnName(@"InvoiceStatusId").HasColumnType("int").IsRequired();
            Property(x => x.InvoiceAmount).HasColumnName(@"InvoiceAmount").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.InvoiceVat).HasColumnName(@"InvoiceVAT").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.InvoiceTotalInclusive).HasColumnName(@"InvoiceTotalInclusive").HasColumnType("decimal").IsOptional().HasPrecision(19,2).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Computed);
            Property(x => x.AuthorisedAmount).HasColumnName(@"AuthorisedAmount").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.AuthorisedVat).HasColumnName(@"AuthorisedVAT").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.AuthorisedTotalInclusive).HasColumnName(@"AuthorisedTotalInclusive").HasColumnType("decimal").IsOptional().HasPrecision(19,2).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Computed);
            Property(x => x.PayeeId).HasColumnName(@"PayeeId").HasColumnType("int").IsRequired();
            Property(x => x.PayeeTypeId).HasColumnName(@"PayeeTypeId").HasColumnType("int").IsRequired();
            Property(x => x.HoldingKey).HasColumnName(@"HoldingKey").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.IsPaymentDelay).HasColumnName(@"IsPaymentDelay").HasColumnType("bit").IsRequired();
            Property(x => x.IsPreauthorised).HasColumnName(@"IsPreauthorised").HasColumnType("bit").IsRequired();
            Property(x => x.Description).HasColumnName(@"Description").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(200);
            Property(x => x.CalcOperands).HasColumnName(@"CalcOperands").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(200);
            Property(x => x.Kilometers).HasColumnName(@"Kilometers").HasColumnType("decimal").IsRequired().HasPrecision(7,2);
            Property(x => x.KilometerRate).HasColumnName(@"KilometerRate").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.TebaTariffCode).HasColumnName(@"TebaTariffCode").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(10);
            Property(x => x.VatCode).HasColumnName(@"VatCodeId").HasColumnType("int").IsRequired();
            Property(x => x.VatPercentage).HasColumnName(@"VATPercentage").HasColumnType("decimal").IsOptional().HasPrecision(7,2);
            Property(x => x.SwitchBatchId).HasColumnName(@"SwitchBatchId").HasColumnType("int").IsRequired();
            Property(x => x.SwitchTransactionNo).HasColumnName(@"SwitchTransactionNo").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
        }
    }

}
