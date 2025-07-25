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
using RMA.Service.MediCare.Database.Entities;

namespace RMA.Service.MediCare.Database.Configuration
{
    public class medical_SwitchConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<medical_Switch>
    {
        public medical_SwitchConfiguration()
            : this("medical")
        {
        }

        public medical_SwitchConfiguration(string schema)
        {
            ToTable("Switch", schema);
            HasKey(x => x.SwitchId);

            Property(x => x.SwitchId).HasColumnName(@"SwitchId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Description).HasColumnName(@"Description").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(2048);
            Property(x => x.DownloadUrl).HasColumnName(@"DownloadUrl").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.CardHolderUrl).HasColumnName(@"CardHolderUrl").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.ResponseFileUrl).HasColumnName(@"ResponseFileUrl").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.DownloadDirectory).HasColumnName(@"DownloadDirectory").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.FtpUser).HasColumnName(@"FTPUser").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.FtpPassword).HasColumnName(@"FTPPassword").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.LastFileNumber).HasColumnName(@"LastFileNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.FileNumberRegex).HasColumnName(@"FileNumberRegex").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(150);
            Property(x => x.FileFormat).HasColumnName(@"FileFormat").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.DownloadActive).HasColumnName(@"DownloadActive").HasColumnType("bit").IsOptional();
            Property(x => x.CardHolderActive).HasColumnName(@"CardHolderActive").HasColumnType("bit").IsOptional();
            Property(x => x.ResponseFileActive).HasColumnName(@"ResponseFileActive").HasColumnType("bit").IsOptional();
            Property(x => x.CardHolderFilePrefix).HasColumnName(@"CardHolderFilePrefix").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(10);
            Property(x => x.DownloadFilePrefix).HasColumnName(@"DownloadFilePrefix").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(10);
            Property(x => x.LastDownloadDate).HasColumnName(@"LastDownloadDate").HasColumnType("datetime").IsOptional();
            Property(x => x.AssignToRole).HasColumnName(@"AssignToRole").HasColumnType("int").IsOptional();
            Property(x => x.DownloadNamingType).HasColumnName(@"DownloadNamingType").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Protocol).HasColumnName(@"Protocol").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.FtpSecure).HasColumnName(@"FTPSecure").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.SsHostKeyFingerprint).HasColumnName(@"SsHostKeyFingerprint").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(100);
            Property(x => x.PortNumber).HasColumnName(@"PortNumber").HasColumnType("int").IsOptional();
            Property(x => x.LastRemittanceDate).HasColumnName(@"LastRemittanceDate").HasColumnType("datetime").IsOptional();
            Property(x => x.SshPrivateKeyPath).HasColumnName(@"SshPrivateKeyPath").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ContactPerson).HasColumnName(@"ContactPerson").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(200);
            Property(x => x.EmailAddress).HasColumnName(@"EmailAddress").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(300);
            Property(x => x.HostName).HasColumnName(@"HostName").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(200);
            Property(x => x.UseSecondRegexGroup).HasColumnName(@"UseSecondRegexGroup").HasColumnType("int").IsOptional();
            Property(x => x.ResponseFileNumber).HasColumnName(@"ResponseFileNumber").HasColumnType("int").IsOptional();
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
        }
    }

}
