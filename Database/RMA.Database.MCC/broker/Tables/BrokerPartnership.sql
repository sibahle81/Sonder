CREATE TABLE [broker].[BrokerPartnership]
(
	[BrokerageId]  INT           NOT NULL,
	[Company]      INT           NOT NULL,
	[Branch]       INT           NOT NULL,
	[CostCenter]   INT           NOT NULL,
	[BrokerCode]   VARCHAR (30)  NOT NULL,		
	[IsDeleted]    BIT           NOT NULL,
	[CreatedBy]    VARCHAR (50)  NOT NULL,
	[CreatedDate]  DATETIME      NOT NULL,
	[ModifiedBy]   VARCHAR (50)  NOT NULL,
	[ModifiedDate] DATETIME      NOT NULL,
	CONSTRAINT [PK_broker.BrokerPartnership] PRIMARY KEY CLUSTERED ([BrokerageId] ASC),
	CONSTRAINT [FK_BrokerPartnership_Brokerage] FOREIGN KEY ([BrokerageId]) REFERENCES [broker].[Brokerage] ([Id])
);