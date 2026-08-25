export interface AppError {
  status: number;
  statusGroup: 'network' | '2xx' | '4xx' | '5xx' | 'unknown';
  message: string;
  code?: string;
  details?: unknown;
  isNetworkError: boolean;
}

export function toAppError(error: unknown, fallback = 'Une erreur est survenue'): AppError {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const httpError = error as {
      status?: number;
      error?: Record<string, unknown> & { message?: string; code?: string };
      message?: string;
    };
    const body = httpError.error;
    const validationMessage = extractValidationMessage(body);

    const status = httpError.status ?? 0;

    return {
      status,
      statusGroup: statusGroup(status),
      message:
        validationMessage ??
        (typeof body?.['message'] === 'string' ? body['message'] : undefined) ??
        statusMessage(status) ??
        httpError.message ??
        fallback,
      code: typeof body?.['code'] === 'string' ? body['code'] : undefined,
      details: body,
      isNetworkError: status === 0,
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      statusGroup: 'network',
      message: error.message || fallback,
      isNetworkError: true,
    };
  }

  return {
    status: 0,
    statusGroup: 'unknown',
    message: fallback,
    isNetworkError: false,
  };
}

function extractValidationMessage(body: Record<string, unknown> | undefined): string | undefined {
  if (!body) {
    return undefined;
  }

  const errors = body['errors'];
  if (Array.isArray(errors)) {
    const messages = errors
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (typeof item === 'object' && item !== null) {
          const entry = item as { defaultMessage?: string; message?: string };
          return entry.defaultMessage ?? entry.message;
        }
        return undefined;
      })
      .filter((value): value is string => Boolean(value));
    return messages.length ? messages.join(' ') : undefined;
  }

  if (typeof errors === 'object' && errors !== null) {
    const messages = Object.values(errors as Record<string, string>).filter(Boolean);
    return messages.length ? messages.join(' ') : undefined;
  }

  return undefined;
}

function statusGroup(status: number): AppError['statusGroup'] {
  if (status === 0) {
    return 'network';
  }
  if (status >= 200 && status < 300) {
    return '2xx';
  }
  if (status >= 400 && status < 500) {
    return '4xx';
  }
  if (status >= 500 && status < 600) {
    return '5xx';
  }
  return 'unknown';
}

function statusMessage(status: number): string | undefined {
  if (status === 0) {
    return 'Impossible de joindre le serveur. Verifiez que les services backend sont demarres.';
  }
  if (status === 400) return 'La requete est invalide. Verifiez les donnees saisies.';
  if (status === 401) return 'Session expiree. Connectez-vous a nouveau.';
  if (status === 403) return "Vous n'avez pas les droits necessaires pour cette action.";
  if (status === 404) return 'Ressource introuvable.';
  if (status === 409) return 'Conflit de donnees : cet element existe deja ou une contrainte est violee.';
  if (status === 422) return 'Donnees invalides. Verifiez les champs du formulaire.';
  if (status === 429) return 'Trop de tentatives. Reessayez dans quelques minutes.';
  if (status >= 500) return 'Erreur serveur. Reessayez plus tard ou contactez un administrateur.';
  return undefined;
}
