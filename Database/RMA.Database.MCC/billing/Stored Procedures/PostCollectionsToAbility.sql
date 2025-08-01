-- =============================================
-- Author:		Gram Letoaba
-- Create date: 16/03/2020
-- Description:	The procedure does Collections GL Posting to Ability
-- =============================================
CREATE PROCEDURE [billing].[PostCollectionsToAbility]
	 @User VARCHAR(10) ,
     @UserPass VARCHAR(10) ,
	 @ModuleNo VARCHAR(2) ,
	 @TranTypeNo INTEGER ,
	 @BankAccount VARCHAR(max) ,
	 @BankReference VARCHAR(max) ,
	 @DailyTotal MONEY ,
	 @DocTypeFlag TINYINT ,
	 @TransactionType VARCHAR(max) ,
	 @Currency CHAR(3) ,
	 @yyyy SMALLINT,
	 @mm TINYINT,
	 @AppErrorNo INTEGER OUTPUT ,
     @AppErrorMess VARCHAR(100) OUTPUT,
	 @company_no 		INT,
     @branch_no 		INT,
     @level1_no 		VARCHAR(10),
     @level2_no 		VARCHAR(10),
     @level3_no		VARCHAR(10),
     @chart_no		INT,
	 @Industry INT,
	 @DocType VARCHAR(100) ,
	 @TransModuleNo CHAR(2) ,
     @TransTypeNo SMALLINT ,
     @TransTypeSysNo INTEGER ,
     @TransUserNo VARCHAR(100),
	 @ourRefNo VARCHAR(50) ,
	 @yourRefNo VARCHAR(50) 
