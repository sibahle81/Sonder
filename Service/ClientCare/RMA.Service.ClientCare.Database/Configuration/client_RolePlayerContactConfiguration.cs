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
    public class client_RolePlayerContactConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<client_RolePlayerContact>
    {
        public client_RolePlayerContactConfiguration()
            : this("client")
        {
        }

        public client_RolePlayerContactConfiguration(string schema)
        {
            ToTable("RolePlayerContact", schema);
            HasKey(x => x.RolePlayerContactId);

            Property(x => x.RolePlayerContactId).HasColumnName(@"RolePlayerContactId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.RolePlayerId).HasColumnName(@"RolePlayerId").HasColumnType("int").IsRequired();
            Property(x => x.Title).HasColumnName(@"TitleId").HasColumnType("int").IsRequired();
            Property(x => x.Firstname).HasColumnName(@"Firstname").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.Surname).HasColumnName(@"Surname").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.EmailAddress).HasColumnName(@"EmailAddress").HasColumnType("nvarchar").IsOptional().HasMaxLength(50);
            Property(x => x.TelephoneNumber).HasColumnName(@"TelephoneNumber").HasColumnType("nvarchar").IsOptional().HasMaxLength(11);
            Property(x => x.ContactNumber).HasColumnName(@"ContactNumber").HasColumnType("nvarchar").IsOptional().HasMaxLength(11);
            Property(x => x.CommunicationType).HasColumnName(@"CommunicationTypeId").HasColumnType("int").IsRequired();
            Property(x => x.ContactDesignationType).HasColumnName(@"ContactDesignationTypeId").HasColumnType("int").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"isDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("nvarchar").IsRequired().HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.IsConfirmed).HasColumnName(@"IsConfirmed").HasColumnType("bit").IsOptional();

            // Foreign keys
            HasRequired(a => a.RolePlayer).WithMany(b => b.RolePlayerContacts).HasForeignKey(c => c.RolePlayerId).WillCascadeOnDelete(false); // FK_RolePlayerContact_RolePlayer
        }
    }

}
