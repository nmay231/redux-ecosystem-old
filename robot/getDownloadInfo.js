const fetch = require( 'node-fetch').default
const get = require( 'download-stats').get
const {join, resolve} = require( 'path')
const {readFileSync, existsSync, truncateSync, writeFileSync} = require('fs')
const jsonResult = require( '../database.json')
const normalizeUrl = require( "normalize-url")

const databaseFile = join(__dirname, "../database_with_metadata.json")
const githubTokenBuffer = readFileSync(resolve(__dirname, '../githubToken.txt'))
const githubToken = Buffer.from(githubTokenBuffer).toString()

const fetchJSON = async (uri) => (await fetch(uri, { headers: { Authorization: "token " + githubToken } })).json()

const githubRepoRegex = /^https:\/\/github.com\/[^\s]+\/[^\s]+$/
const githubAPIURL = "https://api.github.com/"
// maybe change to use ora?
;(async () => {
  for (let category of jsonResult.categories) {
    for (let subcategory of category.subcategories) {
      await Promise.all(
        subcategory.repositories.map(repository => {
          return (async function() {
            if (
              repository === undefined ||
              repository.name === undefined ||
              repository.github_url === undefined ||
              !githubRepoRegex.test(repository.github_url) ||
              repository.description === undefined
            ) {
              console.log("Broken repository :", JSON.stringify(repository))
              return
            }

            // Parse repo detail from its URL.
            const normalizedUrl = normalizeUrl(repository.github_url)
            const splittedURL = normalizedUrl.split("/")
            const repoOwner = splittedURL[splittedURL.length - 2]
            const repoName = splittedURL[splittedURL.length - 1]
            const githubRepoURL =
              githubAPIURL + "repos/" + repoOwner + "/" + repoName

            // Get repo metadata from GitHub.
            console.log("Getting GitHub metadata of", repoName)
            const githubJSON = await fetchJSON(githubRepoURL)
            console.log("Got GitHub metadata of", repoName)

            // Get NPM downloads since last month.
            console.log("Getting NPM metadata of", repoName)
            const npmJSON = await new Promise(resolve => {
              get.lastMonth(repoName, function(err, result) {
                if (err) return resolve({ downloads: 0 })
                resolve(result)
              })
            })
            console.log("Got NPM metadata of", repoName)

            // Update JSON with additional metadata.
            repository.github_star = githubJSON.stargazers_count
            if (githubJSON.updated_at !== undefined) {
              repository.github_last_update = githubJSON.updated_at.split(
                'T'
              )[0]
            }
            repository.npm_download_since_last_month = npmJSON.downloads
          })()
        })
      )

      // Give some timeout to respect the server load.
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const jsonString = JSON.stringify(jsonResult, null, 2)

  // Save JSON result in sync because no other instructions
  // that need to run in parallel.
  if (existsSync(databaseFile)) {
    truncateSync(databaseFile, 0)
  }
  console.log("Saving JSON object to", databaseFile)
  writeFileSync(databaseFile, jsonString)
  console.log("Saving", databaseFile, "succeed")

  console.log("Robot has done its job")
})()