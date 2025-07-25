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
    public class claim_EuropAssistNotificationConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<claim_EuropAssistNotification>
    {
        public claim_EuropAssistNotificationConfiguration()
            : this("claim")
        {
        }

        public claim_EuropAssistNotificationConfiguration(string schema)
        {
            ToTable("EuropAssistNotification", schema);
            HasKey(x => new { x.EuropAssistNotificationId, x.ClaimId, x.ClaimSatusId, x.RequestData, x.CreatedBy, x.CreatedDate, x.ModifiedBy, x.ModifiedDate });

            Property(x => x.EuropAssistNotificationId).HasColumnName(@"EuropAssistNotificationId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.ClaimId).HasColumnName(@"ClaimId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.ClaimSatusId).HasColumnName(@"ClaimSatusId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.RequestData).HasColumnName(@"RequestData").HasColumnType("varchar(max)").IsRequired().IsUnicode(false).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.ResponseDate).HasColumnName(@"ResponseDate").HasColumnType("datetime").IsOptional();
            Property(x => x.ResponseMessage).HasColumnName(@"ResponseMessage").HasColumnType("varchar(max)").IsOptional().IsUnicode(false);
            Property(x => x.IsSent).HasColumnName(@"isSent").HasColumnType("bit").IsOptional();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);

            // Foreign keys
            HasRequired(a => a.Claim).WithMany(b => b.EuropAssistNotifications).HasForeignKey(c => c.ClaimId).WillCascadeOnDelete(false); // FK_EuropAssistNotification_claim
        }
    }

}
