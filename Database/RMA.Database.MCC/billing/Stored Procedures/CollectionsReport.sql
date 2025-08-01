CREATE  PROCEDURE [billing].[CollectionsReport]
		@CollectionTypeId as INT= 0,
		@CollectionStatusId as INT = 0,
		@StartDate As Date, 
		@EndDate As DATE

AS

Begin 
		DECLARE @ResultTable TABLE (
				[CollectionsID] INT,
				[Bank Reference]  VARCHAR(250), 
				[Batch Reference]  VARCHAR(250), 
				[Debit Order DATE] DATETIME,
				[Collection Type] VARCHAR(10),
				[Collection Status] VARCHAR(15),
				[Debtor Details]VARCHAR(50), 
				[Account Details] VARCHAR(50),
				[Bank Name] VARCHAR(50),
				[Bank Branch]  VARCHAR(50),
				[Amount] MONEY,
				[Submission Date] DATETIME,
				[Reconcilation Date] Datetime,
				[Error Code] VARCHAR(100),
				[Error Description]  VARCHAR(250),
				[Rejection Date]  DATETIME,
				[Reversal Date]  DATETIME
		);
	
Declare @CollectionTypesIDs TABLE (
CollectionTypeId INT
)

Declare @CollectionStatusIds Table (
	CollectionStatusId Int
)

If(@CollectionStatusId = 0)
	Begin
	insert Into @CollectionStatusIds
		Select DISTINCT Id From common.CollectionStatus
	End

IF(@CollectionTypeId = 0)
Begin
	insert Into @CollectionTypesIDs
		Select DISTINCT Id From common.CollectionType
End
ELSE 
BEGIN
	insert Into @CollectionTypesIDs values (@CollectionTypeId)
END

--pending or Queued
if(@CollectionStatusId = 0)
Begin
INSERT @ResultTable
Select  CollectionsId, 
			C.BankReference as 'Bank Reference',
			C.BatchReference as 'Batch Reference', 
			C.CreatedDate as 'Debit Order DATE', 
			CT.[Name] as 'Collection Type',
			CS.[Name] as 'Collection Status',
			RBD.AccountHolderName as 'Debtor Details',
			RBD.AccountNumber as 'Account Details',
			B.[Name] as 'Bank Name',
			BB.[Name] as 'Bank Branch',
			C.Amount as 'Amount',
			C.SubmissionDate as 'Submission Date',
			C.ReconciliationDate as 'Reconcilation Date',
			C.ErrorCode as 'Error Code',
			C.ErrorDescription as 'Error Description',
			C.RejectionDate as 'Rejection Date',
			C.ReversalDate as 'Reversal Date'
			from billing.Collections C
			full join billing.AdhocPaymentInstructions API on API.AdhocPaymentInstructionId = C.AdhocPaymentInstructionId
			inner join client.RolePlayerBankingDetails RBD on RBD.RolePlayerBankingId = C.RolePlayerBankingId 
			inner join common.CollectionType CT on CT.Id = C.CollectionTypeId
			inner join common.CollectionStatus CS on CS.Id = C.CollectionStatusId
			inner Join common.BankBranch BB on BB.Id = RBD.BankBranchId
			inner Join common.Bank B on B.Id = BB.BankId
			where CollectionStatusId in (Select * from @CollectionStatusIds) and collectiontypeId in (Select * from @CollectionTypesIDs) and C.CreatedDate >= @StartDate and C.CreatedDate <= @EndDate
			order by C.CreatedDate
END

IF(@CollectionStatusId = 1 or @CollectionStatusId = 7)
Begin 
INSERT @ResultTable
	Select  CollectionsId, 
			C.BankReference as 'Bank Reference',
			C.BatchReference as 'Batch Reference', 
			C.CreatedDate as 'Debit Order DATE', 
			CT.[Name] as 'Collection Type',
			CS.[Name] as 'Collection Status',
			RBD.AccountHolderName as 'Debtor Details',
			RBD.AccountNumber as 'Account Details',
			B.[Name] as 'Bank Name',
			BB.[Name] as 'Bank Branch',
			C.Amount as 'Amount',
			C.SubmissionDate as 'Submission Date',
			C.ReconciliationDate as 'Reconcilation Date',
			C.ErrorCode as 'Error Code',
			C.ErrorDescription as 'Error Description',
			C.RejectionDate as 'Rejection Date',
			C.ReversalDate as 'Reversal Date'
			from billing.Collections C
			full join billing.AdhocPaymentInstructions API on API.AdhocPaymentInstructionId = C.AdhocPaymentInstructionId
			inner join client.RolePlayerBankingDetails RBD on RBD.RolePlayerBankingId = C.RolePlayerBankingId 
			inner join common.CollectionType CT on CT.Id = C.CollectionTypeId
			inner join common.CollectionStatus CS on CS.Id = C.CollectionStatusId
			inner Join common.BankBranch BB on BB.Id = RBD.BankBranchId
			inner Join common.Bank B on B.Id = BB.BankId
			where CollectionStatusId = @CollectionStatusId and collectiontypeId in (Select * from @CollectionTypesIDs) and C.CreatedDate >= @StartDate and C.CreatedDate <= @EndDate
			order by C.CreatedDate
