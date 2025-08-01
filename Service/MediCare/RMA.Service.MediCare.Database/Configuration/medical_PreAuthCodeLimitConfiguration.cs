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
    public class medical_PreAuthCodeLimitConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<medical_PreAuthCodeLimit>
    {
        public medical_PreAuthCodeLimitConfiguration()
            : this("medical")
        {
        }

        public medical_PreAuthCodeLimitConfiguration(string schema)
        {
            ToTable("PreAuthCodeLimit", schema);
            HasKey(x => x.PreAuthCodeLimitId);

            Property(x => x.PreAuthCodeLimitId).HasColumnName(@"PreAuthCodeLimitId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.MedicalItemCode).HasColumnName(@"MedicalItemCode").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(20);
            Property(x => x.PractitionerType).HasColumnName(@"PractitionerTypeID").HasColumnType("int").IsRequired();
            Property(x => x.IsValidatePractitioner).HasColumnName(@"IsValidatePractitioner").HasColumnType("bit").IsRequired();
            Property(x => x.AuthorisationQuantityLimit).HasColumnName(@"AuthorisationQuantityLimit").HasColumnType("decimal").IsOptional().HasPrecision(18,0);
            Property(x => x.AuthorisationDaysLimit).HasColumnName(@"AuthorisationDaysLimit").HasColumnType("int").IsOptional();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();
        }
    }

}
