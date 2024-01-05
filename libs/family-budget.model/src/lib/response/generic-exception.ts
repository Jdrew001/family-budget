import { HttpException, HttpStatus } from "@nestjs/common";

export class GenericException extends HttpException {
    constructor(message: string, code: number = 400) {
        const msg = message ? message : 'Uh oh, something went wrong. I have notifed support!';
        super(
          {
            status: HttpStatus.BAD_REQUEST,
            message: msg
          },
          HttpStatus.BAD_REQUEST,
        );
      }
}