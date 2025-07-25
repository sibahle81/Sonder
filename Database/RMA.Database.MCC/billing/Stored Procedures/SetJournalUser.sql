--EXEC  [billing].[SetJournalUser] 'Penrep', null

CREATE PROCEDURE [billing].[SetJournalUser]
    (
      @user VARCHAR(10) ,
      @PasswordNew VARCHAR(10) OUTPUT
    )
AS
    BEGIN TRY
        SET NOCOUNT ON
        DECLARE @return_status INT ,
            @server_error INT ,
            @tranno INT ,
            @app_error_no INT ,
            @app_error_mess VARCHAR(100) ,
            @password VARCHAR(10) ,
            @password_new VARCHAR(10)

        SELECT  @password = ISNULL(password, '')
        FROM    Ability.ct_user
        WHERE   no = @user
        IF @@rowcount = 0
            BEGIN
                RAISERROR('User not found',16,1)
            END

        IF EXISTS ( SELECT  *
                    FROM    [billing].[JournalUserPassword]
                    WHERE   [UserNo] = @user )
            BEGIN
                SELECT  @password_new = CAST([Password] AS VARCHAR(10))
                FROM    [billing].[JournalUserPassword]
                WHERE   [UserNo] = @user

                DECLARE @this_user_last_date DATETIME ,
                    @this_sysno INT ,
                    @datediff INT

                SELECT  @this_user_last_date = last_date
                FROM    Ability.ct_user
                WHERE   no = @user

                SELECT  @datediff = DATEDIFF(dd, @this_user_last_date, GETDATE())
                IF @datediff <> 0
                    BEGIN
                        IF ( LEN(@password_new) = 1 )
                            SET @password_new = substring(@user,1,3) + 'J00000' + SUBSTRING(@password_new, 1, 6)
                        ELSE
                            IF ( LEN(@password_new) = 2 )
                                SET @password_new = substring(@user,1,3) + 'J0000' + SUBSTRING(@password_new, 1, 6)
                            ELSE
                                IF ( LEN(@password_new) = 3 )
                                    SET @password_new = substring(@user,1,3) + 'J000' + SUBSTRING(@password_new, 1, 6)
                                ELSE
                                    IF ( LEN(@password_new) = 4 )
                                        SET @password_new = substring(@user,1,3) + 'J00' + SUBSTRING(@password_new, 1, 6)
                                    ELSE
                                        IF ( LEN(@password_new) = 5 )
                                            SET @password_new = substring(@user,1,3) + 'J0' + SUBSTRING(@password_new, 1, 6)
                                        ELSE
                                            IF ( LEN(@password_new) = 6 )
                                                SET @password_new = substring(@user,1,3) + 'J' + SUBSTRING(@password_new, 1, 6)

                        UPDATE  [billing].[JournalUserPassword]
                        SET     [Password] = CAST([Password] AS INT) + 1 ,
                                [LastLoginDate] = GETDATE()
                        WHERE   [UserNo] = @user
                    END
                ELSE
                    BEGIN
                        SELECT  @password_new = [password]
                        FROM    Ability.ct_user
                        WHERE   ct_user.no = @user
                        GOTO the_end
                    END
----Password Generated region end
            END
        ELSE
            BEGIN
                SET @password_new = @user + 'J000001'
                INSERT  INTO [billing].[JournalUserPassword]
                        ( UserNo ,
                          [Password] ,
                          [LastLoginDate]
                        )
                VALUES  ( @user ,
                          1 ,
                          GETDATE()
                        )
            END

        EXECUTE @return_status = Ability.sp_aa_u_ct_tran_type_system_no 'ct', 10, @user, @password, 1.00, 'y', @tranno OUTPUT
        SELECT  @server_error = @@error
        IF @return_status <> 0
            GOTO error_process

        EXECUTE @return_status = Ability.sp_aa_sign_on_user 'ct', 10, @tranno, @user, 1.00, @user, @password_new, @app_error_no OUTPUT, @app_error_mess OUTPUT
        SELECT  @server_error = @@error
        IF @return_status <> 0
            GOTO error_process

        EXECUTE @return_status = Ability.sp_aa_u_ct_tran_audit_commit 'ct', 10, @tranno
        SELECT  @server_error = @@error
        IF @return_status <> 0
            GOTO error_process

        GOTO the_end

        error_process:
        IF @return_status < 0
            BEGIN
                EXECUTE Ability.sp_aa_error 'ct', 10, @tranno, @server_error, ''
                RAISERROR (@app_error_no, 16, 1)
            END
        IF @return_status > 0
            BEGIN
                ROLLBACK TRANSACTION
                EXECUTE Ability.sp_aa_error 'ct', 10, @tranno, @app_error_no, @app_error_mess
                RAISERROR (@app_error_no, 16, 1)
            END
        the_end:
        SET @PasswordNew = @password_new
		PRINT @PasswordNew 
        SELECT @PasswordNew
    END TRY
    BEGIN CATCH
        DECLARE @ErrorNo INT ,
            @ErrorMsg VARCHAR(500)
        SELECT  @ErrorNo = ERROR_NUMBER() + 50000 ,
                @ErrorMsg = ERROR_MESSAGE()
        RAISERROR (@ErrorMsg, 16, 1)
    END CATCH
