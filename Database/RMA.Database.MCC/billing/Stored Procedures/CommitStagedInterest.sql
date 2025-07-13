
-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2025-06-06
-- Description:	Pushes staged interest to the transactions table
-- =============================================
Create PROCEDURE [billing].[CommitStagedInterest] 
    @periodId AS int = NULL,
	@industryClassId AS int = NULL,
	@productCategoryId AS int = NULL
AS
BEGIN
	 BEGIN TRY	
		insert into  
		billing.transactions(
		InvoiceId,[RolePlayerId], TransactionTypeLinkId 
		,Amount,TransactionDate,[ModifiedBy]
		,[ModifiedDate],[CreatedBy],[CreatedDate] 
		,Reason,[IsBackDated],[TransactionEffectiveDate],
		[PeriodId],TransactionTypeId,[LinkedTransactionId])	  
		select InvoiceId,[RolePlayerId], 1 
		,isnull([AdjustedInterestAmount], [CalculatedInterestAmount]),[CreatedDate],[ModifiedBy]
		,[ModifiedDate],[CreatedBy],[CreatedDate] 
		 ,[FormulaApplied],[IsBackDated],[TransactionEffectiveDate],
		 [PeriodId],7,[LinkedTransactionId]
		 from billing.interest
		 where [InterestStatusId] =1 and [IsDeleted]=0 and periodid = @periodId
		 and @industryClassId=@industryClassId and ProductCategoryId=@productCategoryId

		 update billing.interest set [InterestStatusId] =2 
		 where [InterestStatusId] =1 and [IsDeleted]=0 and periodid = @periodId
		 and @industryClassId=@industryClassId and ProductCategoryId=@productCategoryId

  END TRY  
  BEGIN CATCH                           
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
 END CATCH  
END