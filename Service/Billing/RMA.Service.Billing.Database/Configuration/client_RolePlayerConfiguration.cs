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
    public class client_RolePlayerConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<client_RolePlayer>
    {
        public client_RolePlayerConfiguration()
            : this("client")
        {
        }

        public client_RolePlayerConfiguration(string schema)
        {
            ToTable("RolePlayer", schema);
            HasKey(x => x.RolePlayerId);

            Property(x => x.RolePlayerId).HasColumnName(@"RolePlayerId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.DisplayName).HasColumnName(@"DisplayName").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(255);
            Property(x => x.TellNumber).HasColumnName(@"TellNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(25);
            Property(x => x.CellNumber).HasColumnName(@"CellNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(25);
            Property(x => x.EmailAddress).HasColumnName(@"EmailAddress").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.PreferredCommunicationTypeId).HasColumnName(@"PreferredCommunicationTypeId").HasColumnType("int").IsOptional();
            Property(x => x.RolePlayerIdentificationType).HasColumnName(@"RolePlayerIdentificationTypeId").HasColumnType("int").IsRequired();
            Property(x => x.RepresentativeId).HasColumnName(@"RepresentativeId").HasColumnType("int").IsOptional();
            Property(x => x.AccountExecutiveId).HasColumnName(@"AccountExecutiveId").HasColumnType("int").IsOptional();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.RolePlayerBenefitWaitingPeriod).HasColumnName(@"RolePlayerBenefitWaitingPeriodId").HasColumnType("int").IsOptional();
            Property(x => x.ClientType).HasColumnName(@"ClientTypeId").HasColumnType("int").IsOptional();
            Property(x => x.MemberStatus).HasColumnName(@"MemberStatusId").HasColumnType("int").IsRequired();
        }
    }

}
