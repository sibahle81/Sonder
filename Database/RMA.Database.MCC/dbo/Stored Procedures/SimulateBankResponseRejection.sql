CREATE PROCEDURE [dbo].[SimulateBankResponseRejection] 
	-- Add the parameters for the stored procedure here
	@PaymentRefernces as Varchar(125), -- Pass only one reference or mutliple reference separated by comma and no spacing in between them
	@ErrorCode as Varchar(30)
AS
	BEGIN
	
			--Declare @PaymentRefernces Varchar(125)
			--set @PaymentRefernces = 'CLA711,CLA712,CLA713,CLA714'; --Example of running bulk update 

			while len(@PaymentRefernces) > 0
			begin
	
				Declare @PaymentId Int
				Declare @PaymentReference Varchar(20) = left(@PaymentRefernces, charindex(',', @PaymentRefernces+',')-1)
				Select @PaymentId = PaymentId from Payment.Payment where Reference = @PaymentReference and PaymentStatusId = 2

				If @PaymentId is null
					Begin
						 set @PaymentRefernces = stuff(@PaymentRefernces, 1, charindex(',', @PaymentRefernces+','), '')
						 continue
					end

				If Not Exists (select * from payment.FacsTransactionResults where PaymentId = @PaymentId)
					Begin
						 set @PaymentRefernces = stuff(@PaymentRefernces, 1, charindex(',', @PaymentRefernces+','), '')
						 continue
					end
				
				Declare @TransactionType Varchar(5)
				Declare @DocumentType Varchar(5)
				Declare @Reference1 Varchar(2)
				Declare @Reference2 Varchar(30)
				Declare @Amount Varchar(11)
				Declare @RequisitionNumber Varchar(9)
				Declare @BankAccountNumber Varchar(17)

				select @TransactionType = TransactionType, 
						@DocumentType = DocumentType,
						@Reference1 = Reference1, 
						@Reference2 = Reference2, 
						@Amount = Amount,
						@RequisitionNumber = [RequisitionNumber ], 
						@BankAccountNumber = BankAccountNumber 
				from payment.FacsTransactionResults where PaymentId = @PaymentId

				BEGIN TRY
					BEGIN TRAN
						INSERT INTO [finance].[BankStatementEntry]
								   ([IsActive]
								   ,[IsDeleted]
								   ,[CreatedBy]
								   ,[CreatedDate]
								   ,[ModifiedBy]
								   ,[ModifiedDate]
								   ,[CanEdit]
								   ,[TransactionType]
								   ,[DocumentType]
								   ,[UserReference1]
								   ,[UserReference2]
								   ,[RequisitionNumber ]
								   ,[ChequeDepositNumber]
								   ,[BankAccountNumber]
								   ,[UniqueUserCode]
								   ,[BankBranch]
								   ,[TransactionDate]
								   ,[StatementDate]
								   ,[EStatementNumber]
								   ,[StatementNumber]
								   ,[BankName]
								   ,[RecordID]
								   ,[HyphenDateProcessed]
								   ,[BankAndStatementDate]
								   ,[StatementTransactionCount]
								   ,[NettAmount]
								   ,[HyphenDateReceived]
								   ,[Status]
								   ,[StatementAndLineNumber]
								   ,[DebitCredit]
								   ,[StatementLineNumber]
								   ,[ErrorCode]
								   ,[Proccessed]
								   ,[User]
								   ,[Code1]
								   ,[Code2]
								   ,[UserReference]
								   ,[ClaimCheckReference])
							 VALUES
								   (0
								   ,0
								   ,'BackendProcess'
								   ,(select getdate())
								   ,'BackendProcess'
								   ,(select getdate())
								   ,0
								   ,@TransactionType
								   ,@DocumentType
								   ,@Reference1
								   ,@Reference2
								   ,Replace(Ltrim(Replace(@RequisitionNumber, '0', ' ')), ' ', '0')
								   ,'000000000000'
								   ,@BankAccountNumber
								   ,'9996'
								   ,'00255005'
								   ,(select getdate())
								   ,(select getdate())
								   ,1270
								   ,1270
								   ,NULL
								   ,91
								   ,(select getdate())
								   ,(select getdate())
								   ,1
								   ,CAST(@Amount AS bigint)
								   ,(select getdate())
								   ,2
								   ,8
								   ,'-'
								   ,8
								   ,@ErrorCode
								   ,0
								   ,''
								   ,'FACRMAQ1'
								   ,''
								   ,'FNB APP PAYMENT FRO               B3966'
								   ,'E6C0F754-AC76-4FF2-9873-3950A7F885C8')


								update payment.payment
								set paymentStatusId = 4 
								where PaymentId = @PaymentId


							COMMIT
					END TRY
					BEGIN CATCH
						RAISERROR (N'Could not update the bankstatement for transaction ', -- Message text.  
								   10, -- Severity,  
								   1, -- State,  
								  @PaymentReference); -- First argument supplies the string.

						IF @@TRANCOUNT > 0
							ROLLBACK
					END CATCH
  
			  set @PaymentRefernces = stuff(@PaymentRefernces, 1, charindex(',', @PaymentRefernces+','), '')
			end
	END
