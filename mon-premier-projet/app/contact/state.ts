export type EtatFormulaire = {
  ok: boolean;
  message: string;
  erreurs?: {
    nom?: string[];
    email?: string[];
    message?: string[];
  };
};

export const ETAT_INITIAL: EtatFormulaire = {
  ok: false,
  message: "",
};
