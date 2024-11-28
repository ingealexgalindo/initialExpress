import mysql from "mysql2/promise";

export const getDBConnection = async () => {
  const connection = await mysql.createPool({
    host: "localhost",
    user: "aegalindof",
    password: "adminGalindo",
    database: "proyectos",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return connection;
};
