/** @format */

import fetch from 'node-fetch'
import { parseMarkdown } from './parser'
import { readFileSync, existsSync, truncateSync, writeFileSync } from 'fs'
import { join, resolve as _resolve } from 'path'
import { get } from 'download-stats'
import normalizeUrl from 'normalize-url'

const githubAPIURL = 'https://api.github.com/'
const baseURL = githubAPIURL + 'repos/markerikson/redux-ecosystem-links/'
const databaseFile = join(__dirname, '../database.json')
const githubRepoRegex = /^https:\/\/github.com\/[^\s]+\/[^\s]+$/(async function() {
    // The token must be the only text in the file, i.e. no newline
    const githubTokenBuffer = readFileSync(_resolve(__dirname, '../githubToken.txt'))
    const githubToken = Buffer.from(githubTokenBuffer).toString()

    const fetchJSON = async (uri) =>
        (await fetch(uri, { headers: { Authorization: 'token ' + githubToken } })).json()

    // Get the latest version of master
    const treeShaData = await fetchJSON(baseURL + 'branches/master')
    const treeSha = treeShaData.commit.commit.tree.sha
    const reduxLinksURL = baseURL + 'git/trees/' + treeSha

    // Fetch the target API.
    console.log('Fetching', reduxLinksURL)
    const json = await fetchJSON(reduxLinksURL)
    console.log('Got the JSON')

    // Download markdown files, parse the ast, and put to appropriate data structure.
    let jsonResult = { categories: [], last_update: new Date() }
    const tree = json.tree
    await Promise.all(
        tree.map((content) => {
            return (async function() {
                if (
                    content.type === 'blob' &&
                    content.path.split('.').pop() === 'md' &&
                    content.path !== 'README.md'
                ) {
                    // Download the markdown file.
                    console.log('Downloading', content.path)
                    const encoded = (await fetchJSON(content.url)).content
                    const text = Buffer.from(encoded, 'base64').toString('ascii')
                    console.log('Download', content.path, 'succeed')

                    // Parsing the markdown file.
                    console.log('Parsing', content.path)
                    const parsedObject = parseMarkdown(text)
                    jsonResult.categories.push(parsedObject)
                    console.log('Parsing', content.path, 'succeed')
                }
            })()
        }),
    )

    // Sort categories by name alphabetically.
    jsonResult.categories.sort((a, b) => {
        return (a.name > b.name) - (a.name < b.name)
    })

    // Get additional metadata.
    for (let category of jsonResult.categories) {
        for (let subcategory of category.subcategories) {
            await Promise.all(
                subcategory.repositories.map((repository) => {
                    return (async function() {
                        if (
                            repository === undefined ||
                            repository.name === undefined ||
                            repository.github_url === undefined ||
                            !githubRepoRegex.test(repository.github_url) ||
                            repository.description === undefined
                        ) {
                            console.log('Broken repository :', JSON.stringify(repository))
                            return
                        }

                        // Parse repo detail from its URL.
                        const normalizedUrl = normalizeUrl(repository.github_url)
                        const splittedURL = normalizedUrl.split('/')
                        const repoOwner = splittedURL[splittedURL.length - 2]
                        const repoName = splittedURL[splittedURL.length - 1]
                        const githubRepoURL = githubAPIURL + 'repos/' + repoOwner + '/' + repoName

                        // Get repo metadata from GitHub.
                        console.log('Getting GitHub metadata of', repoName)
                        const githubJSON = await fetchJSON(githubRepoURL)
                        console.log('Got GitHub metadata of', repoName)

                        // Get NPM downloads since last month.
                        console.log('Getting NPM metadata of', repoName)
                        const npmJSON = await new Promise((resolve) => {
                            get.lastMonth(repoName, function(err, result) {
                                if (err) return resolve({ downloads: 0 })
                                resolve(result)
                            })
                        })
                        console.log('Got NPM metadata of', repoName)

                        // Update JSON with additional metadata.
                        repository.github_star = githubJSON.stargazers_count
                        if (githubJSON.updated_at !== undefined) {
                            repository.github_last_update = githubJSON.updated_at.split('T')[0]
                        }
                        repository.npm_download_since_last_month = npmJSON.downloads
                    })()
                }),
            )

            // Give some timeout to respect the server load.
            await new Promise((resolve) => setTimeout(resolve, 500))
        }
    }

    // Convert JSON to pretty string.
    const jsonString = JSON.stringify(jsonResult, null, 2)

    // Save JSON result in sync because no other instructions
    // that need to run in parallel.
    if (existsSync(databaseFile)) {
        truncateSync(databaseFile, 0)
    }
    console.log('Saving JSON object to', databaseFile)
    writeFileSync(databaseFile, jsonString)
    console.log('Saving', databaseFile, 'succeed')

    console.log('Robot has done its job')
})()
