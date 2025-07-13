
-- =============================================
-- Author:Gram Letoaba
-- Create date: 06/04/2020
-- Culprits: Sibahle Senda
--EXEC [billing].[DebitOrderReport] NULL,NULL,'2022/03/28','2022/03/29',0,0,3
-- =============================================
CREATE PROCEDURE [billing].[TermDebitOrderReport]
@periodYear nvarchar(250) = NULL,
@periodMonth nvarchar(250) = NULL,
@startDate nvarchar(250) = NULL,
@endDate nvarchar(250) = NULL,
@IndustryId int = 0,
@ProductId int =0,
@DebitOrderTypeId int = 0
--@RMABankAccount nvarchar(250) = NULL


AS
BEGIN

--DECLARE
-- @periodYear nvarchar(250) = NULL,
-- @periodMonth nvarchar(250) = NULL,
-- @startDate nvarchar(250) = '2022/02/01',
-- @endDate nvarchar(250) = '2022/02/28',
-- @IndustryId int,
-- @ProductId int =0,
-- @DebitOrderTypeId int = 0,
-- @RMABankAccount nvarchar(250)  ='0'

DECLARE

                --@eofmonth date,
                @eofmonthday int,
                @maxreginstallment int,
                @ToDateID INT,
                @enddateday int

                --set @eofmonth = EOMONTH(@endDate)
                set @eofmonthday = DAY(EOMONTH(@endDate))
                set @maxreginstallment =(select max(RegularInstallmentDayOfMonth)from policy.policy)
                set @ToDateID = (YEAR(@startDate) * 10000) + (MONTH(@startDate) * 100) + (@maxreginstallment)
                set @enddateday=day(@endDate)


                IF @eofmonthday=@enddateday
                BEGIN
                                IF (@enddateday = @maxreginstallment or @enddateday = @maxreginstallment -1
                                                or @enddateday = @maxreginstallment -2 or @enddateday = @maxreginstallment -3) begin 
                                                set @enddateday = @maxreginstallment 
                                 end else begin 
                                                set @enddateday =@enddateday end
                END
--select @enddateday,@eofmonthday

                IF @startDate = '-1'
                                begin
                                set @startDate  = NULL
                                end
                IF @endDate = '-1' 
                                begin
                                set  @endDate = NULL
                                end
                
                IF  @periodMonth = 0 or @periodMonth = -1
                                begin
                                set  @periodMonth = NULL
                                end
                
                IF @periodYear = 1970 or  @periodYear = -1
                                begin
                                set @periodYear = NULL
                                end

                IF @IndustryId = 0
                                begin
                                select @IndustryId = NULL;
                                end

                IF @ProductId = 0
                                begin
                                select @ProductId = NULL;
                                end

                IF @DebitOrderTypeId = 0
                                begin
                                select @DebitOrderTypeId = NULL;
                                end
                
