export const githubRepositoryUrl = process.env.GITHUB_REPOSITORY_URL || null as string | null

export const githubSha = process.env.GITHUB_SHA || null as string | null

export const build = githubSha ? githubSha.slice(0, 7) : 'dev'
