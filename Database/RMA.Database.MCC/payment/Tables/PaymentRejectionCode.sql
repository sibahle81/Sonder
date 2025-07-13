	CREATE TABLE [payment].[PaymentRejectionCode]
	(
	  [Id]				INT				IDENTITY (1,1) NOT NULL,
	  [Code]			VARCHAR(30)		NOT NULL UNIQUE,
	  [BriefDescription]VARCHAR(100)	NOT NULL,
	  [FullDescription] VARCHAR(MAX),
	  [IsActive]		BIT				DEFAULT ((1)) NOT NULL,
	  [IsDeleted]		BIT				DEFAULT ((0)) NOT NULL,
	  [CreatedBy]		VARCHAR(30)		NOT NULL,
	  [CreatedDate]		DATETIME		DEFAULT (GETDATE()) NOT NULL,
	  [ModifiedBy]		VARCHAR(30)		NOT NULL,
	  [ModifiedDate]	DATETIME		DEFAULT (GETDATE()) NOT NULL,
	  CONSTRAINT [PK_payment.PaymentRejectionCode] PRIMARY KEY CLUSTERED ([Id] ASC)
	)