AS
BEGIN
	DECLARE   @SysNo INTEGER,
			  @return_status INT ,
              @server_error INT ,
	          @ReturnStatus INTEGER ,
              @ServerError INTEGER,
			  @OnStatement INTEGER ,
              @EftVoucherNo INTEGER,
			  @DocDate DATETIME,
			  @AmountBank MONEY,
			  @AbilityChartPostingMonthlyAnnualy nvarchar(100),
			  @Coid INT,
			  @AppErroNo INT,
			  @AppErroMsg VARCHAR(100),
			  @PolDocType VARCHAR(5),
			  @PolicyPwd VARCHAR(20),
			  @PaymentFrequencyTypeId INT,
			  @ProductCodeID INT,
			  @AllocatedNo FLOAT,  
			  @DocumentNo VARCHAR(15),
			  @TranType Varchar(11),
			  @AbilityAudit varchar(30),
			  @PolTaxAmount MONEY= 0 ,
			  @taxPercent FLOAT= 0 ,
			  @taxonlyyn CHAR(1) ,
			  @CountryNo INTEGER ,
			  @PolVatNo INTEGER ,
			  @PolVatYes INTEGER ,
			  @SalesTaxType INTEGER , 
			  @DocTotInclTax MONEY,    
			  --@ourRefNo VARCHAR(50) ,
			  --@yourRefNo VARCHAR(50) , 
			  @DocTotInclTaxNeg MONEY ,
			  @PolTaxAmountNeg MONEY,
			  @NewReference Varchar(11)
	 SET XACT_ABORT ON
     SELECT @DocDate = GetDate(),
	        @AmountBank = @DailyTotal * -1

	IF @AmountBank > 0 
		BEGIN  
			SET @PolDocType = 'iv'  
			SET @DocType = 20  
		END  
	ELSE 
		BEGIN  
			SET @PolDocType = 'cn'  
			SET @DocType = 40  
		END  

	 --EXECUTE @ReturnStatus = [Ability].[sp_aa_audit_begin] @User,
  --              @UserPass, @ModuleNo, @TranTypeNo, @SysNo OUTPUT, @AppErrorNo OUTPUT,
  --              @AppErrorMess OUTPUT

	 --EXECUTE @return_status = Ability.sp_aa_u_ct_tran_type_system_no @TransModuleNo, 
		--	@TransTypeNo, @TransUserNo, UserPass, 1.00, 'y', 
		--	@SysNo OUTPUT 
		
	--EXECUTE [billing].[SetJournalUser] @TransUserNo, @PolicyPwd OUTPUT   

	 EXECUTE @return_status = Ability.sp_aa_u_ct_tran_type_system_no @TransModuleNo, 
			@TransTypeNo, @TransUserNo, @UserPass, 1.00, 'y', 
			@TransTypeSysNo OUTPUT  

	SELECT @AbilityChartPostingMonthlyAnnualy = Value FROM [common].[Settings] WHERE [Key] = 'AbilityChartPostingMonthlyAnnualy'  
	
	CREATE TABLE #ProductId (IDs INT)

	INSERT INTO #ProductId
			SELECT [Value] FROM Common.fnSplit(',', @AbilityChartPostingMonthlyAnnualy)

	EXECUTE @return_status = Ability.sp_aa_audit_begin @TransUserNo, 
			@UserPass, @TransModuleNo, @TransTypeNo, @TransTypeSysNo OUTPUT, 
			@AppErroNo OUTPUT, @AppErroMsg OUTPUT  
        SELECT  @server_error = @@error  
        IF @return_status <> 0 
            GOTO error_process 

	 SET XACT_ABORT ON  
     BEGIN TRANSACTION
     SET @AllocatedNo = NULL  
  
        EXECUTE @return_status = Ability.sp_pa_allocate_doc_number @PolDocType, 
			@company_no, @branch_no, '', @TransModuleNo, @TransTypeNo, 
			@TransTypeSysNo, @TransUserNo, @AllocatedNo OUTPUT, 
			@AppErroNo OUTPUT, @AppErroMsg OUTPUT  
        SELECT  @server_error = @@error  
        IF @return_status <> 0 
            GOTO error_process  
        SET @DocumentNo = @PolDocType + CAST(@AllocatedNo AS VARCHAR) 

	 --SET @DocTotInclTax = ROUND(@PolTaxAmount + @DocTotExclTax, 2)  
        EXECUTE @return_status = Ability.sp_aa_i_dr_doc_header_age @TransModuleNo, 
			@TransTypeNo, @TransTypeSysNo, @TransUserNo, @yyyy, @mm, 
			@AmountBank, @AppErroNo OUTPUT, @AppErroMsg OUTPUT  
        SELECT  @server_error = @@error  
        IF @return_status <> 0 
            GOTO error_process  
  
        EXECUTE @return_status = Ability.sp_aa_i_dr_doc_header_st @TransModuleNo, 
			@TransTypeNo, @TransTypeSysNo, @TransUserNo, 1, 15, 0, @DocDate, 
			@AmountBank, 0, 0, @AppErroNo OUTPUT, @AppErroMsg OUTPUT  
        SELECT  @server_error = @@error  
        IF @return_status <> 0 
            GOTO error_process  
  
          
        EXECUTE @return_status = Ability.sp_aa_i_dr_doc_header_pt @TransModuleNo, 
			@TransTypeNo, @TransTypeSysNo, @TransUserNo, 1, 15, 0, @DocDate, 
			@AmountBank, @AppErroNo OUTPUT, @AppErroMsg OUTPUT  
        SELECT  @server_error = @@error  
        IF @return_status <> 0 
            GOTO error_process  
          
        SET @ourRefNo = 'FUN' --@PolicyType + '/' + @PolicyNum  
        SET @yourRefNo = CONVERT(VARCHAR(10), GetDate(), 105) + '-' + CONVERT(VARCHAR(10), GetDate(), 105)  
  
  --		IF @Coid = 0
		--BEGIN
		--	--set @MemberNum = @MemberNum + 'NC'
		--END
		--SELECT @NewReference = LEFT(@BankReference, 10);
		--EXECUTE @return_status = Ability.sp_aa_i_dr_doc_header @TransModuleNo, 
		--	@TransTypeNo, @TransTypeSysNo, @TransUserNo, @NewReference, @company_no, 
		--	@branch_no, @DocType, @yyyy, @mm, @yyyy, @mm, 
		--	@DocumentNo, @DocDate, @ourRefNo, @yourRefNo, @AmountBank, 
		--	@AmountBank, '', '', 1, @AppErroNo OUTPUT, 
		--	@AppErroMsg OUTPUT, 0, NULL, 0, 0  
  
        SELECT  @server_error = @@error 

		      SET @DocTotInclTaxNeg = 0 - @DocTotInclTax  
        SET @PolTaxAmountNeg = 0 - @PolTaxAmount  
  
   --     EXECUTE @return_status = Ability.sp_aa_i_dr_doc_line_roe @TransModuleNo, 
			--@TransTypeNo, @TransTypeSysNo, @TransUserNo, 1, 1, 
			--@AmountBank, 3, NULL, 1, @AppErroNo OUTPUT, 
			--@AppErroMsg OUTPUT  
   --     SELECT  @server_error = @@error  
   --     IF @return_status <> 0 
   --         GOTO error_process  
  
   --     EXECUTE @return_status = Ability.sp_aa_i_dr_doc_line @TransModuleNo, 
			--@TransTypeNo, @TransTypeSysNo, @TransUserNo, 1, @company_no, @branch_no, 
			--'FUN',@level2_no, @yyyy, @chart_no, NULL, 
			--@DocTotInclTaxNeg, @PolTaxAmountNeg, @CountryNo, @SalesTaxType, 
			--@taxonlyyn, @taxPercent, 1, 1, 1, 1, @yourRefNo, @AppErroNo OUTPUT, 
			--@AppErroMsg OUTPUT, 0  
   --     SELECT  @server_error = @@error  
   --     IF @return_status <> 0 
   --         GOTO error_process  
  
        COMMIT TRANSACTION  
        SET XACT_ABORT OFF 

		 GOTO the_end  
        error_process:  
        IF @return_status < 0 
            BEGIN  
                ROLLBACK TRANSACTION  
                RAISERROR (@AppErroMsg, 16, 1)  
                RETURN(1)  
            END  
        IF @return_status > 0 
            BEGIN  
                ROLLBACK TRANSACTION  
                RAISERROR (@AppErroMsg, 16, 1)  
                RETURN(1)  
            END  
        the_end:  
        SET NOCOUNT OFF 
  
END
