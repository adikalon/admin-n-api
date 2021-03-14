export abstract class SMSAbstract {
  abstract send(phone: number, message: string): Promise<void>;
}
