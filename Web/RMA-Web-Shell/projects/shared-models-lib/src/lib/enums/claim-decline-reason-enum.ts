/** @description THe different types of rules available in the app. */
export enum ClaimDeclineReasonEnum {
		ExclusionCauseOfDeathExcluded = 1,
		FalseInformationAtApplicationStage = 2,
		LateNotificationAfter3MonthsOfDateOfDeath = 3,
		LifeAssuredDiedPriorToPolicyStartDate = 4,
		LifeAssuredDiedWithinTheWaitingPeriod = 5,
		LifeAssuredNotCoveredOnThePolicy = 6,
		NoPolicyAtRMA = 7,
		OveragedChild = 8,
		PremiumInArrears = 9,
		StillBornUnder26Weeks = 10,
		StillBirthDeclineMaxPayoutExceeded = 11,
		SuicideWithinTheFirst12MonthsFromDateOfCoverOrIncreaseCoverDate = 12,
		SuspiciousClaim = 13
}
