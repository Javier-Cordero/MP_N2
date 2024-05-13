import mysql2 from "mysql2/promise";
import fs from "node:fs/promises";
import http from "node:http";
const pool = mysql2.createPool({
  host: "localhost",
  database: "mp_n2",
  user: "root",
  password: "",
});
try {
  const server = http.createServer(async (req, res) => {
    const url = req.url;
    const method = req.method;
    if (method === "GET") {
      switch (url) {
        case "/":
          const contenido = await fs.readFile("./index.html", "utf-8");
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(contenido);
          break;
        case "/api/usuarios":
          const resultado = await pool.query("SELECT * FROM usuarios");
          const data = resultado[0];
          const dataString = JSON.stringify(data);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(dataString);
          break;
        case "/api/usuarios/export":
          // Nombre del archivo CSV

          break;
        case "/api/usuarios/import":
          const contenido_i = await fs.readFile("./datos.csv", "utf-8");
          const filas = contenido_i.split("\n");
          const filasFiltradas = filas.filter((fila) => fila !== "");
          filasFiltradas.shift();
          filasFiltradas.forEach(async (fila) => {
            const columna = fila.split(",");
            const correo = columna[4];
            if (!correo.includes("@")) {
              console.log(
                "no se inserto una fila porque el correo no es valido"
              );
              return;
            }
            try {
              const resultado = await pool.execute(
                "INSERT INTO usuarios(id_usuario, nombres, apellidos, dirección, correo, dni, edad, fecha_creacion, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                columna
              );
              console.log(resultado);
            } catch (error) {
              console.log("no se inserto la fila: ", columna[0]);
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            const resString = JSON.stringify({ message: "Filas insertadas" });
            res.end(resString);
          });
          break;
        default:
          res.end("no encontro la ruta");
          break;
      }
    }
  });
  server.listen(3000, () =>
    console.log("servidor ejecutandose en http://localhost:3000")
  );
} catch (error) {
  // Manejar cualquier error que pueda ocurrir durante la consulta
  console.error("Error al consultar usuario:", error);
  throw error;
}