END
--Submitted 2
	If(@CollectionStatusId = 2)
	Begin 
	INSERT @ResultTable
	Select  CollectionsId, 
			C.BankReference as 'Bank Reference',
			C.BatchReference as 'Batch Reference', 
			C.CreatedDate as 'Debit Order DATE', 
			CT.[Name] as 'Collection Type',
			CS.[Name] as 'Collection Status',
			RBD.AccountHolderName as 'Debtor Details',
			RBD.AccountNumber as 'Account Details',
			B.[Name] as 'Bank Name',
			BB.[Name] as 'Bank Branch',
			C.Amount as 'Amount',
			C.SubmissionDate as 'Submission Date',
			C.ReconciliationDate as 'Reconcilation Date',
			C.ErrorCode as 'Error Code',
			C.ErrorDescription as 'Error Description',
			C.RejectionDate as 'Rejection Date',
			C.ReversalDate as 'Reversal Date'
			from billing.Collections C
			full join billing.AdhocPaymentInstructions API on API.AdhocPaymentInstructionId = C.AdhocPaymentInstructionId
			inner join client.RolePlayerBankingDetails RBD on RBD.RolePlayerBankingId = C.RolePlayerBankingId 
			inner join common.CollectionType CT on CT.Id = C.CollectionTypeId
			inner join common.CollectionStatus CS on CS.Id = C.CollectionStatusId
			inner Join common.BankBranch BB on BB.Id = RBD.BankBranchId
			inner Join common.Bank B on B.Id = BB.BankId
		 where C.CollectionStatusId = @CollectionStatusId and collectiontypeId in (Select * from @CollectionTypesIDs) and C.SubmissionDate >= @StartDate and C.SubmissionDate <= @EndDate
		order by C.CreatedDate
End
--Collected 3
IF(@CollectionStatusId = 3)
Begin
INSERT @ResultTable
Select CollectionsId, 
			C.BankReference as 'Bank Reference',
			C.BatchReference as 'Batch Reference', 
			C.CreatedDate as 'Debit Order DATE', 
			CT.[Name] as 'Collection Type',
			CS.[Name] as 'Collection Status',
			RBD.AccountHolderName as 'Debtor Details',
			RBD.AccountNumber as 'Account Details',
			B.[Name] as 'Bank Name',
			BB.[Name] as 'Bank Branch',
			C.Amount as 'Amount',
			C.SubmissionDate as 'Submission Date',
			C.ReconciliationDate as 'Reconcilation Date',
			C.ErrorCode as 'Error Code',
			C.ErrorDescription as 'Error Description',
			C.RejectionDate as 'Rejection Date',
			C.ReversalDate as 'Reversal Date'
			from billing.Collections C
			full join billing.AdhocPaymentInstructions API on API.AdhocPaymentInstructionId = C.AdhocPaymentInstructionId
			inner join client.RolePlayerBankingDetails RBD on RBD.RolePlayerBankingId = C.RolePlayerBankingId 
			inner join common.CollectionType CT on CT.Id = C.CollectionTypeId
			inner join common.CollectionStatus CS on CS.Id = C.CollectionStatusId
			inner Join common.BankBranch BB on BB.Id = RBD.BankBranchId
			inner Join common.Bank B on B.Id = BB.BankId
		 where C.CollectionStatusId = @CollectionStatusId and collectiontypeId in (Select * from @CollectionTypesIDs) and C.CollectionConfirmationDate >= @StartDate and C.CollectionConfirmationDate <= @EndDate
order by C.CreatedDate
END
--Rejected Date 4
If(@CollectionStatusId = 4)
Begin
INSERT @ResultTable
Select CollectionsId, 
			C.BankReference as 'Bank Reference',
			C.BatchReference as 'Batch Reference', 
			C.CreatedDate as 'Debit Order DATE', 
			CT.[Name] as 'Collection Type',
			CS.[Name] as 'Collection Status',
			RBD.AccountHolderName as 'Debtor Details',
			RBD.AccountNumber as 'Account Details',
			B.[Name] as 'Bank Name',
			BB.[Name] as 'Bank Branch',
			C.Amount as 'Amount',
			C.SubmissionDate as 'Submission Date',
			C.ReconciliationDate as 'Reconcilation Date',
			C.ErrorCode as 'Error Code',
			C.ErrorDescription as 'Error Description',
			C.RejectionDate as 'Rejection Date',
			C.ReversalDate as 'Reversal Date'
			from billing.Collections C
			full join billing.AdhocPaymentInstructions API on API.AdhocPaymentInstructionId = C.AdhocPaymentInstructionId
			inner join client.RolePlayerBankingDetails RBD on RBD.RolePlayerBankingId = C.RolePlayerBankingId 
			inner join common.CollectionType CT on CT.Id = C.CollectionTypeId
			inner join common.CollectionStatus CS on CS.Id = C.CollectionStatusId
			inner Join common.BankBranch BB on BB.Id = RBD.BankBranchId
			inner Join common.Bank B on B.Id = BB.BankId 
		 where C.CollectionStatusId = @CollectionStatusId and collectiontypeId in (Select * from @CollectionTypesIDs) and C.RejectionDate >= @StartDate and C.RejectionDate <= @EndDate
