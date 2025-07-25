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
    public class security_UserBrokerageMapConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<security_UserBrokerageMap>
    {
        public security_UserBrokerageMapConfiguration()
            : this("security")
        {
        }

        public security_UserBrokerageMapConfiguration(string schema)
        {
            ToTable("UserBrokerageMap", schema);
            HasKey(x => new { x.UserId, x.BrokerageId });

            Property(x => x.UserId).HasColumnName(@"UserId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.BrokerageId).HasColumnName(@"BrokerageId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);            

            // Foreign keys
            HasRequired(a => a.User).WithMany(b => b.UserBrokerageMaps).HasForeignKey(c => c.UserId).WillCascadeOnDelete(false); // FK_UserBrokerageMap_User
        }
    }

}
