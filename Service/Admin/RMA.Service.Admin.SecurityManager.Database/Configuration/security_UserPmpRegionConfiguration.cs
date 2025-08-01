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
using RMA.Service.Admin.SecurityManager.Contracts.Enums;
using RMA.Service.Admin.SecurityManager.Database.Entities;

namespace RMA.Service.Admin.SecurityManager.Database.Configuration
{
    public class security_UserPmpRegionConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<security_UserPmpRegion>
    {
        public security_UserPmpRegionConfiguration()
            : this("security")
        {
        }

        public security_UserPmpRegionConfiguration(string schema)
        {
            ToTable("UserPMPRegion", schema);
            HasKey(x => new { x.UserId, x.PmpRegionId });

            Property(x => x.UserId).HasColumnName(@"UserId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.PmpRegionId).HasColumnName(@"PMPRegionId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.IsDefaultRegion).HasColumnName(@"IsDefaultRegion").HasColumnType("bit").IsRequired();
            Property(x => x.PreferredMca).HasColumnName(@"PreferredMCA").HasColumnType("bit").IsOptional();
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.User).WithMany(b => b.UserPmpRegions).HasForeignKey(c => c.UserId).WillCascadeOnDelete(false); // FK_UserPMPRegion_User
        }
    }

}
