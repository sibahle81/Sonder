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
    public class medical_ClinicalUpdateConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<medical_ClinicalUpdate>
    {
        public medical_ClinicalUpdateConfiguration()
            : this("medical")
        {
        }

        public medical_ClinicalUpdateConfiguration(string schema)
        {
            ToTable("ClinicalUpdate", schema);
            HasKey(x => x.ClinicalUpdateId);

            Property(x => x.ClinicalUpdateId).HasColumnName(@"ClinicalUpdateId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.PreAuthId).HasColumnName(@"PreAuthId").HasColumnType("int").IsRequired();
            Property(x => x.Diagnosis).HasColumnName(@"Diagnosis").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(2048);
            Property(x => x.Medication).HasColumnName(@"Medication").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(2048);
            Property(x => x.Comments).HasColumnName(@"Comments").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(2048);
            Property(x => x.VisitCompletionDate).HasColumnName(@"VisitCompletionDate").HasColumnType("datetime").IsOptional();
            Property(x => x.InterimAccountBalance).HasColumnName(@"InterimAccountBalance").HasColumnType("decimal").IsOptional().HasPrecision(10,2);
            Property(x => x.DischargeDate).HasColumnName(@"DischargeDate").HasColumnType("datetime").IsOptional();
            Property(x => x.SubsequentCare).HasColumnName(@"SubsequentCare").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(200);
            Property(x => x.UpdateSequenceNo).HasColumnName(@"UpdateSequenceNo").HasColumnType("smallint").IsOptional();
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.StatusId).HasColumnName(@"StatusId").HasColumnType("int").IsOptional();
            Property(x => x.ReviewComment).HasColumnName(@"ReviewComment").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.ReviewDate).HasColumnName(@"ReviewDate").HasColumnType("datetime").IsOptional();

            // Foreign keys
            HasRequired(a => a.PreAuthorisation).WithMany(b => b.ClinicalUpdates).HasForeignKey(c => c.PreAuthId).WillCascadeOnDelete(false); // FK_ClinicalUpdate_PreAuthorisation
        }
    }

}
