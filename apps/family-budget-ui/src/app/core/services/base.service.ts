import { Injectable } from '@angular/core';
import { CoreConstant } from '../core.constant';

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  protected BASE_URL = process.env['NODE_ENV'] == 'development' ? CoreConstant.DEV_URL : CoreConstant.PROD_URL;

  constructor() { }

  protected getApiUrl(path: string) {
    return this.BASE_URL + path;
  }

  protected handleError(obj: any) {
    console.error(obj);
    return obj?.error?.error;
  }
}
