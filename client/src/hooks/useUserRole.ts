'use client'

import { useUser } from '@clerk/nextjs'

export type UserRole = 'tenant' | 'manager'

export function useUserRole(): UserRole | null {
    const { user, isLoaded } = useUser()

    if (!isLoaded || !user) return null

    const role = user.unsafeMetadata?.role as UserRole | undefined
    return role ?? null
}

export function useIsManager(): boolean {
    const role = useUserRole()
    return role === 'manager'
}

export function useIsTenant(): boolean {
    const role = useUserRole()
    return role === 'tenant'
}
