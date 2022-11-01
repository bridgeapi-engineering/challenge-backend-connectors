import express, { NextFunction, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import { Controller } from './commons/definition';

export class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  private initializeControllers(controllers: Controller[]) {
    for (const controller of controllers) {
      this.app.use(controller.getPath(), controller.getRouter());
    }
    this.app.use(this.errorHandler)
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }

  public errorHandler(err:any, req:Request, res:Response, next:NextFunction) {
    const error = err.toString();
    res.status(500);
    res.send({ error});
  }
}

export default App;