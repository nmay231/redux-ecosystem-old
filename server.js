const express = require("express")
const next = require("next")
const path = require('path')
const database = require("./database.json")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    const server = express()

    server.get("/api/topics", function(req, res) {
      const categories = database.categories.map(topic => {
        return {
          name: topic.name,
          slug: topic.slug,
          subcategories: topic.subcategories.map(x => {
            return {
              name: x.name,
              slug: x.slug
            }
          })
        }
      })

      res.send(categories)
    })

    server.get('/public/favicon.ico', (req, res) => {
      res.sendFile(path.resolve(__dirname,'public/favicon.ico'))
    })

    server.get("/api/:category/:subcategory", function(req, res) {
      const slug = `${req.params.category}/${req.params.subcategory}`

      const category = database.categories.filter(
        category => category.slug == req.params.category
      )[0]

      const subcategory = category.subcategories.filter(
        subcategory => subcategory.slug == slug
      )[0]

      res.send({ subcategory: subcategory, categoryName: category.name })
    })

    server.get("/api/:category", function(req, res) {
      const category = database.categories.filter(
        category => category.slug == req.params.category
      )

      res.json(category[0])
    })

    server.get("/:category", (req, res) => {
      const actualPage = "/topic"
      const queryParams = { category: req.params.category }

      app.render(req, res, actualPage, queryParams)
    })

    server.get("/:category/:subcategory", (req, res) => {
      const actualPage = "/subcategory"
      const queryParams = {
        slug: `${req.params.category}/${req.params.subcategory}`
      }

      app.render(req, res, actualPage, queryParams)
    })

    server.get("*", (req, res) => {
      return handle(req, res)
    })

    server.listen(3000, err => {
      if (err) throw err
      console.log("> Ready on http://localhost:3000")
    })
  })
  .catch(ex => {
    console.error(ex.stack)
    process.exit(1)
  })
