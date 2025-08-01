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
    public class medical_TebaInvoiceLineConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<medical_TebaInvoiceLine>
    {
        public medical_TebaInvoiceLineConfiguration()
            : this("medical")
        {
        }

        public medical_TebaInvoiceLineConfiguration(string schema)
        {
            ToTable("TebaInvoiceLine", schema);
            HasKey(x => x.TebaInvoiceLineId);

            Property(x => x.TebaInvoiceLineId).HasColumnName(@"TebaInvoiceLineId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.TebaInvoiceId).HasColumnName(@"TebaInvoiceId").HasColumnType("int").IsRequired();
            Property(x => x.ServiceDate).HasColumnName(@"ServiceDate").HasColumnType("datetime").IsRequired();
            Property(x => x.RequestedQuantity).HasColumnName(@"RequestedQuantity").HasColumnType("decimal").IsOptional().HasPrecision(7,2);
            Property(x => x.AuthorisedQuantity).HasColumnName(@"AuthorisedQuantity").HasColumnType("decimal").IsRequired().HasPrecision(7,2);
            Property(x => x.RequestedAmount).HasColumnName(@"RequestedAmount").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.RequestedVat).HasColumnName(@"RequestedVAT").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.RequestedAmountInclusive).HasColumnName(@"RequestedAmountInclusive").HasColumnType("decimal").IsOptional().HasPrecision(19,2).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Computed);
            Property(x => x.AuthorisedAmount).HasColumnName(@"AuthorisedAmount").HasColumnType("decimal").IsOptional().HasPrecision(18,2);
            Property(x => x.AuthorisedVat).HasColumnName(@"AuthorisedVAT").HasColumnType("decimal").IsOptional().HasPrecision(18,2);
            Property(x => x.AuthorisedAmountInclusive).HasColumnName(@"AuthorisedAmountInclusive").HasColumnType("decimal").IsOptional().HasPrecision(19,2).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Computed);
            Property(x => x.TariffId).HasColumnName(@"TariffId").HasColumnType("int").IsRequired();
            Property(x => x.TotalTariffAmount).HasColumnName(@"TotalTariffAmount").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.TotalTariffVat).HasColumnName(@"TotalTariffVAT").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.TotalTariffAmountInclusive).HasColumnName(@"TotalTariffAmountInclusive").HasColumnType("decimal").IsOptional().HasPrecision(19,2).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Computed);
            Property(x => x.TariffAmount).HasColumnName(@"TariffAmount").HasColumnType("decimal").IsOptional().HasPrecision(30,10).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Computed);
            Property(x => x.CreditAmount).HasColumnName(@"CreditAmount").HasColumnType("decimal").IsRequired().HasPrecision(18,2);
            Property(x => x.VatCode).HasColumnName(@"VatCodeId").HasColumnType("int").IsRequired();
            Property(x => x.VatPercentage).HasColumnName(@"VATPercentage").HasColumnType("decimal").IsOptional().HasPrecision(7,2);
            Property(x => x.TreatmentCodeId).HasColumnName(@"TreatmentCodeId").HasColumnType("int").IsRequired();
            Property(x => x.MedicalItemId).HasColumnName(@"MedicalItemId").HasColumnType("int").IsRequired();
            Property(x => x.HcpTariffCode).HasColumnName(@"HCPTariffCode").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(12);
            Property(x => x.TariffBaseUnitCostTypeId).HasColumnName(@"TariffBaseUnitCostTypeId").HasColumnType("int").IsOptional();
            Property(x => x.Description).HasColumnName(@"Description").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(200);
            Property(x => x.SummaryInvoiceLineId).HasColumnName(@"SummaryInvoiceLineId").HasColumnType("int").IsOptional();
            Property(x => x.IsPerDiemCharge).HasColumnName(@"IsPerDiemCharge").HasColumnType("bit").IsRequired();
            Property(x => x.IsDuplicate).HasColumnName(@"IsDuplicate").HasColumnType("bit").IsRequired();
            Property(x => x.DuplicateTebaInvoiceLineId).HasColumnName(@"DuplicateTebaInvoiceLineId").HasColumnType("int").IsRequired();
            Property(x => x.CalculateOperands).HasColumnName(@"CalculateOperands").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(200);
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.TebaInvoice).WithMany(b => b.TebaInvoiceLines).HasForeignKey(c => c.TebaInvoiceId).WillCascadeOnDelete(false); // FK_TebaInvoiceLine_TebaInvoice
        }
    }

}
