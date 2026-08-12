import { TestBed } from "@angular/core/testing";
import { environment } from "@environments/environment";
import { API_BASE_URL_PROVIDER } from "./api-base-url";
import { API_BASE_URL } from "../tokens/api-base-url.token";

describe("API_BASE_URL_PROVIDER", () => {
  it("provides the configured API URL", () => {
    TestBed.configureTestingModule({
      providers: [API_BASE_URL_PROVIDER],
    });

    expect(TestBed.inject(API_BASE_URL)).toBe(environment.apiUrl);
  });
});
