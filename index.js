import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { routes } from "./public/nav/routes.js"

import livereload from "livereload"
import connectLivereload from "connect-livereload"

const app = express()
const port = 3000

// Add livereload middleware
app.use(connectLivereload())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, "public")))

//logging the paths that are being requested
// Start livereload server
const liveReloadServer = livereload.createServer()
liveReloadServer.watch(path.join(__dirname, "public")) // Adjust the folder as needed

// Notify livereload server when files change
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/")
  }, 100)
})
app.use((req, res, next) => {
  console.log(`url: localhost:${port}${req.path}`)
  next()
})

// creating the API routes
for (let i = 0; i < routes.length; i++) {
  const route = routes[i]

  console.log(route)

  if (route.folderBase.toLowerCase() === "home") {
    app.get("/", (_, res) => {
      res.sendFile(path.join(__dirname, "public/pages", "home", "home.html"))
    })
  }

  app.get(route.link, (_, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "public/pages",
        route.folderBase.toLowerCase(),
        `${route.folderBase.toLowerCase()}.html`,
      ),
    )
  })
  if (route.children && route.children.length > 0) {
    for (let j = 0; j < route.children.length; j++) {
      const child = route.children[j]
      const link = route.link + child.link + "/"

      app.get(link, (_, res) => {
        res.sendFile(
          path.join(
            __dirname,
            "public/pages",
            route.folderBase.toLowerCase(),
            child.folderBase.toLowerCase(),
            `${child.folderBase.toLowerCase()}.html`,
          ),
        )
      })
    }
  }
}

app.use((_, res) => {
  res.status(404).sendFile(path.join(__dirname, "public/pages", "404.html"))
})

app.listen(port, () => {
  console.log(`Running on: localhost:${port}`)
})
