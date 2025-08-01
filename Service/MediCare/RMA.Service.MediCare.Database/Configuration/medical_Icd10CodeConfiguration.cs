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
    public class medical_Icd10CodeConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<medical_Icd10Code>
    {
        public medical_Icd10CodeConfiguration()
            : this("medical")
        {
        }

        public medical_Icd10CodeConfiguration(string schema)
        {
            ToTable("ICD10Code", schema);
            HasKey(x => x.Icd10CodeId);

            Property(x => x.Icd10CodeId).HasColumnName(@"ICD10CodeID").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.Icd10Code).HasColumnName(@"ICD10Code").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(8);
            Property(x => x.Icd10CodeDescription).HasColumnName(@"ICD10CodeDescription").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(1000);
            Property(x => x.Icd10SubCategoryId).HasColumnName(@"ICD10SubCategoryId").HasColumnType("int").IsRequired();
            Property(x => x.IsActive).HasColumnName(@"IsActive").HasColumnType("bit").IsRequired();
            Property(x => x.IsDeleted).HasColumnName(@"IsDeleted").HasColumnType("bit").IsRequired();
            Property(x => x.CreatedBy).HasColumnName(@"CreatedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.ModifiedBy).HasColumnName(@"ModifiedBy").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
            Property(x => x.ModifiedDate).HasColumnName(@"ModifiedDate").HasColumnType("datetime").IsRequired();

            // Foreign keys
            HasRequired(a => a.Icd10SubCategory).WithMany(b => b.Icd10Code).HasForeignKey(c => c.Icd10SubCategoryId).WillCascadeOnDelete(false); // FK_ICD10Code_ICD10SubCategory
        }
    }

}