--IF @RMABankAccount = '0' 
--     begin
--             set  @RMABankAccount = NULL
--             end

                DECLARE @SearchTable TABLE (
                    ControlNumber VARCHAR(250),
                               ControlName VARCHAR(250),
                                [Year] INT,
                                Period INT,
                                DebitOrderDay int,
                                AccountNumber VARCHAR(250),
                                DebtorName VARCHAR(250),
                                InvoiceId INT,
                                InvoiceNumber VARCHAR(250),
                                PolicyId INT,
                                PolicyNumber VARCHAR(250),
                                DebitOrdeAmount Decimal(18,2),
                                ClientBankAccountNumber VARCHAR(250),
                                BankAccountType VARCHAR(250),
                                BranchCode VARCHAR(20),
                                BankAccountNumber VARCHAR(250),
                                ActionDate Date,
                                [Message] VARCHAR(250),
                                RMACode VARCHAR(20),
                                RMAMessage VARCHAR(250),
                                HyphenDate Date,
                                HyphenErrorCode VARCHAR(20),
                                HyphenErrorMessage VARCHAR(250),
                                BankDate Date,
                                BankErrorCode VARCHAR(20),
                                BankErrorMessage VARCHAR(250),
                                AccountHolder VARCHAR(250),
                                CollectionStatus VARCHAR(250),
                                DecemberDebitDay INT,
                                MissedPayments INT,
                                Balance Decimal(18,2)
                );


  -- Term Arrangement Debit orders
  INSERT INTO @SearchTable
                SELECT DISTINCT
                  CASE WHEN (CBA.AccountNumber = '62679223942')  THEN
                  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
                  WHEN (CBA.AccountNumber = '50510037788')  THEN 
                  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1)
                  WHEN (CBA.AccountNumber = '62684073142') THEN 
                  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2)
                  WHEN (CBA.AccountNumber = '62775460646') THEN 
                  (SELECT TOP 1 Level3 FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4)
                  END AS ControlNumber
                  , CASE WHEN (CBA.AccountNumber = '62679223942') THEN
                  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'INDF')
                  WHEN (CBA.AccountNumber = '50510037788') THEN 
                  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 1) 
                  WHEN (CBA.AccountNumber = '62684073142') THEN 
                  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 2) 
                  WHEN (CBA.AccountNumber = '62775460646') THEN 
                  (SELECT TOP 1 Origin FROM [finance].[ProductCrossRefTranType] WHERE [TransactionType] = 'Invoice' AND Level1 = 'FUN' AND BranchNo = 4) 
                  END AS ControlName,
                  YEAR(bts.PaymentDate)
                  ,MONTH(bts.PaymentDate)
                  ,(YEAR(bts.PaymentDate) * 10000) + (MONTH(bts.PaymentDate) * 100) + (DAY(bts.PaymentDate) * 1)
                  ,F.FinPayeNumber
                  ,R.DisplayName
                  ,0
                  ,''
                  ,0
                  ,''
                  ,bta.TotalAmount
                  ,RB.AccountNumber
                  ,BT.Name
                  ,RB.BranchCode
                  ,CBA.AccountNumber
                  ,bts.PaymentDate
                  ,''
                  ,''
                  ,''
                  ,null
                  ,''
                  ,''
                  ,null
                  ,''
                  ,''
                  ,RB.AccountHolderName
                  ,'Future'
                  ,null --P.DecemberInstallmentDayOfMonth AS DecemberDebitDay
                  ,0
                  ,0
  FROM [billing].[TermDebitOrderBankingDetail] A
  INNER JOIN [billing].TermArrangement bta on A.TermArrangementId = bta.TermArrangementId
  INNER JOIN [billing].[TermArrangementSchedule] bts on A.termArrangementId = bts.TermArrangementId 
  INNER JOIN [client].[FinPayee] F ON bta.RolePlayerId = F.RolePlayerId
  INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
  INNER JOIN [client].[RolePlayerBankingDetails] RB ON R.RolePlayerId = RB.RolePlayerId
  INNER JOIN [common].[BankAccountType] BT ON RB.BankAccountTypeId = BT.Id
  INNER JOIN [common].[Industry] IC ON IC.Id =F.IndustryId
  INNER JOIN [common].[IndustryClass] ICD ON ICD.Id =IC.IndustryClassId
  INNER JOIN [product].ProductBankAccount PPBA ON ICD.Id =PPBA.IndustryClassId
  INNER JOIN [common].[BankAccount] CBA ON PPBA.BankAccountId = CBA.Id
  INNER JOIN [policy].[policy] p (NOLOCK) on r.[RolePlayerId] = p.[PolicyOwnerId]
  INNER JOIN [product].ProductOption ppo (NOLOCK) on p.ProductOptionId = ppo.Id
  LEFT JOIN product.product prod (NOLOCK) on ppo.ProductId = prod.Id
  Where bta.paymentMethodId = 11 
  and bta.isActive = 1


  SELECT DISTINCT ControlNumber,
                ControlName,
                [Year],
                Period,
                DebitOrderDay,
                AccountNumber,
                DebtorName,
                InvoiceId,
                InvoiceNumber,
                PolicyId,
                PolicyNumber,
                DebitOrdeAmount,
                ClientBankAccountNumber,
                BankAccountType,
                BranchCode,
                BankAccountNumber,
                ActionDate,
                [Message],
                RMACode,
                RMAMessage,
                HyphenDate,
                HyphenErrorCode,
                HyphenErrorMessage,
                BankDate,
                BankErrorCode,
                BankErrorMessage,
                AccountHolder,
                CollectionStatus,
                DecemberDebitDay,
                MissedPayments,
                Balance
                FROM @SearchTable
                order by 5 desc
END