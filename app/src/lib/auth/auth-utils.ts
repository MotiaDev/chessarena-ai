/**
 * Extract authentication parameters from the URL
 * Used to handle OAuth redirects and error states
 */
export const getAuthParamsFromUrl = () => {
  try {
    // Check both query params and hash for errors
    const searchParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))

    // Check for errors in either location
    const error = searchParams.get('error') || hashParams.get('error')
    const errorCode = searchParams.get('error_code') || hashParams.get('error_code')
    const errorDescription = searchParams.get('error_description') || hashParams.get('error_description')

    if (error) {
      return {
        error,
        error_code: errorCode,
        error_description: errorDescription,
        access_token: null,
      }
    }

    // If no error, check for access token
    const accessToken = hashParams.get('access_token')
    return {
      error: null,
      error_code: null,
      error_description: null,
      access_token: accessToken,
    }
  } catch (error) {
    console.error('Error parsing URL parameters:', error)
    return {
      error: 'parse_error',
      error_code: 'url_parse_failed',
      error_description: 'Failed to parse URL parameters',
      access_token: null,
    }
  }
}

/**
 * Handle authentication errors in a standardized way
 */
export const handleAuthError = (error: unknown) => {
  const supabaseError = error as { message?: string; code?: string }
  return {
    error: supabaseError.message || 'Authentication error',
    error_code: supabaseError.code || '',
    error_description: '',
  }
}
