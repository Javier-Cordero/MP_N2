import { index, getUsers, exportUser, importUser, noExiste } from './controller.js'
import { PORT } from './config.js'
import http from 'http'
try {
  const server = http.createServer(async (req, res) => {
    const url = req.url
    const method = req.method
    if (method === 'GET') {
      switch (url) {
        case '/':
          index(req, res)
          break
        case '/api/usuarios':
          getUsers(req, res)
          break
        case '/api/usuarios/export':
          exportUser(req, res)
          break
        case '/api/usuarios/import':
          importUser(req, res)
          break
        default:
          noExiste(req, res)
          break
      }
    }
  })
  server.listen(PORT, () =>
    console.log(`servidor ejecutandose en http://localhost:${PORT}`)
  )
} catch (err) {
  console.error('nose pudo levantar el servidor', err)
  throw err
}
