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
    public class policy_PolicyInsuredLifeConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<policy_PolicyInsuredLife>
    {
        public policy_PolicyInsuredLifeConfiguration()
            : this("policy")
        {
        }

        public policy_PolicyInsuredLifeConfiguration(string schema)
        {
            ToTable("PolicyInsuredLives", schema);
            HasKey(x => new { x.PolicyId, x.RolePlayerId });

            Property(x => x.PolicyId).HasColumnName(@"PolicyId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.RolePlayerId).HasColumnName(@"RolePlayerId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.StatedBenefitId).HasColumnName(@"StatedBenefitId").HasColumnType("int").IsRequired();
            Property(x => x.RolePlayerTypeId).HasColumnName(@"RolePlayerTypeId").HasColumnType("int").IsRequired();
            Property(x => x.InsuredLifeStatus).HasColumnName(@"InsuredLifeStatusId").HasColumnType("int").IsRequired();
            Property(x => x.StartDate).HasColumnName(@"StartDate").HasColumnType("datetime").IsRequired();
            Property(x => x.EndDate).HasColumnName(@"EndDate").HasColumnType("datetime").IsOptional();
            Property(x => x.InsuredLifeRemovalReason).HasColumnName(@"InsuredLifeRemovalReasonId").HasColumnType("int").IsOptional();
            Property(x => x.Skilltype).HasColumnName(@"Skilltype").HasColumnType("int").IsOptional();
            Property(x => x.Earnings).HasColumnName(@"Earnings").HasColumnType("money").IsOptional().HasPrecision(19,4);
            Property(x => x.Allowance).HasColumnName(@"Allowance").HasColumnType("money").IsOptional().HasPrecision(19,4);
            Property(x => x.Premium).HasColumnName(@"Premium").HasColumnType("money").IsOptional().HasPrecision(19,4);
            Property(x => x.CoverAmount).HasColumnName(@"CoverAmount").HasColumnType("money").IsOptional().HasPrecision(19,4);
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.Policy).WithMany(b => b.PolicyInsuredLives).HasForeignKey(c => c.PolicyId).WillCascadeOnDelete(false); // FK_PolicyInsuredLives_Policy
            HasRequired(a => a.RolePlayer).WithMany(b => b.PolicyInsuredLives).HasForeignKey(c => c.RolePlayerId).WillCascadeOnDelete(false); // FK_PolicyInsuredLives_RolePlayer
            HasRequired(a => a.RolePlayerType).WithMany(b => b.PolicyInsuredLives).HasForeignKey(c => c.RolePlayerTypeId).WillCascadeOnDelete(false); // FK_PolicyRolePlayer_RolePlayerType
        }
    }

}
