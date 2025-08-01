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
using RMA.Service.ScanCare.Database.Configuration;
using RMA.Service.ScanCare.Database.Context;
using RMA.Service.ScanCare.Database.Entities;

namespace RMA.Service.ScanCare.Database.Context
{

    public partial class EfDbContext : RMA.Common.Database.Repository.RmaDbContext
    {
        static EfDbContext()
        {
            System.Data.Entity.Database.SetInitializer<EfDbContext>(null);
        }

        public EfDbContext()
            : base()
        {
            InitializePartial();
        }

        public EfDbContext(string nameOrConnectionString)
            : base(nameOrConnectionString)
        {
            InitializePartial();
        }

        protected override void Dispose(bool disposing)
        {
            DisposePartial(disposing);
            base.Dispose(disposing);
        }

        protected override void OnModelCreating(System.Data.Entity.DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Configurations.Add(new documents_DocumentConfiguration());
            modelBuilder.Configurations.Add(new documents_DocumentClassificationPatternConfiguration());
            modelBuilder.Configurations.Add(new documents_DocumentKeyConfiguration());
            modelBuilder.Configurations.Add(new documents_DocumentRuleConfiguration());
            modelBuilder.Configurations.Add(new documents_DocumentSetDocumentTypeConfiguration());
            modelBuilder.Configurations.Add(new documents_DocumentSystemNameConfiguration());
            modelBuilder.Configurations.Add(new documents_DocumentTypeConfiguration());
            modelBuilder.Configurations.Add(new documents_MailboxConfigurationConfiguration());

            OnModelCreatingPartial(modelBuilder);
        }

        partial void InitializePartial();
        partial void DisposePartial(bool disposing);
        partial void OnModelCreatingPartial(System.Data.Entity.DbModelBuilder modelBuilder);
    }
}
