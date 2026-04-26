export class UploadRejectedError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UploadRejectedError";
    this.status = status;
  }
}
