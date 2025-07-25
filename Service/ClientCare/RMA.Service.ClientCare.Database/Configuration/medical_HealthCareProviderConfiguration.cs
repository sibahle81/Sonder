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
    public class medical_HealthCareProviderConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<medical_HealthCareProvider>
    {
        public medical_HealthCareProviderConfiguration()
            : this("medical")
        {
        }

        public medical_HealthCareProviderConfiguration(string schema)
        {
            ToTable("HealthCareProvider", schema);
            HasKey(x => x.RolePlayerId);

            Property(x => x.RolePlayerId).HasColumnName(@"RolePlayerId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(80);
            Property(x => x.Description).HasColumnName(@"Description").HasColumnType("nvarchar").IsOptional().HasMaxLength(2048);
            Property(x => x.PracticeNumber).HasColumnName(@"PracticeNumber").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.DatePracticeStarted).HasColumnName(@"DatePracticeStarted").HasColumnType("datetime").IsOptional();
            Property(x => x.DatePracticeClosed).HasColumnName(@"DatePracticeClosed").HasColumnType("datetime").IsOptional();
            Property(x => x.ProviderTypeId).HasColumnName(@"ProviderTypeId").HasColumnType("int").IsRequired();
            Property(x => x.IsVat).HasColumnName(@"IsVat").HasColumnType("bit").IsRequired();
            Property(x => x.VatRegNumber).HasColumnName(@"VATRegNumber").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ConsultingPartnerType).HasColumnName(@"ConsultingPartnerType").HasColumnType("int").IsOptional();
            Property(x => x.IsPreferred).HasColumnName(@"IsPreferred").HasColumnType("bit").IsRequired();
            Property(x => x.IsMedInvTreatmentInfoProvided).HasColumnName(@"IsMedInvTreatmentInfoProvided").HasColumnType("bit").IsRequired();
            Property(x => x.IsMedInvInjuryInfoProvided).HasColumnName(@"IsMedInvInjuryInfoProvided").HasColumnType("bit").IsRequired();
            Property(x => x.IsMineHospital).HasColumnName(@"IsMineHospital").HasColumnType("bit").IsRequired();
            Property(x => x.IsNeedTreatments).HasColumnName(@"IsNeedTreatments").HasColumnType("bit").IsRequired();
            Property(x => x.ArmType).HasColumnName(@"ArmType").HasColumnType("int").IsOptional();
            Property(x => x.ArmCode).HasColumnName(@"ArmCode").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(12);
            Property(x => x.FinSystemSynchStatusId).HasColumnName(@"FinSystemSynchStatusId").HasColumnType("int").IsRequired();
            Property(x => x.HealthCareProviderGroupId).HasColumnName(@"HealthCareProviderGroupId").HasColumnType("int").IsRequired();
            Property(x => x.DispensingLicenseNo).HasColumnName(@"DispensingLicenseNo").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.AcuteMedicalAuthNeededTypeId).HasColumnName(@"AcuteMedicalAuthNeededTypeId").HasColumnType("int").IsOptional();
            Property(x => x.ChronicMedicalAuthNeededTypeId).HasColumnName(@"ChronicMedicalAuthNeededTypeId").HasColumnType("int").IsOptional();
            Property(x => x.IsAllowSameDayTreatment).HasColumnName(@"IsAllowSameDayTreatment").HasColumnType("bit").IsRequired();
            Property(x => x.AgreementEndDate).HasColumnName(@"AgreementEndDate").HasColumnType("datetime").IsOptional();
            Property(x => x.AgreementStartDate).HasColumnName(@"AgreementStartDate").HasColumnType("datetime").IsOptional();
            Property(x => x.IsAuthorised).HasColumnName(@"IsAuthorised").HasColumnType("bit").IsOptional();
            Property(x => x.AgreementType).HasColumnName(@"AgreementType").HasColumnType("tinyint").IsOptional();
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.Hash).HasColumnName(@"Hash").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(66);
            Property(x => x.IsExcludeAutoPay).HasColumnName(@"IsExcludeAutoPay").HasColumnType("bit").IsRequired();

            // Foreign keys
            HasRequired(a => a.RolePlayer).WithOptional(b => b.HealthCareProvider).WillCascadeOnDelete(false); // FK_HealthCareProvider_RolePlayer_RolePlayerId
        }
    }

}
