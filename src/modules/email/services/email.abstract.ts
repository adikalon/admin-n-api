export abstract class EmailAbstract {
  abstract send(email: string, data: any): Promise<void>;
}
