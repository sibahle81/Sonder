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
    public class Load_BulkPaymentListingConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<Load_BulkPaymentListing>
    {
        public Load_BulkPaymentListingConfiguration()
            : this("Load")
        {
        }

        public Load_BulkPaymentListingConfiguration(string schema)
        {
            ToTable("BulkPaymentListing", schema);
            HasKey(x => x.Id);

            Property(x => x.Id).HasColumnName(@"Id").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.Identity);
            Property(x => x.FileIdentifier).HasColumnName(@"FileIdentifier").HasColumnType("uniqueidentifier").IsRequired();
            Property(x => x.PolicyNumber).HasColumnName(@"PolicyNumber").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(64);
            Property(x => x.CreatedDate).HasColumnName(@"CreatedDate").HasColumnType("datetime").IsRequired();
            Property(x => x.PaymentAmount).HasColumnName(@"PaymentAmount").HasColumnType("money").IsRequired().HasPrecision(19,4);
        }
    }

}
