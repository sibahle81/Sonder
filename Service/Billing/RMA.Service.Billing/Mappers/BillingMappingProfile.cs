using AutoMapper;

using CommonServiceLocator;

using RMA.Common.Database.Contracts.ContextScope;
using RMA.Common.Database.Contracts.Repository;
using RMA.Common.Database.Extensions;
using RMA.Common.Entities;
using RMA.Common.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.Billing.Contracts.Entities;
using RMA.Service.Billing.Contracts.Entities.Payments;
using RMA.Service.Billing.Database.Entities;
using RMA.Service.ClientCare.Contracts.Entities.Policy;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace RMA.Service.Billing.Mappers
{
    public class BillingMappingProfile : Profile
    {
        /// <summary>
        /// Create the mappers that map the database types to the contract types
        /// </summary>
        public BillingMappingProfile()
        {
            CreateMap<UnallocatedPayment, billing_UnallocatedPayment>()
                .ForMember(s => s.AllocationProgressStatus, opt => opt.Ignore())
                .ForMember(s => s.UnallocatedPaymentId, opt => opt.Ignore())
                .ForMember(s => s.BankStatementEntry, opt => opt.Ignore())
                .ForMember(s => s.BankStatementEntryId, opt => opt.Ignore())
                .ForMember(s => s.IsDeleted, opt => opt.Ignore())
                .ForMember(s => s.AbilityTransactionsAudits, opt => opt.Ignore())
                .ForMember(s => s.Period, opt => opt.Ignore())
                .ForMember(s => s.PeriodId, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<billing_Invoice, Invoice>()
                .ForMember(s => s.Balance, opt => opt.MapFrom(i => CalculateInvoiceBalance(i.InvoiceId, i.TotalInvoiceAmount)))
                .ReverseMap()
                .ForMember(s => s.Collections, opt => opt.Ignore())
                .ForMember(s => s.InvoiceAllocations, opt => opt.Ignore())
                .ForMember(s => s.Invoices, opt => opt.Ignore())
                .ForMember(s => s.LinkedInvoice, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_Invoice>(s.InvoiceId));

            CreateMap<billing_InvoiceLineItem, InvoiceLineItem>()
                .ForMember(s => s.Invoice, opt => opt.Ignore())
                .ForMember(s => s.BenefitRateId, opt => opt.MapFrom(x => x.BenefitRateId))
                .ForMember(s => s.BenefitPayrollId, opt => opt.MapFrom(x => x.BenefitPayrollId))
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_InvoiceLineItem>(s.InvoiceLineItemsId));

            CreateMap<billing_DebtorStatusRule, DebtorStatusRule>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<billing_DebtorStatusRule>(s.Id));

            CreateMap<billing_Collection, Collection>()
                .ForMember(s => s.AccountNo, opt => opt.Ignore())
                .ForMember(s => s.Bank, opt => opt.Ignore())
                .ForMember(s => s.BankBranch, opt => opt.Ignore())
                .ForMember(s => s.Debtor, opt => opt.Ignore())
                .ForMember(s => s.CollectionBatch, opt => opt.Ignore())
                .ForMember(s => s.DebitOrderDate, opt => opt.MapFrom(c => GetDebitOrderDate(c.InvoiceId, c.AdhocPaymentInstructionId)))
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_Collection>(s.CollectionsId));

            CreateMap<billing_Transaction, Transaction>()
                .ForMember(s => s.FinPayees, opt => opt.Ignore())
                .ForMember(s => s.Invoice, opt => opt.Ignore())
                .ForMember(s => s.UnallocatedAmount, opt => opt.Ignore())
                .ForMember(s => s.OriginalUnallocatedAmount, opt => opt.Ignore())
                .ForMember(s => s.TransferAmount, opt => opt.Ignore())
                .ForMember(s => s.ReallocatedAmount, opt => opt.Ignore())
                .ForMember(s => s.LinkedTransactions, opt => opt.Ignore())
                .ForMember(t => t.DebitTransactionAllocations, opt => opt.MapFrom(s => s.DebitTransactionAllocations_DebitTransactionId))
                .ForMember(t => t.CreditTransctionAllocationsToDebitTransactions, opt => opt.MapFrom(s => s.DebitTransactionAllocations_CreditTransactionId))
                .ForMember(s => s.DebitAmount, opt => opt.Ignore())
                .ForMember(s => s.CreditAmount, opt => opt.Ignore())
                .ForMember(s => s.PolicyId, opt => opt.Ignore())
                .ForMember(s => s.DocumentNumber, opt => opt.Ignore())
                .ForMember(s => s.RunningBalance, opt => opt.Ignore())
                .ForMember(s => s.Reference, opt => opt.Ignore())
                .ForMember(s => s.Description, opt => opt.Ignore())
                .ForMember(s => s.RefundAmount, opt => opt.Ignore())
                .ForMember(s => s.InvoiceAllocations, opt => opt.Ignore())
                .ForMember(s => s.RmaBankAccount, opt => opt.Ignore())
                .ForMember(s => s.RmaBankAccountId, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.Transactions, opt => opt.Ignore())
                .ForMember(s => s.LinkedTransaction, opt => opt.Ignore())
                .ForMember(s => s.Invoice, opt => opt.Ignore())
                .ForMember(t => t.DebitTransactionAllocations_DebitTransactionId, opt => opt.MapFrom(s => s.DebitTransactionAllocations))
                .ForMember(t => t.DebitTransactionAllocations_CreditTransactionId, opt => opt.MapFrom(s => s.CreditTransctionAllocationsToDebitTransactions))
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_Transaction>(s.TransactionId));

            CreateMap<billing_TransactionTypeLink, TransactionTypeLink>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_TransactionTypeLink>(s.Id));

            CreateMap<billing_PremiumListingTransaction, PremiumListingTransaction>()
              .ForMember(s => s.IsActive, opt => opt.Ignore())
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntity<billing_PremiumListingTransaction>(s.Id));

            CreateMap<payment_FacsTransactionResult, FacsTransactionResult>()
                .ReverseMap()
                .ForMember(s => s.PaymentId, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<payment_FacsTransactionResult>(s.Id));

            CreateMap<billing_CollectionBatch, CollectionBatch>()
                .ForMember(s => s.Collections, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_CollectionBatch>(s.CollectionBatchId));

            CreateMap<billing_AgeAnalysisNote, AgeAnalysisNote>()
                .ReverseMap()
                .ForMember(s => s.RolePlayer, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_AgeAnalysisNote>(s.Id));

            CreateMap<billing_RmaBankAccount, RmaBankAccount>()
                .ForMember(s => s.SearchFilter, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_RmaBankAccount>(s.RmaBankAccountId));

            CreateMap<billing_InterBankTransfer, InterBankTransfer>()
                .ForMember(s => s.ToAccountNumber, opt => opt.Ignore())
                .ForMember(s => s.FromAccountNumber, opt => opt.Ignore())
                .ForMember(s => s.IsInitiatedByClaimPayment, opt => opt.Ignore())
                .ForMember(s => s.RequestCode, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_InterBankTransfer>(s.InterBankTransferId));


            CreateMap<billing_InterDebtorTransfer, InterDebtorTransfer>()
                .ForMember(s => s.Transactions, opt => opt.Ignore())
                .ForMember(s => s.FromAccountNumber, opt => opt.Ignore())
                .ForMember(s => s.ReceiverRolePlayerId, opt => opt.Ignore())
                .ForMember(s => s.ReceiverHasInvoicesOutstanding, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.InterBankTransfers, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_InterDebtorTransfer>(s.InterDebtorTransferId));

            CreateMap<billing_InvoiceAllocation, InvoiceAllocation>()
                .ForMember(s => s.DocumentNumber, opt => opt.MapFrom(d => GetDocumentNumber(d.InvoiceId, d.TransactionId)))
                .ReverseMap()
                .ForMember(s => s.Invoice, opt => opt.Ignore())
                .ForMember(s => s.Transaction, opt => opt.Ignore())
                .ForMember(s => s.LinkedTransactionId, opt => opt.Ignore())
                .ForMember(s => s.BillingAllocationType, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_InvoiceAllocation>(s.InvoiceAllocationId));

            CreateMap<billing_ClaimRecoveryInvoice, ClaimRecoveryInvoice>()
                .ForMember(s => s.Balance, opt => opt.MapFrom(i => CalculateClaimRecoveryInvoiceBalance(i.ClaimRecoveryInvoiceId, i.Amount)))
                .ReverseMap()
                .ForMember(s => s.ClaimRecoveryInvoiceId, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_ClaimRecoveryInvoice>(s.ClaimRecoveryInvoiceId));

            CreateMap<billing_InterDebtorTransferNote, Note>()
                .ForMember(t => t.ItemType, opt => opt.Ignore())
                .ForMember(t => t.Reason, opt => opt.Ignore())
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.InterDebtorTransferId))
                .ReverseMap()
                .ForMember(t => t.InterDebtorTransferId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_InterDebtorTransferNote>(s.Id));

            CreateMap<billing_Note, BillingNote>()
                .ForMember(t => t.Context, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_Note>(s.Id));

            CreateMap<Note, BillingNote>()
                .ForMember(t => t.Context, opt => opt.Ignore())
                .ForMember(t => t.IsActive, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(t => t.Reason, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<Note>(s.Id));

            CreateMap<billing_InterBankTransferNote, Note>()
                .ForMember(t => t.ItemType, opt => opt.Ignore())
                .ForMember(t => t.Reason, opt => opt.Ignore())
                .ForMember(t => t.ItemId, opt => opt.MapFrom(s => s.InterBankTransferId))
                .ReverseMap()
                .ForMember(t => t.InterBankTransferId, opt => opt.MapFrom(s => s.ItemId))
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_InterBankTransferNote>(s.Id));

            CreateMap<billing_AdhocPaymentInstruction, AdhocPaymentInstruction>()
                .ForMember(s => s.FinPayeNumber, opt => opt.Ignore())
                .ForMember(s => s.BankAccountNumber, opt => opt.Ignore())
                .ForMember(s => s.BankAccountEffectiveDate, opt => opt.Ignore())
                .ForMember(s => s.Bank, opt => opt.Ignore())
                .ForMember(s => s.BankAccountHolder, opt => opt.Ignore())
                .ForMember(s => s.BankBranchCode, opt => opt.Ignore())
                .ForMember(s => s.BankAccountType, opt => opt.Ignore())
                .ForMember(s => s.IsInitiatedByDebitOrderGenerationProcess, opt => opt.Ignore())
                .ForMember(s => s.PolicyId, opt => opt.Ignore())
                .ForMember(s => s.PolicyNumber, opt => opt.Ignore())
                .ForMember(s => s.TargetedTermArrangementScheduleIds, opt => opt.Ignore())
                .ForMember(s => s.TempDocumentKeyValue, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.Collections, opt => opt.Ignore())
                .ForMember(s => s.RolePlayerBankingDetail, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_AdhocPaymentInstruction>(s.AdhocPaymentInstructionId));

            CreateMap<billing_RefundHeader, RefundHeader>()
            .ReverseMap()
            .ForMember(s => s.Payments, opt => opt.Ignore())
            .ForMember(s => s.RolePlayer, opt => opt.Ignore())
            .ConstructUsing(s => MapperExtensions.GetEntity<billing_RefundHeader>(s.RefundHeaderId));

            CreateMap<billing_RefundHeaderDetail, RefundHeaderDetail>()
                .ReverseMap()
                .ForMember(s => s.Transaction, opt => opt.Ignore())
                .ForMember(s => s.RefundHeader, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_RefundHeaderDetail>(s.RefundHeaderDetailId));

            CreateMap<billing_InterDebtorTransferDetail, InterDebtorTransferDetail>()
                .ReverseMap()
                .ForMember(s => s.InterDebtorTransfer, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_InterDebtorTransferDetail>(s.InterDebtorTransferDetailId));

            CreateMap<billing_DebitTransactionAllocation, DebitTransactionAllocation>()
                .ReverseMap()
                .ForMember(s => s.DebitTransaction, opt => opt.Ignore())
                .ForMember(s => s.CreditTransaction, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_DebitTransactionAllocation>(s.DebitTransactionAllocationId));

            CreateMap<billing_TermArrangement, TermArrangement>()
                .ForMember(s => s.MemberName, opt => opt.Ignore())
                .ForMember(s => s.MemberNumber, opt => opt.Ignore())
                .ForMember(s => s.InvoiceNumber, opt => opt.Ignore())
                .ForMember(s => s.InvoiceBalance, opt => opt.Ignore())
                .ForMember(s => s.InstallmentDay, opt => opt.Ignore())
                .ForMember(s => s.PolicyNumber, opt => opt.Ignore())
                .ForMember(s => s.PolicyId, opt => opt.Ignore())
                .ForMember(s => s.SendAgreementToClient, opt => opt.Ignore())
                .ForMember(s => s.RolePlayerBankingId, opt => opt.Ignore())
                .ForMember(s => s.TermApplicationDeclineReason, opt => opt.Ignore())
                .ForMember(s => s.NoAutoApprovalReasons, opt => opt.Ignore())
                .ForMember(s => s.TermArrangementSubsidiaries, opt => opt.Ignore())
                .ForMember(s => s.TermFlexibleSchedules, opt => opt.Ignore())
                .ForMember(s => s.BankAccountId, opt => opt.Ignore())
                .ForMember(s => s.NumberOfPayments, opt => opt.Ignore())
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_TermArrangement>(s.TermArrangementId));

            CreateMap<billing_TermArrangementSchedule, TermArrangementSchedule>()
                .ForMember(s => s.MemberName, opt => opt.Ignore())
                .ForMember(s => s.MemberNumber, opt => opt.Ignore())
                .ForMember(s => s.PolicyNumber, opt => opt.Ignore())
                .ForMember(s => s.NotificationMessage, opt => opt.Ignore())
                .ForMember(s => s.MissedPaymentProcessed, opt => opt.Ignore())
                .ReverseMap()
                .ForMember(s => s.Collections, opt => opt.Ignore())
                .ForMember(s => s.TermArrangement, opt => opt.Ignore())
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_TermArrangementSchedule>(s.TermArrangementScheduleId));

            CreateMap<billing_AdhocPaymentInstructionsTermArrangementSchedule, AdhocPaymentInstructionsTermArrangementSchedule>()
                 .ReverseMap()
                 .ConstructUsing(s => MapperExtensions.GetEntity<billing_AdhocPaymentInstructionsTermArrangementSchedule>(s.AdhocPaymentInstructionsTermArrangementScheduleId));

            CreateMap<billing_TermsArrangementNote, TermsArrangementNote>()
                .ReverseMap()
                .ConstructUsing(s => MapperExtensions.GetEntity<billing_TermsArrangementNote>(s.Id));

            CreateMap<billing_TermArrangementProductOption, TermArrangementProductOption>()
               .ForMember(s => s.ProductOptionName, opt => opt.Ignore())
               .ForMember(s => s.FinPayenumber, opt => opt.Ignore())
               .ForMember(s => s.RoleplayerId, opt => opt.Ignore())
               .ReverseMap()
               .ForMember(s => s.TermArrangement, opt => opt.Ignore())
               .ConstructUsing(s => MapperExtensions.GetEntity<billing_TermArrangementProductOption>(s.TermArrangementProductOptionId));


            CreateMap<Load_BulkAllocationFile, BulkAllocationFile>()
           .ForMember(s => s.BulkAllocationFileId, opt => opt.MapFrom(d => d.BulkAllocationFileId))
               .ForMember(s => s.CreatedDate, opt => opt.MapFrom(d => d.CreatedDate))
               .ForMember(s => s.CreatedBy, opt => opt.MapFrom(d => d.CreatedBy))
               .ForMember(s => s.FileIdentifier, opt => opt.MapFrom(d => d.FileIdentifier))
               .ForMember(s => s.IsDeleted, opt => opt.MapFrom(d => d.IsDeleted))
               .ForMember(s => s.TotalExceptions, opt => opt.Ignore())
               .ForMember(s => s.TotalLines, opt => opt.Ignore())
               .ForMember(s => s.ModifiedBy, opt => opt.MapFrom(d => d.ModifiedBy))
               .ForMember(s => s.ModifiedDate, opt => opt.MapFrom(d => d.ModifiedDate))
               .ForMember(s => s.FileProcessingStatusId, opt => opt.Ignore())
               .ForMember(s => s.FileProcessingStatus, opt => opt.Ignore())
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<Load_BulkAllocationFile>(s.BulkAllocationFileId));

            CreateMap<Load_BulkManualAllocation, BulkManualAllocation>()
          .ForMember(s => s.BulkAllocationFileId, opt => opt.MapFrom(d => d.BulkAllocationFileId))
              .ForMember(s => s.LineProcessingStatusId, opt => opt.MapFrom(d => d.LineProcessingStatusId))
              .ForMember(s => s.Allocatable, opt => opt.MapFrom(d => d.Allocatable))
              .ForMember(s => s.AllocateTo, opt => opt.MapFrom(d => d.AllocateTo))
              .ForMember(s => s.BankAccountNumber, opt => opt.MapFrom(d => d.BankAccountNumber))
              .ForMember(s => s.ReferenceType, opt => opt.MapFrom(d => d.ReferenceType))
              .ForMember(s => s.StatementReference, opt => opt.MapFrom(d => d.StatementReference))
              .ForMember(s => s.UserReference, opt => opt.MapFrom(d => d.UserReference))
              .ForMember(s => s.UserReference2, opt => opt.MapFrom(d => d.UserReference2))
              .ForMember(s => s.Status, opt => opt.Ignore())
              .ForMember(s => s.IsDeleted, opt => opt.MapFrom(d => d.IsDeleted))
              .ForMember(s => s.TransactionDate, opt => opt.MapFrom(d => d.TransactionDate))
              .ForMember(s => s.LineProcessingStatus, opt => opt.MapFrom(d => MapFileLineItemProcessingStatus(d.LineProcessingStatusId)))
              .ForMember(s => s.PeriodId, opt => opt.MapFrom(d => d.PeriodId))
              .ReverseMap()
              .ConstructUsing(s => MapperExtensions.GetEntity<Load_BulkManualAllocation>(s.Id));

            CreateMap<billing_TermDebitOrderRolePlayerBankingDetail, TermsDebitOrderDetail>()
            .ReverseMap()
            .ForMember(s => s.TermArrangement, opt => opt.Ignore())
            .ForMember(s => s.RolePlayerBankingDetail, opt => opt.Ignore())
            .ConstructUsing(s => MapperExtensions.GetEntity<billing_TermDebitOrderRolePlayerBankingDetail>(s.TermDebitOrderRolePlayerBankingDetailId));

            CreateMap<billing_QLinkPaymentRecord, PaymentRecord>()
                .ForMember(s => s.Commission, opt => opt.Ignore())
                .ForMember(s => s.Premium, opt => opt.Ignore())
                .ForMember(s => s.ClaimCheckReference, opt => opt.Ignore())
                .ForMember(s => s.HyphenDateReceived, opt => opt.Ignore())
                .ForMember(s => s.HyphenDateProcessed, opt => opt.Ignore())
                .ForMember(s => s.StatementDate, opt => opt.Ignore())
          .ReverseMap();

            CreateMap<Load_QLinkPaymentRecordStaging, PaymentRecord>()
         .ReverseMap();

            CreateMap<billing_AbilityCollection, AbilityCollections>()
                .ForMember(s => s.BankAccountNumber, opt => opt.Ignore())
            .ReverseMap();

            CreateMap<billing_AbilityTransactionsAudit, AbilityTransactionsAudit>()
            .ForMember(s => s.AbilityCollectionChartPrefix, opt => opt.Ignore())
           .ReverseMap();

            CreateMap<billing_AutoAllocationBankAccount, AutoAllocationAccount>()
           .ForMember(s => s.IsConfigured, opt => opt.Ignore())
           .ForMember(s => s.Description, opt => opt.Ignore())
           .ForMember(s => s.BankAccountNumber, opt => opt.Ignore())
           .ReverseMap();

            //Automapper has know security vulnerabilities in later version containing obfuscated dll's that scan the git repository
            CreateMap<billing_InterestIndicator, InterestIndicator>()
               .ForMember(s => s.Id, opt => opt.MapFrom(src => src.Id))
               .ForMember(s => s.InterestDateFrom, opt => opt.MapFrom(src => src.StartDate))
               .ForMember(s => s.InterestDateTo, opt => opt.MapFrom(src => src.EndDate))
               .ForMember(s => s.isActive, opt => opt.MapFrom(src => src.IsActive))
               .ForMember(s => s.ChargeInterest, opt => opt.MapFrom(src => src.ChargeInterest))
               .ForMember(s => s.RolePlayerId, opt => opt.MapFrom(src => src.RolePlayerId))
               .ReverseMap();

            CreateMap<billing_RefundRoleLimit, RefundRoleLimit>()
                .ReverseMap();

            CreateMap<billing_InterBankTransferDetail, InterBankTransferDetail>()
                .ReverseMap();

            CreateMap<Load_PremiumListing, PremiumListingModel>()
                .ForMember(s => s.CoverAmount, opt => opt.Ignore());

            CreateMap<billing_AllocationLookup, PaymentAllocationLookup>()
                .ForMember(x => x.RolePlayerId, opt => opt.Ignore())
                .ForMember(x => x.DebtorName, opt => opt.Ignore())
                .ForMember(x => x.BankStatementEntryId, opt => opt.Ignore())
                .ReverseMap();

            CreateMap<Load_PaymentStagingFile, PaymentStagingRecordFile>()
                .ReverseMap();

            CreateMap<Load_PaymentStaging, PaymentStagingRecord>()
                .ReverseMap();

            CreateMap<billing_Interest, Interest>()
               .ReverseMap()
               .ConstructUsing(s => MapperExtensions.GetEntity<billing_Interest>(s.InterestId));

            CreateMap<Load_PremiumWriteOffContent, BulkWriteOffModel>()
               .ForMember(x => x.AgeBalance, opt => opt.Ignore())
               .ForMember(s => s.InterestReversalAmount, opt => opt.MapFrom(x => x.InterestAmount))
               .ForMember(s => s.PremiumWriteOffAmount, opt => opt.MapFrom(x => x.PremiumAmount))
               .ForMember(s => s.InterestReversalReference, opt => opt.MapFrom(x => x.InterestReversalReference))
               .ForMember(s => s.PremiumWriteOffReference, opt => opt.MapFrom(x => x.PremiumReference))
               .ReverseMap()
               .ForMember(x => x.FileId, opt => opt.Ignore())
               .ForMember(x => x.FileIdentifier, opt => opt.Ignore());

            CreateMap<billing_LegalCommissionRecon, LegalCommissionRecon>()
              .ForMember(x => x.CollectionTypeId, opt => opt.Ignore())
              .ReverseMap();

            CreateMap<Load_LegalHandOverFileDetail, LegalHandOverFileDetail>()
            .ForMember(x => x.DebtorStatus, opt => opt.Ignore())
            .ReverseMap();
        }

        private readonly SemaphoreSlim _locker = new SemaphoreSlim(1, 1);

        private decimal CalculateInvoiceBalance(int invoiceId, decimal totalInvoiceAmount)
        {
            _locker.Wait();

            try
            {
                var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                var invoiceAllocationRepository =
                    ServiceLocator.Current.GetInstance<IRepository<billing_InvoiceAllocation>>();
                var transactionRepository = ServiceLocator.Current.GetInstance<IRepository<billing_Transaction>>();
                List<billing_InvoiceAllocation> invoiceAllocations;
                using (factory.CreateReadOnly())
                {
                    var invoiceTransaction = transactionRepository.FirstOrDefault(t => t.InvoiceId == invoiceId && t.TransactionType == TransactionTypeEnum.Invoice);

                    if (invoiceTransaction == null)
                    {
                        return totalInvoiceAmount;
                    }

                    var reversalTransaction = transactionRepository.FirstOrDefault(t => t.LinkedTransactionId == invoiceTransaction.TransactionId);
                    if (reversalTransaction != null &&
                        (reversalTransaction.TransactionType == TransactionTypeEnum.InvoiceReversal))
                    {
                        return 0;
                    }

                    invoiceAllocations = invoiceAllocationRepository.Where(ia => ia.InvoiceId == invoiceId && !ia.IsDeleted).ToList();
                    foreach (var allocation in invoiceAllocations)
                    {
                        var debitTransactions = transactionRepository.Where(t => t.LinkedTransactionId == allocation.TransactionId).ToList();
                        foreach (var debitTran in debitTransactions)
                        {
                            if (debitTran.TransactionType != TransactionTypeEnum.DebitReallocation && debitTran.TransactionType != TransactionTypeEnum.Refund && debitTran.TransactionType != TransactionTypeEnum.InterDebtorTransfer)
                            {
                                var creditTransaction = transactionRepository.Single(t => t.TransactionId == allocation.TransactionId);
                                if (creditTransaction.Amount == debitTran.Amount)
                                {
                                    allocation.Amount -= debitTran.Amount;
                                }
                            }
                        }
                    }
                }

                var balance = totalInvoiceAmount - invoiceAllocations.Sum(i => i.Amount);

                if (balance < 0)
                    balance = 0;

                if (balance > totalInvoiceAmount)
                {
                    balance = totalInvoiceAmount;
                }

                return balance;
            }
            finally
            {
                _locker.Release();
            }
        }

        private decimal CalculateClaimRecoveryInvoiceBalance(int invoiceId, decimal totalInvoiceAmount)
        {
            _locker.Wait();

            try
            {
                var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                var invoiceAllocationRepository =
                    ServiceLocator.Current.GetInstance<IRepository<billing_InvoiceAllocation>>();
                var transactionRepository = ServiceLocator.Current.GetInstance<IRepository<billing_Transaction>>();
                List<billing_InvoiceAllocation> invoiceAllocations;
                using (factory.CreateReadOnly())
                {
                    invoiceAllocations = invoiceAllocationRepository.Where(ia => ia.ClaimRecoveryId == invoiceId).ToList();
                    foreach (var allocation in invoiceAllocations)
                    {
                        var reversalTransaction =
                            transactionRepository.FirstOrDefault(t =>
                                t.LinkedTransactionId == allocation.TransactionId);
                        if (reversalTransaction != null &&
                            (reversalTransaction.TransactionType == TransactionTypeEnum.ClaimRecoveryPaymentReversal))
                        {
                            allocation.Amount = 0;
                        }
                    }
                }

                var balance = totalInvoiceAmount - invoiceAllocations.Sum(i => i.Amount);
                if (balance < 0)
                    balance = 0;

                return balance;
            }
            finally
            {
                _locker.Release();
            }
        }

        private DateTime? GetDebitOrderDate(int? invoiceId, int? adhocPaymentInstructionId)
        {
            _locker.Wait();
            try
            {
                var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();

                DateTime? debitOrderDate = null;

                if (invoiceId.HasValue)
                {
                    var invoiceRepository =
                        ServiceLocator.Current.GetInstance<IRepository<billing_Invoice>>();
                    using (factory.CreateReadOnly())
                    {
                        var invoice = invoiceRepository.Single(i => i.InvoiceId == invoiceId);
                        debitOrderDate = invoice.CollectionDate;
                    }
                }
                else if (adhocPaymentInstructionId.HasValue)
                {
                    var adhocRepository =
                        ServiceLocator.Current.GetInstance<IRepository<billing_AdhocPaymentInstruction>>();
                    using (factory.CreateReadOnly())
                    {
                        var adhocPaymentInstruction = adhocRepository.Single(i => i.AdhocPaymentInstructionId == adhocPaymentInstructionId);
                        debitOrderDate = adhocPaymentInstruction.DateToPay;
                    }
                }

                return debitOrderDate;
            }
            finally
            {
                _locker.Release();
            }
        }

        private decimal CalculateFileRecordTotal(int fileId)
        {
            _locker.Wait();

            try
            {
                var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                var bulkAllocationRepository =
                    ServiceLocator.Current.GetInstance<IRepository<Load_BulkManualAllocation>>();

                var total = 0;
                using (factory.CreateReadOnly())
                {
                    total = bulkAllocationRepository
                       .Where(c => c.BulkAllocationFileId == fileId)
                       .ToList().Count;
                }

                return total;
            }
            finally
            {
                _locker.Release();
            }
        }

        private string MapFileLineItemProcessingStatus(int? processingStatusId)
        {
            var status = FileLineItemProcessingStatusEnum.Pending.DisplayAttributeValue();

            if (processingStatusId.HasValue)
            {
                var enumValue = (FileLineItemProcessingStatusEnum)Enum.Parse(typeof(UploadedFileProcessingStatusEnum), processingStatusId.Value.ToString());
                status = enumValue.DisplayAttributeValue();
            }
            return status;

        }

        private string MapFileProcessingStatus(int? processingStatusId)
        {
            var status = UploadedFileProcessingStatusEnum.Pending.DisplayAttributeValue();

            if (processingStatusId.HasValue)
            {
                var enumValue = (UploadedFileProcessingStatusEnum)Enum.Parse(typeof(UploadedFileProcessingStatusEnum), processingStatusId.Value.ToString());
                status = enumValue.DisplayAttributeValue();
            }
            return status;
        }

        private string GetTransactionReference(int transactionId)
        {
            _locker.Wait();

            try
            {
                var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                var transactionRepository =
                    ServiceLocator.Current.GetInstance<IRepository<billing_Transaction>>();

                string transactionRef = string.Empty;
                using (factory.CreateReadOnly())
                {
                    transactionRef = transactionRepository
                       .FirstOrDefault(c => c.TransactionId == transactionId)?.RmaReference;
                }

                return transactionRef;
            }
            finally
            {
                _locker.Release();
            }
        }

        private string GetDocumentNumber(int? invoiceId, int transactionId)
        {
            if (invoiceId.HasValue)
            {
                return GetInvoiceNumber(invoiceId.Value);
            }
            return GetTransactionReference(transactionId);
        }
        private string GetInvoiceNumber(int invoiceId)
        {
            _locker.Wait();

            try
            {
                var factory = ServiceLocator.Current.GetInstance<IDbContextScopeFactory>();
                var invoieRepository =
                    ServiceLocator.Current.GetInstance<IRepository<billing_Invoice>>();

                string invoiceNumber = string.Empty;
                using (factory.CreateReadOnly())
                {
                    invoiceNumber = invoieRepository
                       .FirstOrDefault(c => c.InvoiceId == invoiceId)?.InvoiceNumber;
                }

                return invoiceNumber;
            }
            finally
            {
                _locker.Release();
            }
        }
    }
}
