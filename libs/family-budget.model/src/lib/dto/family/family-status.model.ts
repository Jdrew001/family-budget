import { AlertBoxDto } from "../shared/alert-box.model";

export interface FamilyStatusDto {
    familyId: string;
    dialogConfig: AlertBoxDto;
}