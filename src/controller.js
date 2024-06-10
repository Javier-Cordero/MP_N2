import fs from 'fs/promises'
import { pool } from './db.js'
export const index = async (req, res) => {
  const contenido = await fs.readFile('./src/index.html', 'utf8')
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(contenido)
}
export const getUsers = async (req, res) => {
  const resultado = await pool.query('SELECT * FROM usuarios')
  const Users = resultado[0]
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(Users))
}
export const exportUser = async (req, res) => {
  const resultado = await pool.query('SELECT * FROM usuarios')
  const Users = resultado[0]
  const Columna = Object.keys(Users[0]).join(',')
  const fila = Users.reduce((accum, user) => {
    const cadena = `\n ${user.ID},${user.NOMBRE},${user.APELLIDO},${user.DIRECCION},${user.CORREO},${user.DNI},${user.EDAD},${user.FECHA_CREACION},${user.TELEFONO}`
    return accum + cadena
  }, '')
  const contenido = Columna + fila
  try {
    await fs.writeFile('./export/usuarios.csv', contenido)
    res.end(JSON.stringify({ message: 'usuarios exportado' }))
  } catch (error) {
    res.end(JSON.stringify({ message: 'error en la exportacion' }))
  }
}
export const importUser = async (req, res) => {
  const contenido = await fs.readFile('./import/usuarios.csv', 'utf8')
  const filas = contenido.split('\n')
  filas.shift()
  for (const f of filas) {
    const datos = f.split(',')
    const NOMBRE = datos[0]
    const APELLIDO = datos[1]
    const DIRECCION = datos[2]
    const CORREO = datos[3]
    const DNI = datos[4]
    const EDAD = datos[5]
    const FECHA_CREACION = datos[6]
    const TELEFONO = datos[7]
    try {
      await pool.execute('INSERT INTO usuarios (NOMBRE, APELLIDO, DIRECCION, CORREO, DNI, EDAD, FECHA_CREACION, TELEFONO) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [NOMBRE, APELLIDO, DIRECCION, CORREO, DNI, EDAD, FECHA_CREACION, TELEFONO])
      console.log('se inserto los datos de: ', NOMBRE)
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('no se inserto los datos de: ', NOMBRE)
        continue
      }
      res.writeFile(500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ message: 'error en la importacion' }))
    }
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: 'Datos importados correctamente' }))
}
export const noExiste = async (req, res) => {
  res.statusCode = 404
  res.end(JSON.stringify({ message: 'enlace no encontrado' }))
}
