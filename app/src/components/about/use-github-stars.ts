import { useEffect, useState } from 'react'

const formatStarCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

export const useGithubStars = (repo: string, defaultStars: number = 1900) => {
  const [starCount, setStarCount] = useState<number>(defaultStars)

  useEffect(() => {
    fetch(`https://api.github.com/repos/MotiaDev/${repo}`)
      .then((response) => response.json())
      .then((data) => setStarCount(data?.stargazers_count ?? defaultStars))
      .catch((error) => console.error('Error fetching GitHub stars:', error))
  }, [])

  return formatStarCount(starCount)
}
