export type Message = {
  id: string;
  nom: string;
  email: string;
  message: string;
  envoyeLe: Date;
};

const messages: Message[] = [];

export function ajouterMessage(
  donnees: Omit<Message, "id" | "envoyeLe">
): Message {
  const nouveau: Message = {
    id: crypto.randomUUID(),
    envoyeLe: new Date(),
    ...donnees,
  };

  messages.push(nouveau);
  return nouveau;
}

export function listerMessages(): readonly Message[] {
  return messages;
}
