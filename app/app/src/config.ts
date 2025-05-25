import {
	GITHUB_REPOSITORY_URL,
	GITHUB_SHA,
} from 'astro:env/client'

export const githubRepositoryUrl = GITHUB_REPOSITORY_URL || null
export const githubSha = GITHUB_SHA || null
export const build = githubSha ? githubSha.slice(0, 7) : 'dev'
