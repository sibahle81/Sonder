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
    public class client_LetterOfGoodStandingConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<client_LetterOfGoodStanding>
    {
        public client_LetterOfGoodStandingConfiguration()
            : this("client")
        {
        }

        public client_LetterOfGoodStandingConfiguration(string schema)
        {
            ToTable("LetterOfGoodStanding", schema);
            HasKey(x => x.LetterOfGoodStandingId);

            Property(x => x.LetterOfGoodStandingId).HasColumnName(@"LetterOfGoodStandingId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.RolePlayerId).HasColumnName(@"RolePlayerId").HasColumnType("int").IsRequired();
            Property(x => x.IssueDate).HasColumnName(@"IssueDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ExpiryDate).HasColumnName(@"ExpiryDate").HasColumnType("datetime").IsOptional();
            Property(x => x.CertificateNo).HasColumnName(@"CertificateNo").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.RolePlayer).WithMany(b => b.LetterOfGoodStandings).HasForeignKey(c => c.RolePlayerId).WillCascadeOnDelete(false); // FK_RolePlayerId_LetterOfGoodStanding
        }
    }

}
