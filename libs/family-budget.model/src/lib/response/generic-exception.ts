import { HttpException, HttpStatus } from "@nestjs/common";

export class GenericException extends HttpException {
    constructor(message: string, code: number) {
        const msg = message ? message : 'Uh oh, something went wrong. I have notifed support!';
        super(
          {
            status: HttpStatus.BAD_REQUEST,
            msg
          },
          HttpStatus.BAD_REQUEST,
        );
      }
}