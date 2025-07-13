/* =============================================
Name:			Sp_payment_ProcessSatgingTransaction
Description:	Processing Transaction from BankStatementEntryStaging to BankStatementEntry
Author:			Baldwin Khosa
Create Date:	2022-08-18
Change Date:	
Culprits:		
============================================= */
CREATE PROCEDURE [payment].[Sp_payment_ProcessStagingTransaction] 
	@claimCheckReference varchar(1000)
AS
BEGIN
	Declare @bankStatemententrystaging table([BankStatementEntryId] bigint,
		[IsActive] varchar(50),
		[IsDeleted] varchar(50),
		[CreatedBy] varchar(50),
		[CreatedDate] varchar(50),
		[ModifiedBy] varchar(50),
		[ModifiedDate] varchar(50),
		[CanEdit] varchar(50),
		[TransactionType] varchar(50),
		[DocumentType] varchar(50),
		[UserReference1] varchar(1000),
		[UserReference2] varchar(1000),
		[RequisitionNumber] varchar(50),
		[ChequeDepositNumber] varchar(50),
		[BankAccountNumber] varchar(50),
		[UniqueUserCode] varchar(50),
		[BankBranch] varchar(50),
		[SubType] varchar(50),
		[TransactionDate] varchar(50),
		[StatementDate] varchar(50),
		[EStatementNumber] varchar(50),
		[StatementNumber] varchar(50),
		[BankName] varchar(50),
		[RecordID] varchar(50),
		[HyphenDateProcessed] varchar(50),
		[BankAndStatementDate] varchar(50),
		[ReReceiveCode] varchar(50),
		[StatementTransactionCount] varchar(50),
		[NettAmount] varchar(50),
		[HyphenDateReceived] varchar(50),
		[Status] varchar(50),
		[StatementAndLineNumber] varchar(50),
		[BatchNumber] varchar(50),
		[DebitCredit] varchar(50),
		[StatementLineNumber] varchar(50),
		[ErrorCode] varchar(50),
		[Proccessed] varchar(50),
		[User] varchar(50),
		[Code1] varchar(50),
		[Code2] varchar(50),
		[UserReference] varchar(1000),
		[ClaimCheckReference] varchar(1000),
		[ErrorMessage] varchar(1000),
		[Imported] varchar(50))

              
        INSERT INTO @bankStatemententrystaging 
        SELECT  * 
		FROM [Load].[BankStatementEntryStaging] 
		WHERE 1=1 
        AND Imported = 0

		declare @missingClaimRefs table (reference varchar(1000))            
         
        INSERT INTO @missingClaimRefs 
        SELECT distinct claimcheckreference 
		FROM @bankStatemententrystaging
        WHERE claimcheckreference not in(SELECT claimcheckreference 
										FROM [Finance].[BankStatement])

        INSERT INTO finance.BankStatement (claimcheckreference,createdby,createddate,modifiedby,modifieddate) 
        SELECT reference,'BackendProcess',GETDATE(),'BackendProcess',GETDATE() FROM @missingClaimRefs
        WHERE reference not in(SELECT claimcheckreference from finance.BankStatement)
                     
        Declare @currentId bigint =(SELECT TOP 1 BankStatementEntryId FROM @bankStatemententrystaging)
                     
        WHILE (select count(BankStatementEntryId) from @bankStatemententrystaging) > 0
        BEGIN
			BEGIN TRY  
                BEGIN TRAN tnx_main
					INSERT INTO finance.BankStatementEntry([ClaimCheckReference],[RecordID],[StatementNumber],[EStatementNumber]
                    ,[StatementDate],[TransactionDate],[BankAccountNumber],[TransactionType],[SubType],[BankBranch],[ReReceiveCode]
					,[StatementTransactionCount],[NettAmount],[HyphenDateReceived],[HyphenDateProcessed],[Status],[UniqueUserCode]
                    ,[BatchNumber],[DebitCredit],[StatementLineNumber],[ErrorCode],[UserReference],[ChequeDepositNumber]
                    ,[RequisitionNumber],[DocumentType],[UserReference1],[UserReference2],[Code1],[Code2],[User],[StatementAndLineNumber], isActive,isDeleted,Proccessed,createdby,createddate,modifiedby,modifieddate)
                    SELECT cast( ClaimCheckReference as uniqueidentifier),cast([RecordID] as varchar(30)),cast([StatementNumber] as varchar(30)),cast([EStatementNumber] as varchar(30))
                    ,cast([StatementDate] as datetime),cast([TransactionDate] as datetime),cast([BankAccountNumber] as varchar(17)),[TransactionType],[SubType],[BankBranch],cast([ReReceiveCode] as varchar(30))
                    ,[StatementTransactionCount],[NettAmount],cast([HyphenDateReceived] as datetime),cast([HyphenDateProcessed] as datetime),[Status],cast([UniqueUserCode] as varchar(4))
                    ,[BatchNumber],cast([DebitCredit] as varchar(30)),[StatementLineNumber],cast([ErrorCode] as varchar(30)),[UserReference],cast([ChequeDepositNumber] as varchar(30))
                    ,cast([RequisitionNumber] as varchar(9)),cast([DocumentType] as varchar(2)),cast([UserReference1] as varchar(30)),cast([UserReference2] as varchar(30)),cast([Code1] as varchar(100)),cast([Code2] as varchar(100))
                    ,cast([User] as varchar(100)),cast([StatementAndLineNumber] as varchar(30)),1,0,0,'BackendProcess',GETDATE(),'BackendProcess',GETDATE() 
					FROM @bankStatemententrystaging 
					WHERE BankStatementEntryId = @currentId
					AND ClaimCheckReference = @claimCheckReference
                           
                    COMMIT TRAN tnx_main
                    UPDATE [Load].[bankStatemententrystaging] SET ErrorMessage = 'success', Imported = 1 
					WHERE BankStatementEntryId = @currentId AND ClaimCheckReference = @claimCheckReference
                    DELETE FROM @bankStatemententrystaging WHERE BankStatementEntryId = @currentId
                    SET @currentId  =(SELECT top 1 BankStatementEntryId from @bankStatemententrystaging)

                END TRY  
					BEGIN CATCH  
						ROLLBACK TRAN tnx_main
							DELETE FROM @bankStatemententrystaging where BankStatementEntryId = @currentId
                            SET @currentId  =(SELECT top 1 BankStatementEntryId from @bankStatemententrystaging)
                            UPDATE [Load].[bankStatemententrystaging] SET ErrorMessage = concat('error-',(SELECT ERROR_MESSAGE())), Imported = 1 where BankStatementEntryId = @currentId
                    END CATCH
                END
					DELETE from @bankStatemententrystaging
END