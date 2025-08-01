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
    public class security_RolePermissionFflConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<security_RolePermissionFfl>
    {
        public security_RolePermissionFflConfiguration()
            : this("security")
        {
        }

        public security_RolePermissionFflConfiguration(string schema)
        {
            ToTable("RolePermissionFFL", schema);
            HasKey(x => new { x.RoleId, x.PermissionId });

            Property(x => x.RoleId).HasColumnName(@"RoleId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.PermissionId).HasColumnName(@"PermissionId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
        }
    }

}
