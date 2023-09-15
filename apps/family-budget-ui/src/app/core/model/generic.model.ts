// code a generic class to be used by all models
export interface GenericModel<T> {
  error: any;
  message: string;
  data: T;
}
