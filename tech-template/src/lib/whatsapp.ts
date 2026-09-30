import { siteConfig } from '@/config/site'

/**
 * buildWhatsAppUrl — Construit une URL de commande WhatsApp pré-remplie
 *
 * Usage :
 * const url = buildWhatsAppUrl('Ventilateur sur Pied 16" — Réf. FS40-1688')
 * <a href={url} target="_blank">Commander via WhatsApp</a>
 */

export function buildWhatsAppUrl(message: string): string {
  const phone = siteConfig.contact.whatsapp.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

/**
 * buildOrderMessage — Construit un message de commande structuré
 */
export function buildOrderMessage({
  productName,
  ref,
  quantity = 1,
}: {
  productName: string
  ref?: string
  quantity?: number
}): string {
  const lines = [
    `Bonjour, je souhaite commander :`,
    ``,
    `- Produit : ${productName}`,
    ref ? `- Référence : ${ref}` : null,
    `- Quantité : ${quantity}`,
    ``,
    `Merci de me confirmer la disponibilité et le prix.`,
  ]
    .filter(Boolean)
    .join('\n')

  return lines
}