order by C.CreatedDate
END
--Reconciled and not reconciled 5 6
IF(@CollectionStatusId = 5 or @CollectionStatusId = 6)
Begin
INSERT @ResultTable
	Select CollectionsId, 
			C.BankReference as 'Bank Reference',
			C.BatchReference as 'Batch Reference', 
			C.CreatedDate as 'Debit Order DATE', 
			CT.[Name] as 'Collection Type',
			CS.[Name] as 'Collection Status',
			RBD.AccountHolderName as 'Debtor Details',
			RBD.AccountNumber as 'Account Details',
			B.[Name] as 'Bank Name',
			BB.[Name] as 'Bank Branch',
			C.Amount as 'Amount',
			C.SubmissionDate as 'Submission Date',
			C.ReconciliationDate as 'Reconcilation Date',
			C.ErrorCode as 'Error Code',
			C.ErrorDescription as 'Error Description',
			C.RejectionDate as 'Rejection Date',
			C.ReversalDate as 'Reversal Date'
			from billing.Collections C
			full join billing.AdhocPaymentInstructions API on API.AdhocPaymentInstructionId = C.AdhocPaymentInstructionId
			inner join client.RolePlayerBankingDetails RBD on RBD.RolePlayerBankingId = C.RolePlayerBankingId 
			inner join common.CollectionType CT on CT.Id = C.CollectionTypeId
			inner join common.CollectionStatus CS on CS.Id = C.CollectionStatusId
			inner Join common.BankBranch BB on BB.Id = RBD.BankBranchId
			inner Join common.Bank B on B.Id = BB.BankId
		 where C.CollectionStatusId = @CollectionStatusId and collectiontypeId in (Select * from @CollectionTypesIDs) and C.ReconciliationDate >= @StartDate and C.ReconciliationDate <= @EndDate
order by C.CreatedDate
End
--Reversed 8
If(@CollectionStatusId = 8)
Begin
INSERT @ResultTable
Select CollectionsId, 
			C.BankReference as 'Bank Reference',
			C.BatchReference as 'Batch Reference', 
			C.CreatedDate as 'Debit Order DATE', 
			CT.[Name] as 'Collection Type',
			CS.[Name] as 'Collection Status',
			RBD.AccountHolderName as 'Debtor Details',
			RBD.AccountNumber as 'Account Details',
			B.[Name] as 'Bank Name',
			BB.[Name] as 'Bank Branch',
			C.Amount as 'Amount',
			C.SubmissionDate as 'Submission Date',
			C.ReconciliationDate as 'Reconcilation Date',
			C.ErrorCode as 'Error Code',
			C.ErrorDescription as 'Error Description',
			C.RejectionDate as 'Rejection Date',
			C.ReversalDate as 'Reversal Date'
			from billing.Collections C
			full join billing.AdhocPaymentInstructions API on API.AdhocPaymentInstructionId = C.AdhocPaymentInstructionId
			inner join client.RolePlayerBankingDetails RBD on RBD.RolePlayerBankingId = C.RolePlayerBankingId 
			inner join common.CollectionType CT on CT.Id = C.CollectionTypeId
			inner join common.CollectionStatus CS on CS.Id = C.CollectionStatusId
			inner Join common.BankBranch BB on BB.Id = RBD.BankBranchId
			inner Join common.Bank B on B.Id = BB.BankId
		 where C.CollectionStatusId = @CollectionStatusId and collectiontypeId in (Select * from @CollectionTypesIDs) and C.ReversalDate >= @StartDate and C.ReversalDate <= @EndDate
order by C.CreatedDate
END 

Select [CollectionsID],
	   [Bank Reference], 
	   [Batch Reference], 
	   [Debit Order DATE],
	   [Collection Type],
	   [Collection Status],
	   [Debtor Details], 
	   [Account Details],
	   [Bank Name],
	   [Bank Branch],
	   [Amount],
	   [Submission Date],
	   [Reconcilation Date],
	   [Error Code],
	   [Error Description],
	   [Rejection Date],
	   [Reversal Date]
	From @ResultTable
END
