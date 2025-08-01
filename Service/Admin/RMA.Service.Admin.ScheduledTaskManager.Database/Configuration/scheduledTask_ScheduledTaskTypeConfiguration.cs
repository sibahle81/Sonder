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
using RMA.Service.Admin.ScheduledTaskManager.Database.Entities;

namespace RMA.Service.Admin.ScheduledTaskManager.Database.Configuration
{
    public class scheduledTask_ScheduledTaskTypeConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<scheduledTask_ScheduledTaskType>
    {
        public scheduledTask_ScheduledTaskTypeConfiguration()
            : this("scheduledTask")
        {
        }

        public scheduledTask_ScheduledTaskTypeConfiguration(string schema)
        {
            ToTable("ScheduledTaskType", schema);
            HasKey(x => x.ScheduledTaskTypeId);

            Property(x => x.ScheduledTaskTypeId).HasColumnName(@"ScheduledTaskTypeId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.Description).HasColumnName(@"Description").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(255);
            Property(x => x.Category).HasColumnName(@"Category").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(255);
            Property(x => x.IsEnabled).HasColumnName(@"IsEnabled").HasColumnType("bit").IsRequired();
            Property(x => x.NumberOfRetriesRemaining).HasColumnName(@"NumberOfRetriesRemaining").HasColumnType("int").IsRequired();
            Property(x => x.Priority).HasColumnName(@"Priority").HasColumnType("int").IsOptional();
            Property(x => x.TaskHandler).HasColumnName(@"TaskHandler").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(1000);
        }
    }

}
