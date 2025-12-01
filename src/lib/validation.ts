import { z } from 'zod'

const HOSTNAME_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

export const hostnameSchema = z.string()
  .min(1, 'Hostname cannot be empty')
  .max(255, 'Hostname is too long')
  .refine(
    (val) => !/[;&|`$()<>\\'"{}[\]]/.test(val),
    'Hostname contains invalid characters that could lead to command injection'
  )
  .refine(
    (val) => HOSTNAME_REGEX.test(val),
    'Invalid hostname format. Use only alphanumeric characters, hyphens, and dots'
  )
  .refine(
    (val) => !val.startsWith('-') && !val.endsWith('-'),
    'Hostname cannot start or end with a hyphen'
  )

export const ipAddressSchema = z.string()
  .min(7, 'IP address is too short')
  .max(15, 'IP address is too long')
  .refine(
    (val) => !/[;&|`$()<>\\'"{}[\]]/.test(val),
    'IP address contains invalid characters that could lead to command injection'
  )
  .refine(
    (val) => IPV4_REGEX.test(val),
    'Invalid IP address format. Must be a valid IPv4 address (e.g., 192.168.1.1)'
  )
  .refine(
    (val) => {
      const parts = val.split('.')
      return parts.every(part => {
        const num = parseInt(part, 10)
        return num >= 0 && num <= 255
      })
    },
    'IP address octets must be between 0 and 255'
  )

export const tagSchema = z.string()
  .min(1, 'Tag cannot be empty')
  .max(50, 'Tag is too long')
  .refine(
    (val) => !/[;&|`$()<>\\'"{}[\]]/.test(val),
    'Tag contains invalid characters that could lead to command injection'
  )

export const serverFormSchema = z.object({
  hostname: hostnameSchema,
  ipAddress: ipAddressSchema,
  tags: z.array(tagSchema).default([])
})

export type ServerFormData = z.infer<typeof serverFormSchema>

export const validateServerForm = (data: unknown) => {
  return serverFormSchema.safeParse(data)
}
