import { describe, expect, it } from 'vitest'
import { hostnameSchema, ipAddressSchema, tagSchema, validateServerForm } from './validation'

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: string) =>
  schema.safeParse(v).success

describe('ipAddressSchema', () => {
  it('accepts normal IPv4 addresses', () => {
    for (const ip of ['0.0.0.0', '10.0.1.10', '192.168.1.100', '172.16.0.15', '255.255.255.255']) {
      expect(ok(ipAddressSchema, ip)).toBe(true)
    }
  })

  it('rejects octets with leading zeros (octal under inet_aton)', () => {
    for (const ip of ['010.0.0.1', '10.00.1.10', '192.168.001.100', '00.0.0.0']) {
      expect(ok(ipAddressSchema, ip)).toBe(false)
    }
  })

  it('rejects out-of-range and injected values', () => {
    for (const ip of ['256.1.1.1', '1.2.3', '192.168.1.1; curl evil.com', '1.2.3.4\n']) {
      expect(ok(ipAddressSchema, ip)).toBe(false)
    }
  })
})

describe('hostnameSchema', () => {
  it('accepts DNS hostnames', () => {
    expect(ok(hostnameSchema, 'web-01.prod.example.com')).toBe(true)
  })

  it('rejects injection, leading hyphen and over-long names', () => {
    expect(ok(hostnameSchema, 'test; rm -rf /')).toBe(false)
    expect(ok(hostnameSchema, '-oProxyCommand=id')).toBe(false)
    expect(ok(hostnameSchema, `${'a'.repeat(63)}.`.repeat(4) + 'com')).toBe(false)
  })
})

describe('tagSchema', () => {
  it('accepts existing demo-style tags', () => {
    for (const tag of ['production', 'ssh-gateway', 'k8s', 'Staging', 'env:prod', 'v1.2']) {
      expect(ok(tagSchema, tag)).toBe(true)
    }
  })

  it('rejects whitespace, control characters, globs and shell metacharacters', () => {
    for (const tag of ['prod\n--become', 'a b', 'web*', '!prod', '~root', '$(id)', '-x', '']) {
      expect(ok(tagSchema, tag)).toBe(false)
    }
  })
})

describe('validateServerForm', () => {
  it('validates the full payload', () => {
    expect(validateServerForm({ hostname: 'db-01', ipAddress: '10.0.1.10', tags: ['production'] }).success).toBe(true)
    expect(validateServerForm({ hostname: 'db-01', ipAddress: '010.0.1.10', tags: [] }).success).toBe(false)
  })
})
