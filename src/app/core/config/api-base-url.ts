import { Provider } from "@angular/core";
import { environment } from "@environments/environment";
import { API_BASE_URL } from "../tokens/api-base-url.token";

export const API_BASE_URL_PROVIDER: Provider = {
  provide: API_BASE_URL,
  useValue: environment.apiUrl,
};
