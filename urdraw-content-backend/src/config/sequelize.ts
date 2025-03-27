import { Sequelize } from "sequelize";
require("dotenv").config();

const sequelize = new Sequelize({
  database: String(process.env.DB_DATABASE),
  username: String(process.env.DB_USERNAME),
  password: String(process.env.DB_PASSWORD),
  host: String(process.env.DB_HOST),
  port: Number(process.env.DB_PORT),
  dialect: "postgres",
  logging: true,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Postgresql connected.");
  })
  .catch((error) => {
    console.error("PostgreSQL connect failed: ", error);
  });

export default sequelize;
