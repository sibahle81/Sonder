//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//		
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using RMA.Common.Database.Contracts.Repository;
using RMA.Service.Admin.CampaignManager.Database.Entities;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.Admin.CampaignManager.Database.Configuration
{
    public class campaign_EmailTemplateConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<campaign_EmailTemplate>
    {
        public campaign_EmailTemplateConfiguration()
            : this("campaign")
        {
        }

        public campaign_EmailTemplateConfiguration(string schema)
        {
            ToTable("EmailTemplate", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.TemplateType).HasColumnName(@"TemplateTypeId").HasColumnType("int").IsOptional();
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Template).HasColumnName(@"Template").HasColumnType("varchar(max)").IsRequired().IsUnicode(false);
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
        }
    }

}
