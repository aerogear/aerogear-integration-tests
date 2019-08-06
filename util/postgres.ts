import { Client } from "pg";

export const postgres = new Client({
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    user: process.env.PGUSER,
});
