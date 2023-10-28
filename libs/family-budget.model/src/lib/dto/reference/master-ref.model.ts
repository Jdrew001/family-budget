import { TypeReference } from "./account-type-ref.model";

export interface MasterRefdata {
    accountTypes: Array<TypeReference>;
    frequencies: Array<TypeReference>;
}