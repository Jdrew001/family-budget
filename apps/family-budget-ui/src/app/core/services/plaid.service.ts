import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { CoreConstant } from '../core.constant';
import { GenericModel } from '../model/generic.model';
import { PlaidModel } from '../model/plaid.model';
import { Observable } from 'rxjs';

@Injectable()
export class PlaidService extends BaseService {

  private _linkToken: string = '';
  get linkToken(): string { return this._linkToken; }

  constructor(
    private http: HttpClient
  ) {
    super();
  }

  getLinkToken() {
    return this.http.get(this.getApiUrl(CoreConstant.LINK_TOKEN)) as Observable<GenericModel<PlaidModel>>;
  }
}
