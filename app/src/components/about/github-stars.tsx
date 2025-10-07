import type React from 'react'
import { Star } from 'lucide-react'
import { useGithubStars } from './use-github-stars'

export const GithubStars: React.FC<{ repo: string; defaultStars: number }> = ({ repo, defaultStars }) => {
  const stars = useGithubStars(repo, defaultStars)

  return (
    <a
      href={`https://github.com/MotiaDev/${repo}`}
      target="_blank"
      className="flex cursor-pointer items-center p-3 text-white font-semibold border-2 border-white/15 rounded-md w-full hover:bg-white/5 transition-all duration-300"
    >
      <div className="flex items-center gap-1 text-white flex-1 text-sm">
        <img src="/github-white.svg" alt="GitHub" className="size-5" /> {repo}
      </div>
      <div className="flex flex-row items-center gap-1 text-white justify-end text-sm">
        <Star className="size-5" /> {stars}
      </div>
    </a>
  )
}
