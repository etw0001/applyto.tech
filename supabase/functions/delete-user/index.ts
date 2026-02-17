// Supabase Edge Function to delete a user account
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Log immediately to verify function is running
    try {
        console.log('[DELETE-USER] Function started')
        console.log('[DELETE-USER] Method:', req.method)
        console.log('[DELETE-USER] URL:', req.url)
    } catch (logError) {
        console.error('[DELETE-USER] Log error:', logError)
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get authorization header
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
        console.log('[DELETE-USER] Auth header present:', !!authHeader)

        if (!authHeader) {
            console.error('[DELETE-USER] No authorization header')
            return new Response(
                JSON.stringify({ error: 'No authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get environment variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
            console.error('[DELETE-USER] Missing environment variables')
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('[DELETE-USER] Environment variables loaded')

        // Extract token
        const token = authHeader.replace(/^Bearer\s+/i, '')
        console.log('[DELETE-USER] Token length:', token.length)
        console.log('[DELETE-USER] Token (first 50 chars):', token.substring(0, 50))

        // Create admin client - it can verify any JWT token
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        console.log('[DELETE-USER] Verifying token with admin client...')
        // Admin client can verify any JWT token
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

        if (userError || !user) {
            console.error('[DELETE-USER] Auth failed:', userError?.message || 'Unknown error')
            return new Response(
                JSON.stringify({ error: userError?.message || 'Invalid or expired token' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const userId = user.id
        console.log('[DELETE-USER] User authenticated:', userId)

        // Delete applications (using the admin client we already created)
        console.log('[DELETE-USER] Deleting applications...')
        const { error: appsError } = await supabaseAdmin
            .from('applications')
            .delete()
            .eq('user_id', userId)

        if (appsError) {
            console.error('[DELETE-USER] Apps delete error:', appsError.message)
        } else {
            console.log('[DELETE-USER] Applications deleted')
        }

        // Delete profile
        console.log('[DELETE-USER] Deleting profile...')
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (profileError) {
            console.error('[DELETE-USER] Profile delete error:', profileError.message)
        } else {
            console.log('[DELETE-USER] Profile deleted')
        }

        // Delete auth user
        console.log('[DELETE-USER] Deleting auth user...')
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (deleteError) {
            console.error('[DELETE-USER] Auth user delete error:', deleteError.message)
            return new Response(
                JSON.stringify({ error: `Failed to delete user: ${deleteError.message}` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('[DELETE-USER] Success! User deleted:', userId)
        return new Response(
            JSON.stringify({ message: 'User deleted successfully' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('[DELETE-USER] Unexpected error:', error)
        console.error('[DELETE-USER] Error stack:', error instanceof Error ? error.stack : 'No stack')
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
