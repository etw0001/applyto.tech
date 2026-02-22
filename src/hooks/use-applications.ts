import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type Status = "applied" | "interviewing" | "offered" | "rejected"

export interface Application {
    id: string
    company: string
    position: string
    link: string | null
    status: Status
    dateApplied: string
    createdAt?: string
    updatedAt?: string
}

export function useApplications(userId: string | undefined) {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Fetch applications
    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchApplications = async () => {
            try {
                const { data, error } = await supabase
                    .from('applications')
                    .select('*')
                    .eq('user_id', userId)
                    .order('date_applied', { ascending: false })

                if (error) throw error

                // Transform database format to app format
                const transformed = (data || []).map((app) => {
                    // Parse date string (YYYY-MM-DD) as local date to avoid timezone issues
                    const [year, month, day] = app.date_applied.split('-').map(Number);
                    const localDate = new Date(year, month - 1, day);
                    
                    return {
                        id: app.id,
                        company: app.company,
                        position: app.position,
                        link: app.link || '',
                        status: app.status as Status,
                        dateApplied: localDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric"
                        }),
                        createdAt: app.created_at,
                        updatedAt: app.updated_at,
                    };
                })

                setApplications(transformed)
                setError(null)
            } catch (err) {
                setError(err as Error)
                console.error('Error fetching applications:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchApplications()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('applications-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'applications',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    fetchApplications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const addApplication = async (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!userId) throw new Error('User not authenticated')

        // Convert date string to YYYY-MM-DD format using local time to avoid timezone issues
        const parseDateToLocal = (dateStr: string): string => {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const { data, error } = await supabase
            .from('applications')
            .insert({
                user_id: userId,
                company: application.company,
                position: application.position,
                link: application.link || null,
                status: application.status,
                date_applied: parseDateToLocal(application.dateApplied),
            })
            .select()
            .single()

        if (error) throw error

        // Transform and add to local state
        // Parse date string (YYYY-MM-DD) as local date to avoid timezone issues
        const [year, month, day] = data.date_applied.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        
        const transformed: Application = {
            id: data.id,
            company: data.company,
            position: data.position,
            link: data.link || '',
            status: data.status as Status,
            dateApplied: localDate.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric"
            }),
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        }

        setApplications((prev) => [transformed, ...prev])
        return transformed
    }

    const updateApplication = async (id: string, updates: Partial<Application>) => {
        if (!userId) throw new Error('User not authenticated')

        const updateData: any = {}
        if (updates.company) updateData.company = updates.company
        if (updates.position) updateData.position = updates.position
        if (updates.link !== undefined) updateData.link = updates.link || null
        if (updates.status) updateData.status = updates.status
        if (updates.dateApplied) {
            // Convert date string to YYYY-MM-DD format using local time to avoid timezone issues
            const date = new Date(updates.dateApplied);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            updateData.date_applied = `${year}-${month}-${day}`;
        }

        const { error } = await supabase
            .from('applications')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)

        if (error) throw error

        // Update local state
        setApplications((prev) =>
            prev.map((app) =>
                app.id === id
                    ? {
                        ...app,
                        ...updates,
                        dateApplied: updates.dateApplied || app.dateApplied,
                    }
                    : app
            )
        )
    }

    const deleteApplication = async (id: string) => {
        if (!userId) throw new Error('User not authenticated')

        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)

        if (error) throw error

        // Update local state
        setApplications((prev) => prev.filter((app) => app.id !== id))
    }

    return {
        applications,
        loading,
        error,
        addApplication,
        updateApplication,
        deleteApplication,
    }
}
