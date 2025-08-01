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
    public class claim_PaymentReversalTestConfiguration : System.Data.Entity.ModelConfiguration.EntityTypeConfiguration<claim_PaymentReversalTest>
    {
        public claim_PaymentReversalTestConfiguration()
            : this("claim")
        {
        }

        public claim_PaymentReversalTestConfiguration(string schema)
        {
            ToTable("PaymentReversalTest", schema);
            HasKey(x => new { x.TransactionId, x.Branch, x.RequestedReversal, x.DebtorCreated, x.ReversalAmount, x.Date, x.Class, x.Product, x.ProductId, x.AuthorisedBy });

            Property(x => x.TransactionId).HasColumnName(@"Transaction_ID").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.ClaimNumber).HasColumnName(@"Claim_Number").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(50);
            Property(x => x.Branch).HasColumnName(@"Branch").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.RequestedReversal).HasColumnName(@"Requested_reversal").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.DebtorCreated).HasColumnName(@"Debtor_created").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(80).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.ReversalReason).HasColumnName(@"Reversal_Reason").HasColumnType("varchar").IsOptional().IsUnicode(false).HasMaxLength(255);
            Property(x => x.ReversalAmount).HasColumnName(@"Reversal_amount").HasColumnType("decimal").IsRequired().HasPrecision(18,2).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.Date).HasColumnName(@"Date").HasColumnType("datetime").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.Class).HasColumnName(@"Class").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.Product).HasColumnName(@"Product").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.ProductId).HasColumnName(@"ProductId").HasColumnType("int").IsRequired().HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
            Property(x => x.AuthorisedBy).HasColumnName(@"Authorised_By").HasColumnType("varchar").IsRequired().IsUnicode(false).HasMaxLength(50).HasDatabaseGeneratedOption(System.ComponentModel.DataAnnotations.Schema.DatabaseGeneratedOption.None);
        }
    }

}
