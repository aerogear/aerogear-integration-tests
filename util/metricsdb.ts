import { Client, QueryResult } from "pg";
import {
    METRICS_DB_DATABASE,
    METRICS_DB_HOST,
    METRICS_DB_PASSWORD,
    METRICS_DB_PORT,
    METRICS_DB_USER,
} from "./config";

export class MetricsDB {
    public client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public async deleteMobileAppMetrics() {
        await this.client.query("DELETE FROM mobileappmetrics");
    }

    public async selectMobileAppMetrics(): Promise<QueryResult> {
        return await this.client.query("SELECT * FROM mobileappmetrics");
    }
}

export async function initMetricsDB(): Promise<MetricsDB> {
    const client = new Client({
        database: METRICS_DB_DATABASE,
        host: METRICS_DB_HOST,
        password: METRICS_DB_PASSWORD,
        port: parseInt(METRICS_DB_PORT, 10),
        user: METRICS_DB_USER,
    });

    await client.connect();

    return new MetricsDB(client);
}
