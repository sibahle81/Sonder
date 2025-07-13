namespace RMA.Service.ClientCare.Contracts.Entities.RolePlayer
{
    public class RolePlayerRelation
    {
        public int Id { get; set; }
        public int FromRolePlayerId { get; set; }
        public int ToRolePlayerId { get; set; }
        public int RolePlayerTypeId { get; set; }
        public int? PolicyId { get; set; }
        public int? AllocationPercentage { get; set; }
        public RolePlayerRelationLife RolePlayerRelationLife { get; set; }
    }
}
