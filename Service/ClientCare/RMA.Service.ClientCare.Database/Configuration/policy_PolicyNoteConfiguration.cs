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
    public class policy_PolicyNoteConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<policy_PolicyNote>
    {
        public policy_PolicyNoteConfiguration()
            : this("policy")
        {
        }

        public policy_PolicyNoteConfiguration(string schema)
        {
            ToTable("PolicyNote", schema);
            HasKey(x => x.PolicyNoteId);

            Property(x => x.PolicyNoteId).HasColumnName(@"PolicyNoteId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.PolicyId).HasColumnName(@"PolicyId").HasColumnType("int").IsRequired();
            Property(x => x.Text).HasColumnName(@"Text").HasColumnType("varchar(max)").IsRequired().IsUnicode(false);
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.Policy).WithMany(b => b.PolicyNotes).HasForeignKey(c => c.PolicyId).WillCascadeOnDelete(false); // FK_PolicyNote_Policy
        }
    }

}
