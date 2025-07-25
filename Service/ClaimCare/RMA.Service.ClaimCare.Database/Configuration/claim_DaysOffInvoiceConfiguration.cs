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
    public class claim_DaysOffInvoiceConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<claim_DaysOffInvoice>
    {
        public claim_DaysOffInvoiceConfiguration()
            : this("claim")
        {
        }

        public claim_DaysOffInvoiceConfiguration(string schema)
        {
            ToTable("DaysOffInvoice", schema);
            HasKey(x => x.ClaimInvoiceId);

            Property(x => x.ClaimInvoiceId).HasColumnName(@"ClaimInvoiceId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.PersonEventId).HasColumnName(@"PersonEventId").HasColumnType("int").IsRequired();
            Property(x => x.DateReceived).HasColumnName(@"DateReceived").HasColumnType("datetime").IsRequired();
            Property(x => x.AuthorisedDaysOff).HasColumnName(@"AuthorisedDaysOff").HasColumnType("int").IsOptional();
            Property(x => x.PayeeTypeId).HasColumnName(@"PayeeTypeId").HasColumnType("int").IsRequired();
            Property(x => x.Description).HasColumnName(@"Description").HasColumnType("varchar(max)").IsRequired().IsUnicode(false);
            Property(x => x.MemberName).HasColumnName(@"MemberName").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.OtherEmployer).HasColumnName(@"OtherEmployer").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.DaysOffFrom).HasColumnName(@"DaysOffFrom").HasColumnType("date").IsOptional();
            Property(x => x.DaysOffTo).HasColumnName(@"DaysOffTo").HasColumnType("date").IsOptional();
            Property(x => x.TotalDaysOff).HasColumnName(@"TotalDaysOff").HasColumnType("int").IsOptional();
            Property(x => x.InvoiceType).HasColumnName(@"InvoiceTypeId").HasColumnType("int").IsRequired();
            Property(x => x.FinalInvoice).HasColumnName(@"FinalInvoice").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.PayeeRolePlayerId).HasColumnName(@"PayeeRolePlayerId").HasColumnType("int").IsOptional();
            Property(x => x.FirstMedicalReportFormId).HasColumnName(@"FirstMedicalReportFormId").HasColumnType("int").IsOptional();

            // Foreign keys
            HasRequired(a => a.ClaimInvoice).WithOptional(b => b.DaysOffInvoice).WillCascadeOnDelete(false); // FK_DaysOffInvoice_ClaimInvoice
            HasRequired(a => a.PersonEvent).WithMany(b => b.DaysOffInvoices).HasForeignKey(c => c.PersonEventId).WillCascadeOnDelete(false); // FK_DaysOffInvoice_PersonEvent
        }
    }

}
