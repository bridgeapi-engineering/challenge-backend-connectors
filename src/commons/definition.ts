import { Router } from "express";

export abstract class Controller {

    protected path: string;
    private router: Router;

    constructor(path: string) {
        this.path = path;
        this.router = Router();
        this.initRoutes();
    }

    public abstract initRoutes(): void;

    public getRouter(): Router {
        return this.router;
    }

    public getPath(): string {
        return this.path;
    }
}

export interface SearchInput {
    name: string,
    siren?: string,
    adress?: Adress
}

export interface Adress {
    street?: string,
    zipcode: string,
    number?: string,
    city: string,
    longitude?: string,
    latitude?: string
}

export class CacheData {

    private secretRequest: string ;

    constructor() {}

    public setSecret(secret: string) {
        this.secretRequest = secret;
    }

    public getSecret(): string {
        return this.secretRequest;
    }
}


export enum PROVIDER {
    GOUV = 1,
    GOOGLE,
    GOOGLE_DETAILS,
    INSEE
}

export type PROVIDER_DATA = { [T in keyof typeof PROVIDER]: string };

export interface HeaderInsee {
    statut: number,
    message: string,
    total: number,
    debut: number,
    nombre: number
}