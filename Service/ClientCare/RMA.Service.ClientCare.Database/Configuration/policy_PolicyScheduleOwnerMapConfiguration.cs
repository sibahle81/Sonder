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
    public class policy_PolicyScheduleOwnerMapConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<policy_PolicyScheduleOwnerMap>
    {
        public policy_PolicyScheduleOwnerMapConfiguration()
            : this("policy")
        {
        }

        public policy_PolicyScheduleOwnerMapConfiguration(string schema)
        {
            ToTable("PolicyScheduleOwnerMap", schema);
            HasKey(x => x.PolicyPayeeId);

            Property(x => x.PolicyScheduleOwnerMapId).HasColumnName(@"PolicyScheduleOwnerMapId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.PolicyPayeeId).HasColumnName(@"PolicyPayeeId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
        }
    }

}
