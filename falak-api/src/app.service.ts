import { Injectable } from '@nestjs/common';
import { createConnection } from 'mysql';
import * as MySQLEvents from '@rodrigogs/mysql-events';
import { config } from 'dotenv';

config();

@Injectable()
export class AppService {
  constructor() {
    const { DB_HOST, DB_USER, DB_PASS, DB_PORT } = process.env;
    this.connector(DB_HOST, DB_USER, DB_PASS, +DB_PORT)
      .then(() => console.log('Waiting for database events...'))
      .catch(console.error);
  }

  async connector(
    DB_HOST: string,
    DB_USER: string,
    DB_PASS: string,
    DB_PORT: number,
  ): Promise<void> {
    const connection = createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      port: DB_PORT,
    });

    const instance = new MySQLEvents(connection, {
      startAtEnd: true,
      excludedSchemas: { mysql: true },
    });

    await instance.start();

    instance.addTrigger({
      name: 'TEST',
      expression: '*',
      statement: MySQLEvents.STATEMENTS.ALL,
      onEvent: (event) => {
        // You will receive the events here
        console.log(event);
      },
    });

    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
  }
}
