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
using RMA.Service.ClaimCare.Database.Entities;

namespace RMA.Service.ClaimCare.Database.Configuration
{
    public class claim_ReferralRatingConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<claim_ReferralRating>
    {
        public claim_ReferralRatingConfiguration()
            : this("claim")
        {
        }

        public claim_ReferralRatingConfiguration(string schema)
        {
            ToTable("ReferralRating", schema);
            HasKey(x => x.ReferralRating);

            Property(x => x.ReferralRating).HasColumnName(@"ReferralRatingID").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.Name).HasColumnName(@"Name").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50);
        }
    }

}
