import { formatNumber } from '@/lib/utils'
import { useEffect, useState } from 'react'

export const useGithubStars = (repo: string, defaultStars: number = 1900) => {
  const [starCount, setStarCount] = useState<number>(defaultStars)

  useEffect(() => {
    fetch(`https://api.github.com/repos/MotiaDev/${repo}`)
      .then((response) => response.json())
      .then((data) => setStarCount(data?.stargazers_count ?? defaultStars))
      .catch((error) => console.error('Error fetching GitHub stars:', error))
  }, [])

  return formatNumber(starCount)
}
