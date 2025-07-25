// ✅ Section: User Roles
export const USER_ROLES = {
    EMPLOYEE: 'Employee',
    MANAGER: 'Manager',
    SUPERADMIN: 'SuperAdmin'
  }
  
  export const ROLE_OPTIONS = [
    USER_ROLES.EMPLOYEE,
    USER_ROLES.MANAGER,
    USER_ROLES.SUPERADMIN
  ]
  
  export const ROLE_BADGE_CLASSES = {
    [USER_ROLES.MANAGER]: 'bg-warning text-dark',
    [USER_ROLES.SUPERADMIN]: 'bg-success',
    [USER_ROLES.EMPLOYEE]: 'bg-secondary'
  }
  
  // Labels lisibles pour les rôles (centralisés ici)
  export const ROLE_LABELS = {
    [USER_ROLES.EMPLOYEE]: 'Employee',
    [USER_ROLES.MANAGER]: 'Manager',
    [USER_ROLES.SUPERADMIN]: 'Super Administrator'
  }
  
  // ✅ Section: Leave Statuses
  export const LEAVE_STATUSES = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
  }
  
  export const LEAVE_STATUS_LABELS = {
    [LEAVE_STATUSES.PENDING]: 'Pending',
    [LEAVE_STATUSES.APPROVED]: 'Approved',
    [LEAVE_STATUSES.REJECTED]: 'Rejected'
  }
  
  export const LEAVE_STATUS_CLASSES = {
    [LEAVE_STATUSES.PENDING]: 'bg-warning text-dark',
    [LEAVE_STATUSES.APPROVED]: 'bg-success',
    [LEAVE_STATUSES.REJECTED]: 'bg-danger'
  }
  