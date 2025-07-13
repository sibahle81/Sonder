export class Visit {
    visitId: number;
	pensionerId: number;
	dateVisited: Date;
	serviceId: number;
	clinicVenueId: number | null;
	service: string;
	comment: string;
	isActive: boolean;
	isDeleted: boolean;
	createdBy: string;
	createdDate: Date;
	modifiedBy: string;
	modifiedDate: Date;
}
