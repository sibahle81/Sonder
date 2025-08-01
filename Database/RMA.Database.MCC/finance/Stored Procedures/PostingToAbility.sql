-- =============================================
-- Author:		Gram Letoaba
-- Create date: 23/08/2019
-- Description:	The procedure does GL Posting to Ability
-- =============================================
CREATE   PROCEDURE [finance].[PostingToAbility]
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
     @chart_no		INT
AS
IF(@TransactionType NOT LIKE ('%RECOVERY%'))
BEGIN
	DECLARE   @SysNo INTEGER,
	          @ReturnStatus INTEGER ,
              @ServerError INTEGER,
			  @OnStatement INTEGER ,
              @EftVoucherNo INTEGER,
			  @DocDate DATETIME,
			  @AmountBank MONEY,
			   @ErrorMessage VARCHAR(500), 
			   @ErrorSeverity INT, 
			   @return_status INT ,
			   @AppErroMsg VARCHAR(100),
			   @ErrorState INT,
			   @countRows INT
	 SET XACT_ABORT ON
     SELECT @DocDate = GetDate(),
	        @AmountBank = @DailyTotal * -1

 BEGIN TRANSACTION
 
  EXECUTE @ReturnStatus = [Ability].[sp_aa_audit_begin] @User,
                @UserPass, @ModuleNo, @TranTypeNo, @SysNo OUTPUT, @AppErrorNo OUTPUT,
                @AppErrorMess OUTPUT

    SELECT  @ServerError = @@ERROR
    IF ( @ReturnStatus + @ServerError ) <> 0 
        BEGIN
            IF @@TRANCOUNT <> 0 
                ROLLBACK TRANSACTION
            RAISERROR (@AppErrorMess, 16, 1)
            RETURN(0)
        END
	 --IF ( SELECT COUNT(*)
  --       FROM  [Ability].[cb_bank_reference]  WITH ( NOLOCK )
  --       WHERE  @BankAccount = cb_bank_reference.no
  --              AND @BankReference = cb_bank_reference.bank_reference_no
  --     ) = 0 
	    SET @countRows = (SELECT COUNT(*)
         FROM  [Ability].[cb_bank_reference]  WITH ( NOLOCK )
         WHERE  @BankAccount = cb_bank_reference.no
                AND @BankReference = cb_bank_reference.bank_reference_no)
	IF(@countRows = 0)
        BEGIN
            SELECT @OnStatement = 0 ,
            @EftVoucherNo = 0

			EXECUTE @ReturnStatus = [Ability].[sp_aa_i_cb_bank_reference] @ModuleNo,
			@TranTypeNo, @SysNo, @User, @BankAccount, @BankReference,
			@EftVoucherNo, @BankReference, 20, @AmountBank,
			@OnStatement, @DocDate, @AppErrorNo OUTPUT, @AppErrorMess OUTPUT

			SELECT  @ServerError = @@ERROR
			IF ( @ReturnStatus + @ServerError ) <> 0 
				BEGIN
					IF @@TRANCOUNT <> 0 
						ROLLBACK TRANSACTION
					RAISERROR (@AppErrorMess, 16, 1)
					RETURN(0)
				END
        END
	BEGIN
		 EXECUTE @ReturnStatus = [Ability].[sp_aa_i_cb_doc_header] @ModuleNo,
                @TranTypeNo, @SysNo, @User, @BankAccount, @BankReference, 4,
                @yyyy, @mm, @Currency, @BankReference, @DocDate, @AmountBank,
                0, @AmountBank, NULL, 'cb', NULL, NULL, @TransactionType,
                NULL, 1, @AppErrorNo OUTPUT, @AppErrorMess OUTPUT,
                NULL, @BankReference, @BankReference, @BankReference, @AmountBank, 0
                

            SELECT  @ServerError = @@ERROR
            IF ( @ReturnStatus + @ServerError ) <> 0 
                BEGIN
                    IF @@TRANCOUNT <> 0 
                        ROLLBACK TRANSACTION
                    RAISERROR (@AppErrorMess, 16, 1)
                    RETURN(0)

                END
	END

	BEGIN 
		EXECUTE @ReturnStatus = [Ability].[sp_aa_i_cb_doc_line_roe] @ModuleNo,
			@TranTypeNo, @SysNo, @User, 1, 1,
			@DailyTotal, 3, NULL, 1,
			@AppErrorNo OUTPUT, @AppErrorMess OUTPUT

    SELECT  @ServerError = @@ERROR
    IF ( @ReturnStatus + @ServerError ) <> 0 
		BEGIN
            IF @@TRANCOUNT <> 0 
                ROLLBACK TRANSACTION
            RAISERROR (@AppErrorMess, 16, 1)
            RETURN(0)
        END
	END

	BEGIN
	   EXECUTE @ReturnStatus = [Ability].[sp_aa_i_cb_doc_line] @ModuleNo,
                @TranTypeNo, @SysNo, @User, 1,
                @company_no, @branch_no, @level1_no,
                @level2_no, @level3_no, @chart_no, NULL,
                @DailyTotal, 0, 1, 22,
                'n', 0, 1,
                100, 1, 1,
                1, @BankReference, @AppErrorNo OUTPUT,
                @AppErrorMess OUTPUT
            SELECT  @ServerError = @@ERROR
            IF ( @ReturnStatus + @ServerError ) <> 0 
                BEGIN
                    IF @@TRANCOUNT <> 0 
                        ROLLBACK TRANSACTION
                    RAISERROR (@AppErrorMess, 16, 1)
                    RETURN(0)
                END

	END
   COMMIT TRANSACTION  
        SET XACT_ABORT OFF 

		 GOTO the_end  
        error_process:  
        IF @ReturnStatus < 0 
            BEGIN  
                ROLLBACK TRANSACTION  
                RAISERROR (@AppErrorMess, 16, 1)  
                RETURN(1)  
            END  
        IF @ReturnStatus > 0 
            BEGIN  
                ROLLBACK TRANSACTION  
                RAISERROR (@AppErrorMess, 16, 1)  
                RETURN(1)  
            END  
        the_end:  
        SET NOCOUNT OFF 
  
END
