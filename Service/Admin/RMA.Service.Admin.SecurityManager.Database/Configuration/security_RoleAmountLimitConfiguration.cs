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
    public class security_RoleAmountLimitConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<security_RoleAmountLimit>
    {
        public security_RoleAmountLimitConfiguration()
            : this("security")
        {
        }

        public security_RoleAmountLimitConfiguration(string schema)
        {
            ToTable("RoleAmountLimit", schema);
            HasKey(x => x.RoleAmountLimitId);

            Property(x => x.RoleAmountLimitId).HasColumnName(@"RoleAmountLimitId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.AmountLimitType).HasColumnName(@"AmountLimitTypeId").HasColumnType("int").IsRequired();
            Property(x => x.RoleId).HasColumnName(@"RoleId").HasColumnType("int").IsRequired();
            Property(x => x.AmountLimit).HasColumnName(@"AmountLimit").HasColumnType("money").IsOptional().HasPrecision(19,4);
            Property(x => x.DaysLimit).HasColumnName(@"DaysLimit").HasColumnType("decimal").IsOptional().HasPrecision(7,2);
            Property(x => x.PdExtentLimit).HasColumnName(@"PDExtentLimit").HasColumnType("decimal").IsOptional().HasPrecision(7,2);
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.Role).WithMany(b => b.RoleAmountLimits).HasForeignKey(c => c.RoleId).WillCascadeOnDelete(false); // FK_RoleAmountLimit_Role
        }
    }

}
