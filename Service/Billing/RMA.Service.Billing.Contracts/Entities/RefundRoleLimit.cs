namespace RMA.Service.Billing.Contracts.Entities
{
    public class RefundRoleLimit
    {
        public int RefundRoleLimitId { get; set; }
        public int RoleId { get; set; }
        public decimal LimitStart { get; set; } = 0m;
        public decimal LimitEnd { get; set; }
        public bool CanOverride { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
