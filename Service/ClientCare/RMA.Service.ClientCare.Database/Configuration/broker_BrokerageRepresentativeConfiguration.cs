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
    public class broker_BrokerageRepresentativeConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<broker_BrokerageRepresentative>
    {
        public broker_BrokerageRepresentativeConfiguration()
            : this("broker")
        {
        }

        public broker_BrokerageRepresentativeConfiguration(string schema)
        {
            ToTable("BrokerageRepresentative", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.BrokerageId).HasColumnName(@"BrokerageId").HasColumnType("int").IsRequired();
            Property(x => x.RepresentativeId).HasColumnName(@"RepresentativeId").HasColumnType("int").IsRequired();
            Property(x => x.RepRole).HasColumnName(@"RepRoleId").HasColumnType("int").IsRequired();
            Property(x => x.StartDate).HasColumnName(@"StartDate").HasColumnType("date").IsOptional();
            Property(x => x.EndDate).HasColumnName(@"EndDate").HasColumnType("date").IsOptional();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.JuristicRepId).HasColumnName(@"JuristicRepId").HasColumnType("int").IsOptional();

            // Foreign keys
            HasOptional(a => a.JuristicRep).WithMany(b => b.BrokerageJuristicRepresentatives).HasForeignKey(c => c.JuristicRepId).WillCascadeOnDelete(false); // FK_BrokerageRepresentative_JuristicRepresentative
            HasRequired(a => a.Brokerage).WithMany(b => b.BrokerageRepresentatives).HasForeignKey(c => c.BrokerageId).WillCascadeOnDelete(false); // FK_BrokerageAgent_Brokerage
            HasRequired(a => a.Representative).WithMany(b => b.BrokerageRepresentatives).HasForeignKey(c => c.RepresentativeId).WillCascadeOnDelete(false); // FK_BrokerageRepresentative_Representative
        }
    }

}
