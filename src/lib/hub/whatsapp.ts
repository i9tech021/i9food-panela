/**
 * Helpers de mensagens WhatsApp pré-preenchidas.
 * Cada Action Card usa a sua mensagem — mesma linha, contextos diferentes.
 */

export function waUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

export const WA_MESSAGES = {
  contact: `Olá!

Conheci o Panela da Roça através do Hub Digital.

Gostaria de falar com a equipe.

Como vocês podem me ajudar?`,

  reservation: `Olá!

Gostaria de realizar uma reserva no Panela da Roça.

Nome:
Telefone:
Quantidade de pessoas:
Data:
Horário desejado:
Observações:

Obrigado!`,

  jobs: `Olá!

Gostaria de enviar meu currículo para o Panela da Roça.

Nome:
Telefone:
Cidade:
Área de interesse:
Disponibilidade:

Em seguida enviarei meu currículo em PDF.

Obrigado!`,
} as const;

export type WhatsAppMessageKey = keyof typeof WA_MESSAGES;
