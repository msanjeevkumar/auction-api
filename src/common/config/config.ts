export class Config {
  apiPort: number;
  environment: string;
  dbConnectionString: string;

  get isProduction() {
    return this.environment === 'production';
  }
}
