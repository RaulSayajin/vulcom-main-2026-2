import argon2 from 'argon2'

// *** HASH DE SENHAS: configuração do Argon2id ***
// Parâmetros mínimos recomendados pela OWASP (Password Storage Cheat Sheet).
// A velocidade do cálculo é regulada por memória, iterações e paralelismo:
// quanto mais lento, mais caro fica um ataque de força bruta sobre os hashes.
const options = {
  type: argon2.argon2id,
  memoryCost: 19456,  // Memória utilizada, em KiB (19 MiB)
  timeCost: 2,        // Número de iterações
  parallelism: 1      // Número de threads
}

// Gera o hash da senha. O sal é aleatório e fica armazenado junto com o hash,
// no formato $argon2id$v=19$m=...,t=...,p=...$<sal>$<hash>
export function hashPassword(password) {
  return argon2.hash(password, options)
}

// Confere a senha informada contra o hash armazenado no BD
export async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password)
  }
  catch {
    // Hash em formato inválido (p. ex., senha antiga ainda em texto claro)
    return false
  }
}
