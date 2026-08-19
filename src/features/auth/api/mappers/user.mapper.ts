import type { ProfileDto, ProfileRoleDto } from "@/features/auth/api/dtos/user-profile.dto";
import type { User } from "@/features/auth/application/entities/user.entity";
import { normalizePermissions } from "@/features/auth/domain/permissions";

export function roleToKey(role: ProfileRoleDto): string | undefined {
  return role.roleKey ?? role.roleName ?? role.role ?? role.displayName;
}

export const UserMapper = {
  toDomain(dto: ProfileDto): User {
    return {
      id: dto.uuid,
      name: dto.name,
      lastName: dto.surname,
      fullName: dto.fullName,
      email: dto.email,
      avatar: dto.photo,
      lang: dto.language,
      organizationId: dto.organizationId,
      allowedProducts: dto.allowedProducts ?? [],
      roles: (dto.roles ?? []).map(roleToKey).filter((role): role is string => Boolean(role)),
      permissions: normalizePermissions(dto.permissions ?? []),
      organization: {
        id: dto.organization?.uuid ?? dto.organizationId,
        name: dto.organization?.name ?? "",
        type: dto.organization?.type ?? "",
        plan: dto.organization?.plan ?? "",
        allowedProducts: dto.organization?.allowedProducts ?? [],
      },
      organizationSubscriptions: dto.organizationSubscriptions ?? [],
    };
  },
};
