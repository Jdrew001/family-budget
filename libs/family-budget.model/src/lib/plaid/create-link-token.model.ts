export interface CreateLinkToken {
    user: PlaidUser;
    client_name: string;
    products: string[];
    country_codes: string[];
    language: string;
    webhook: string;
    required_if_supported_products: string[];
    redirect_uri: string;
}

export interface PlaidUser {
    client_user_id: string;
    phone_number: string;
}