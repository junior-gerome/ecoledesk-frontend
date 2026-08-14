import { HttpContextToken } from '@angular/common/http';

/**
 * When set to true on an HttpRequest context, suppresses the global error toast
 * and loading indicator for that request.
 *
 * Usage:
 *   this.http.get(url, { context: new HttpContext().set(SILENT_REQUEST, true) })
 *
 * This replaces the old X-Silent-Error / X-Silent header approach, which caused
 * CORS preflight failures because custom headers must be whitelisted server-side.
 */
export const SILENT_REQUEST = new HttpContextToken<boolean>(() => false);
